package worker

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/contrib/socketio"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification/email"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
	"github.com/rajan-marasini/EasyBuy/server/internal/ws"
)

const (
	consumerRestartDelay = time.Second
	emailMaxAttempts     = 3
)

type NotificationWorker struct {
	rabbit *queue.RabbitMQ
	wsm    *ws.WSManager
}

type EmailWorker struct {
	rabbit *queue.RabbitMQ
	cfg    *config.Config
}

func NewNotificationWorker(rabbit *queue.RabbitMQ, _ *config.Config, wsm *ws.WSManager) *NotificationWorker {
	return &NotificationWorker{rabbit: rabbit, wsm: wsm}
}

func NewEmailWorker(rabbit *queue.RabbitMQ, cfg *config.Config) *EmailWorker {
	return &EmailWorker{rabbit: rabbit, cfg: cfg}
}

// Start blocks until ctx is cancelled. The caller owns the goroutine.
func (w *NotificationWorker) Start(ctx context.Context) {
	for ctx.Err() == nil {
		deliveries, err := w.rabbit.ConsumeNotifications(ctx)
		if err != nil {
			log.Printf("[NotificationWorker] consumer unavailable: %v", err)
			if !wait(ctx, consumerRestartDelay) {
				return
			}
			continue
		}

		log.Println("[NotificationWorker] started")
		if w.consume(ctx, deliveries) {
			return
		}
		log.Println("[NotificationWorker] deliveries closed; resubscribing")
	}
}

func (w *NotificationWorker) consume(ctx context.Context, deliveries <-chan amqp.Delivery) bool {
	for {
		select {
		case <-ctx.Done():
			return true
		case delivery, ok := <-deliveries:
			if !ok {
				return false
			}

			var job queue.NotificationJob
			if err := json.Unmarshal(delivery.Body, &job); err != nil {
				w.deadLetterNotification(ctx, delivery, fmt.Sprintf("malformed JSON: %v", err))
				continue
			}

			connections := w.wsm.GetUserUUIDs(job.UserID)
			if len(connections) == 0 {
				// Realtime notifications are intentionally ephemeral. The durable
				// database record remains available for later retrieval.
				log.Printf("[NotificationWorker] no active connection for user %s; acknowledged", job.UserID)
				ack(delivery, "notification")
				continue
			}

			socketio.EmitToList(connections, delivery.Body)
			ack(delivery, "notification")
			log.Printf("[NotificationWorker] sent to %d connections for user %s", len(connections), job.UserID)
		}
	}
}

func (w *NotificationWorker) deadLetterNotification(ctx context.Context, delivery amqp.Delivery, reason string) {
	for {
		if err := w.rabbit.DeadLetterNotification(ctx, delivery.Body, reason); err == nil {
			ack(delivery, "notification")
			log.Printf("[NotificationWorker] moved poison message to notification_queue.dlq: %s", reason)
			return
		} else if errors.Is(err, context.Canceled) || ctx.Err() != nil {
			// Leave it unacknowledged; closing the consumer channel during
			// shutdown makes RabbitMQ requeue it for the next process.
			return
		} else {
			log.Printf("[NotificationWorker] DLQ unavailable; message remains unacknowledged: %v", err)
		}
		if !wait(ctx, consumerRestartDelay) {
			return
		}
	}
}

// Start blocks until ctx is cancelled. The caller owns the goroutine.
func (w *EmailWorker) Start(ctx context.Context) {
	for ctx.Err() == nil {
		deliveries, err := w.rabbit.ConsumeEmail(ctx)
		if err != nil {
			log.Printf("[EmailWorker] consumer unavailable: %v", err)
			if !wait(ctx, consumerRestartDelay) {
				return
			}
			continue
		}

		log.Println("[EmailWorker] started")
		if w.consume(ctx, deliveries) {
			return
		}
		log.Println("[EmailWorker] deliveries closed; resubscribing")
	}
}

func (w *EmailWorker) consume(ctx context.Context, deliveries <-chan amqp.Delivery) bool {
	for {
		select {
		case <-ctx.Done():
			return true
		case delivery, ok := <-deliveries:
			if !ok {
				return false
			}

			var job queue.EmailJob
			if err := json.Unmarshal(delivery.Body, &job); err != nil {
				w.deadLetterEmail(ctx, delivery, fmt.Sprintf("malformed JSON: %v", err))
				continue
			}

			err := w.sendWithRetry(ctx, job)
			if err != nil {
				if errors.Is(err, context.Canceled) || ctx.Err() != nil {
					return true
				}
				w.deadLetterEmail(ctx, delivery, err.Error())
				continue
			}

			ack(delivery, "email")
			log.Printf("[EmailWorker] email sent to %s", job.To)
		}
	}
}

func (w *EmailWorker) sendWithRetry(ctx context.Context, job queue.EmailJob) error {
	var lastErr error
	for attempt := 1; attempt <= emailMaxAttempts; attempt++ {
		if ctx.Err() != nil {
			return ctx.Err()
		}
		if err := email.SendEmail(w.cfg, job.To, job.Subject, job.Body); err == nil {
			return nil
		} else {
			lastErr = err
			log.Printf("[EmailWorker] send attempt %d/%d failed for %s: %v", attempt, emailMaxAttempts, job.To, err)
		}
		if attempt < emailMaxAttempts && !wait(ctx, time.Duration(attempt)*time.Second) {
			return ctx.Err()
		}
	}
	return fmt.Errorf("email delivery failed after %d attempts: %w", emailMaxAttempts, lastErr)
}

func (w *EmailWorker) deadLetterEmail(ctx context.Context, delivery amqp.Delivery, reason string) {
	for {
		if err := w.rabbit.DeadLetterEmail(ctx, delivery.Body, reason); err == nil {
			ack(delivery, "email")
			log.Printf("[EmailWorker] moved message to email_queue.dlq: %s", reason)
			return
		} else if errors.Is(err, context.Canceled) || ctx.Err() != nil {
			// Leave it unacknowledged so shutdown requeues it.
			return
		} else {
			log.Printf("[EmailWorker] DLQ unavailable; message remains unacknowledged: %v", err)
		}
		if !wait(ctx, consumerRestartDelay) {
			return
		}
	}
}

func ack(delivery amqp.Delivery, kind string) {
	if err := delivery.Ack(false); err != nil {
		log.Printf("[%sWorker] acknowledgement failed: %v", kind, err)
	}
}

func wait(ctx context.Context, delay time.Duration) bool {
	timer := time.NewTimer(delay)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}