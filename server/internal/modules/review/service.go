package review

import (
	"context"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	GetProductReviews(ctx context.Context, productID string) ([]models.Review, error)
	CreateReview(ctx context.Context, review CreateReviewRequest, userID string) (*models.Review, error)
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

func (s *service) CreateReview(ctx context.Context, req CreateReviewRequest, userID string) (*models.Review, error) {

	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	reviewReq := models.Review{
		Rating:    req.Rating,
		Comment:   req.Comment,
		ProductID: req.ProductID,
		UserID:    uid,
	}

	review, err := s.repo.Create(ctx, reviewReq)
	if err != nil {
		return nil, err
	}

	return review, nil
}
