package queue

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"sync"
	"sync/atomic"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
)

const (
	emailQueue            = "email_queue"
	emailDeadLetterQueue  = "email_queue.dlq"
	notificationQueue     = "notification_queue"
	notificationDeadQueue = "notification_queue.dlq"
)

var ErrRabbitMQClosed = errors.New("rabbitmq is closed")

// RabbitMQ keeps one AMQP connection, but gives publishing and each consumer
// their own channel. amqp091-go recovers these channel objects in place.
type RabbitMQ struct {
	conn                 *amqp.Connection
	publisher            *amqp.Channel
	emailConsumer        *amqp.Channel
	notificationConsumer *amqp.Channel

	closed    atomic.Bool
	closeOnce sync.Once
	monitorWG sync.WaitGroup
}

type loggingRecovery struct {
	delegate amqp.DefaultConnectionRecovery
}

func (r *loggingRecovery) OnConnectionClose(conn *amqp.Connection, err *amqp.Error) {
	logAMQPError("connection closed", err)
	r.delegate.OnConnectionClose(conn, err)
}

func (r *loggingRecovery) OnChannelClose(ch *amqp.Channel, err *amqp.Error) {
	logAMQPError("channel closed", err)
	r.delegate.OnChannelClose(ch, err)
}

func logAMQPError(message string, err *amqp.Error) {
	if err == nil {
		log.Printf("[RabbitMQ] %s", message)
		return
	}
	log.Printf("[RabbitMQ] %s: code=%d reason=%q recoverable=%t", message, err.Code, err.Reason, err.Recoverable())
}

