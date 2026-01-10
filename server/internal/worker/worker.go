package worker

import (
	"encoding/json"
	"log"

	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification/email"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
)

type EmailWorker struct {
	rabbit *queue.RabbitMQ
	cfg    *config.Config
}

func NewEmailWorker(rabbit *queue.RabbitMQ, cfg *config.Config) *EmailWorker {
	return &EmailWorker{
		rabbit: rabbit,
		cfg:    cfg,
	}
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
