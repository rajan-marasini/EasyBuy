package worker

import (
	"encoding/json"
	"log"

	"github.com/gofiber/contrib/socketio"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification/email"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
)

type NotificationWorker struct {
	rabbit *queue.RabbitMQ
	cfg    *config.Config
}

type EmailWorker struct {
	rabbit *queue.RabbitMQ
	cfg    *config.Config
}

func NewNotificationWorker(rabbit *queue.RabbitMQ, cfg *config.Config) *NotificationWorker {
	return &NotificationWorker{rabbit, cfg}
}

func NewEmailWorker(rabbit *queue.RabbitMQ, cfg *config.Config) *EmailWorker {
	return &EmailWorker{
		rabbit: rabbit,
		cfg:    cfg,
	}
}

func (w *NotificationWorker) Start() {
	msgs, err := w.rabbit.GetChannel().Consume(
		"notification_queue", // queue
		"",                   // consumer
		true,                 // auto-ack
		false,                // exclusive
		false,                // no-local
		false,                // no-wait
		nil,                  // args
	)

	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	go func() {
		for d := range msgs {
			var job queue.NotificationJob
			if err := json.Unmarshal(d.Body, &job); err != nil {
				log.Println("Error decoding notification job:", err.Error())
				continue
			}

			log.Println("Processing notification job for:", job.UserID)

			err := socketio.EmitTo(job.UserID, d.Body)

			if err != nil {
				// TODO: Imeplement dead letter queue
				log.Println("Error sending notification to:", job.UserID)
			} else {
				log.Println("Notification successfully sent to", job.UserID)
			}
		}
	}()
	log.Println("Notification Worker Started")
}

func (w *EmailWorker) Start() {
	msgs, err := w.rabbit.GetChannel().Consume(
		"email_queue", // queue
		"",            // consumer
		true,          // auto-ack
		false,         // exclusive
		false,         // no-local
		false,         // no-wait
		nil,           // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	go func() {
		for d := range msgs {
			var job queue.EmailJob
			err := json.Unmarshal(d.Body, &job)
			if err != nil {
				log.Printf("Error decoding email job: %v", err)
				continue
			}

			log.Printf("Processing email job for: %s", job.To)
			err = email.SendEmail(w.cfg, job.To, job.Subject, job.Body)
			if err != nil {
				log.Printf("Error sending email: %v", err)
				// Here we might want to implement a retry logic or dead-letter queue
				// For now, we just log the error
			} else {
				log.Printf("Email successfully sent to: %s", job.To)
			}
		}
	}()

	log.Println("Email worker started")
}
