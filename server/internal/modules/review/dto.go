package review

import (
	"github.com/google/uuid"
)

type CreateReviewRequest struct {
	Rating    int       `json:"rating" validate:"required,min=1,max=5"`
	Comment   string    `json:"comment" validate:"required,min=10,max=1000"`
	ProductID uuid.UUID `json:"product_id" validate:"required"`
}

type UpdateReviewRequest struct {
	Rating  int    `json:"rating" validate:"omitempty,min=1,max=5"`
	Comment string `json:"comment" validate:"omitempty,min=10,max=1000"`
}
