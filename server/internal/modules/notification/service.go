package notification

import (
	"context"
	"time"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
)

type NotificationService interface {
	SendEmail(ctx context.Context, to, subject, body string) error
	SendRealtimeNotification(ctx context.Context, userID string, title, message string) error
	GetUserNotifications(ctx context.Context, userID string) ([]NotificationResponse, error)
	UpdateNotification(ctx context.Context, notificationID string, userID string) (*NotificationResponse, error)
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

func (s *notificationService) SendRealtimeNotification(ctx context.Context, userID string, title, message string) error {
	notification := models.Notification{
		Title:   title,
		Message: message,
		UserID:  userID,
	}

	if err := s.repo.Create(ctx, &notification); err != nil {
		return err
	}

	job := queue.NotificationJob{
		ID:        notification.ID,
		UserID:    notification.UserID,
		Title:     notification.Title,
		Message:   notification.Message,
		IsRead:    notification.IsRead,
		CreatedAt: notification.CreatedAt.Format(time.RFC3339),
	}
	return s.rabbit.PublishNotification(ctx, job)
}

func (s *notificationService) GetUserNotifications(ctx context.Context, userID string) ([]NotificationResponse, error) {
	notifications, err := s.repo.GetUserNotifications(ctx, userID)
	if err != nil {
		return nil, err
	}
	notiResp := []NotificationResponse{}

	for _, notification := range notifications {
		noti := NotificationResponse{
			ID:        notification.ID,
			Title:     notification.Title,
			Message:   notification.Message,
			IsRead:    notification.IsRead,
			CreatedAt: notification.CreatedAt,
		}
		notiResp = append(notiResp, noti)
	}

	return notiResp, nil
}

func (s *notificationService) UpdateNotification(ctx context.Context, notificationID string, userID string) (*NotificationResponse, error) {
	notification, err := s.repo.UpdateNotification(ctx, notificationID, userID)
	if err != nil {
		return nil, err
	}

	resp := NotificationResponse{
		ID:        notification.ID,
		Title:     notification.Title,
		Message:   notification.Message,
		IsRead:    notification.IsRead,
		CreatedAt: notification.CreatedAt,
	}

	return &resp, nil
}
