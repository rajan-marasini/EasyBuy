package notification

import (
	"context"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
)

type NotificationService interface {
	SendEmail(ctx context.Context, to, subject, body string) error
	SendRealtimeNotification(ctx context.Context, userID string, message, title string) error
}

type notificationService struct {
	repo   Repository
	rabbit *queue.RabbitMQ
}

func NewNotificationService(repo Repository, rabbit *queue.RabbitMQ) NotificationService {
	return &notificationService{
		repo:   repo,
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

func (s *notificationService) SendRealtimeNotification(ctx context.Context, userID string, message, title string) error {
	notification := models.Notification{
		Title:   title,
		Message: message,
		UserID:  userID,
	}

	if err := s.repo.Create(ctx, &notification); err != nil {
		return err
	}

	job := queue.NotificationJob{
		UserID:  notification.UserID,
		Title:   notification.Title,
		Message: notification.Message,
	}
	return s.rabbit.PublishNotification(ctx, job)
}
