package review

import (
	"time"

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

type ReviewUserDTO struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}

type ReviewResponseDTO struct {
	ID        uuid.UUID     `json:"id"`
	Rating    int           `json:"rating"`
	Comment   string        `json:"comment"`
	ProductID uuid.UUID     `json:"product_id"`
	User      ReviewUserDTO `json:"user"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	TotalPages  int   `json:"total_pages"`
	TotalItems  int64 `json:"total_items"`
	Limit       int   `json:"limit"`
}

type PaginatedReviewResponse struct {
	Data []ReviewResponseDTO `json:"data"`
	Meta PaginationMeta      `json:"meta"`
}
