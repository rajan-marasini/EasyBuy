package notification

import (
	"context"

	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
)

type NotificationService interface {
	SendEmail(ctx context.Context, to, subject, body string) error
	SendRealtimeNotification(ctx context.Context, userID string, message interface{}) error
}

type notificationService struct {
	rabbit *queue.RabbitMQ
}

func NewNotificationService(rabbit *queue.RabbitMQ) NotificationService {
	return &notificationService{
		rabbit: rabbit,
	}
}

func (s *notificationService) SendEmail(ctx context.Context, to, subject, body string) error {
	job := queue.EmailJob{
		To:      to,
		Subject: subject,
		Body:    body,
	}
	return s.rabbit.PublishEmail(ctx, job)
}

func (s *notificationService) SendRealtimeNotification(ctx context.Context, userID string, message interface{}) error {
	return nil
}
