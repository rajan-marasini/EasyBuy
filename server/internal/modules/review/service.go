package review

import (
	"context"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	GetProductReviews(ctx context.Context, productID string) ([]models.Review, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetProductReviews(ctx context.Context, productID string) ([]models.Review, error) {
	return s.repo.GetProductReviews(ctx, productID)
}
