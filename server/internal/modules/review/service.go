package review

import (
	"context"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	GetProductReviews(ctx context.Context, productID string, page, limit int) (*PaginatedReviewResponse, error)
	CreateReview(ctx context.Context, review CreateReviewRequest, userID string) (*models.Review, error)
	UpdateReview(ctx context.Context, req UpdateReviewRequest, rID string) (*models.Review, error)
	DeleteReview(ctx context.Context, reviewID string) (bool, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetProductReviews(ctx context.Context, productID string, page, limit int) (*PaginatedReviewResponse, error) {
	reviews, total, err := s.repo.GetProductReviews(ctx, productID, page, limit)
	if err != nil {
		return nil, err
	}

	var reviewDTOs []ReviewResponseDTO
	for _, r := range reviews {
		reviewDTOs = append(reviewDTOs, ReviewResponseDTO{
			ID:        r.ID,
			Rating:    r.Rating,
			Comment:   r.Comment,
			ProductID: r.ProductID,
			User: ReviewUserDTO{
				Name:  r.User.Name,
				Email: r.User.Email,
			},
			CreatedAt: r.CreatedAt,
			UpdatedAt: r.UpdatedAt,
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &PaginatedReviewResponse{
		Data: reviewDTOs,
		Meta: PaginationMeta{
			CurrentPage: page,
			TotalPages:  totalPages,
			TotalItems:  total,
			Limit:       limit,
		},
	}, nil
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

func (s *service) UpdateReview(ctx context.Context, req UpdateReviewRequest, rID string) (*models.Review, error) {

	reviewID, err := uuid.Parse(rID)
	if err != nil {
		return nil, err
	}

	review := models.Review{
		Rating:  req.Rating,
		Comment: req.Comment,
	}

	updatedReview, err := s.repo.Update(ctx, review, reviewID.String())
	if err != nil {
		return nil, err
	}

	return updatedReview, nil
}

func (s *service) DeleteReview(ctx context.Context, reviewID string) (bool, error) {
	return s.repo.Delete(ctx, reviewID)
}