func NewRabbitMQ(cfg *config.Config) (*RabbitMQ, error) {
	// The default recovery logger includes a redacted AMQP URL (and therefore
	// can still reveal the CloudAMQP username/host). Our hooks below emit the
	// useful error and state information without logging any URL components.
	amqp.SetLogger(amqp.NullLogger{})

	conn, err := amqp.DialConfig(cfg.RABBITMQ_URL, amqp.Config{
		Recovery: &amqp.Recovery{
			// The library has a finite retry count. A practically unbounded count
			// lets a production process survive a long broker outage; Close cancels
			// the retry loop immediately during shutdown.
			ReconnectionConfig: &amqp.ReconnectionConfig{
				MaxRetryCount: math.MaxInt,
				RetryInterval: 5 * time.Second,
			},
			ConnectionRecovery:   &loggingRecovery{},
			TopologyRecoveryMode: amqp.TopologyRecoveryAllEnabled,
			OnTopologyEntityError: func(_ *amqp.Connection, entity amqp.TopologyRecoveryEntity) bool {
				log.Printf("[RabbitMQ] topology recovery failed: %v", entity)
				return false
			},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("connect to RabbitMQ: %w", err)
	}

	rabbit := &RabbitMQ{conn: conn}
	cleanup := func() {
		if rabbit.notificationConsumer != nil {
			_ = rabbit.notificationConsumer.Close()
		}
		if rabbit.emailConsumer != nil {
			_ = rabbit.emailConsumer.Close()
		}
		if rabbit.publisher != nil {
			_ = rabbit.publisher.Close()
		}
		_ = conn.Close()
	}

	rabbit.publisher, err = conn.Channel()
	if err != nil {
		cleanup()
		return nil, fmt.Errorf("open RabbitMQ publisher channel: %w", err)
	}
	if err = declareQueues(rabbit.publisher); err != nil {
		cleanup()
		return nil, err
	}
	if err = rabbit.publisher.Confirm(false); err != nil {
		cleanup()
		return nil, fmt.Errorf("enable RabbitMQ publisher confirms: %w", err)
	}

	rabbit.emailConsumer, err = conn.Channel()
	if err != nil {
		cleanup()
		return nil, fmt.Errorf("open email consumer channel: %w", err)
	}
	if err = rabbit.emailConsumer.Qos(1, 0, false); err != nil {
		cleanup()
		return nil, fmt.Errorf("configure email consumer QoS: %w", err)
	}

	rabbit.notificationConsumer, err = conn.Channel()
	if err != nil {
		cleanup()
		return nil, fmt.Errorf("open notification consumer channel: %w", err)
	}
	if err = rabbit.notificationConsumer.Qos(1, 0, false); err != nil {
		cleanup()
		return nil, fmt.Errorf("configure notification consumer QoS: %w", err)
	}

	rabbit.monitor("connection", conn.NotifyStateChange)
	rabbit.monitor("publisher channel", rabbit.publisher.NotifyStateChange)
	rabbit.monitor("email consumer", rabbit.emailConsumer.NotifyStateChange)
	rabbit.monitor("notification consumer", rabbit.notificationConsumer.NotifyStateChange)
	log.Println("[RabbitMQ] connected")
	return rabbit, nil
}

func declareQueues(ch *amqp.Channel) error {
	// Main queues intentionally keep their existing arguments. RabbitMQ queue
	// arguments are immutable, so adding x-dead-letter-* arguments here would
	// make a rolling deployment fail against the already-existing queues.
	for _, name := range []string{emailQueue, notificationQueue, emailDeadLetterQueue, notificationDeadQueue} {
		if _, err := ch.QueueDeclare(name, true, false, false, false, nil); err != nil {
			return fmt.Errorf("declare RabbitMQ queue %q: %w", name, err)
		}
	}
	return nil
}

type stateNotifier func(chan *amqp.StateChanged)

func (r *RabbitMQ) monitor(name string, register stateNotifier) {
	changes := make(chan *amqp.StateChanged, 4)
	register(changes)
	r.monitorWG.Add(1)
	go func() {
		defer r.monitorWG.Done()
		for change := range changes {
			switch change.To {
			case amqp.StateReconnecting:
				log.Printf("[RabbitMQ] %s reconnecting...", name)
			case amqp.StateOpen:
				if change.From == amqp.StateReconnecting {
					log.Printf("[RabbitMQ] %s restored", name)
					for _, entity := range change.SkippedTopologyEntities {
						log.Printf("[RabbitMQ] skipped topology entity: %v", entity)
					}
				}
			case amqp.StateClosed:
				if change.Err != nil {
					log.Printf("[RabbitMQ] %s permanently closed: %v", name, change.Err)
				} else {
					log.Printf("[RabbitMQ] %s closed", name)
				}
			}
		}
	}()
}

func (r *RabbitMQ) Close() {
	r.closeOnce.Do(func() {
		r.closed.Store(true)
		if r.notificationConsumer != nil {
			_ = r.notificationConsumer.Close()
		}
		if r.emailConsumer != nil {
			_ = r.emailConsumer.Close()
		}
		if r.publisher != nil {
			_ = r.publisher.Close()
		}
		if r.conn != nil {
			_ = r.conn.Close()
		}
		r.monitorWG.Wait()
		log.Println("[RabbitMQ] closed")
	})
}

func (r *RabbitMQ) PublishEmail(ctx context.Context, body any) error {
	return r.publishJSON(ctx, emailQueue, body, nil)
}

func (r *RabbitMQ) PublishNotification(ctx context.Context, body any) error {
	return r.publishJSON(ctx, notificationQueue, body, nil)
}

func (r *RabbitMQ) DeadLetterEmail(ctx context.Context, body []byte, reason string) error {
	return r.publish(ctx, emailDeadLetterQueue, body, deadLetterHeaders(emailQueue, reason))
}

func (r *RabbitMQ) DeadLetterNotification(ctx context.Context, body []byte, reason string) error {
	return r.publish(ctx, notificationDeadQueue, body, deadLetterHeaders(notificationQueue, reason))
}

func deadLetterHeaders(source, reason string) amqp.Table {
	if len(reason) > 512 {
		reason = reason[:512]
	}
	return amqp.Table{"x-source-queue": source, "x-failure-reason": reason}
}

func (r *RabbitMQ) publishJSON(ctx context.Context, queueName string, body any, headers amqp.Table) error {
	data, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("encode %s message: %w", queueName, err)
	}
	return r.publish(ctx, queueName, data, headers)
}

func (r *RabbitMQ) publish(ctx context.Context, queueName string, body []byte, headers amqp.Table) error {
	if r.closed.Load() {
		return ErrRabbitMQClosed
	}
	confirmation, err := r.publisher.PublishWithDeferredConfirmWithContext(
		ctx,
		"",
		queueName,
		false,
		false,
		amqp.Publishing{
			Headers:      headers,
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now().UTC(),
		},
	)
	if err != nil {
		return fmt.Errorf("publish to %s: %w", queueName, err)
	}
	if confirmation == nil {
		return fmt.Errorf("publish to %s: publisher confirms are not enabled", queueName)
	}
	acknowledged, err := confirmation.WaitContext(ctx)
	if err != nil {
		return fmt.Errorf("wait for %s publisher confirmation: %w", queueName, err)
	}
	if !acknowledged {
		return fmt.Errorf("publish to %s was not acknowledged by RabbitMQ", queueName)
	}
	return nil
}

func (r *RabbitMQ) ConsumeEmail(ctx context.Context) (<-chan amqp.Delivery, error) {
	return r.consume(ctx, r.emailConsumer, emailQueue, "easybuy-email-worker")
}

func (r *RabbitMQ) ConsumeNotifications(ctx context.Context) (<-chan amqp.Delivery, error) {
	return r.consume(ctx, r.notificationConsumer, notificationQueue, "easybuy-notification-worker")
}

func (r *RabbitMQ) consume(ctx context.Context, ch *amqp.Channel, queueName, consumerName string) (<-chan amqp.Delivery, error) {
	if r.closed.Load() {
		return nil, ErrRabbitMQClosed
	}
	deliveries, err := ch.ConsumeWithContext(ctx, queueName, consumerName, false, false, false, false, nil)
	if err != nil {
		return nil, fmt.Errorf("consume %s: %w", queueName, err)
	}
	return deliveries, nil
}