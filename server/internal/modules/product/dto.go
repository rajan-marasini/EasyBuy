package product

import (
	"time"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type PaginationRequest struct {
	Page  int `query:"page" json:"page" validate:"min=1"`
	Limit int `query:"limit" json:"limit" validate:"min=1,max=100"`
}

type CreateProductRequest struct {
	Name        string  `json:"name" validate:"required,min=3,max=255"`
	Description string  `json:"description" validate:"omitempty"`
	Price       float64 `json:"price" validate:"required,min=0"`
	Stock       int     `json:"stock" validate:"required,min=0"`
	ImageURL    string  `json:"image_url" validate:"omitempty,url"`
	IsActive    bool    `json:"is_active" validate:"omitempty"`
	Brand       string  `json:"brand"`
}

type UpdateProductRequest struct {
	Name        string  `json:"name" validate:"omitempty,min=3,max=255"`
	Description string  `json:"description" validate:"omitempty"`
	Price       float64 `json:"price" validate:"omitempty,min=0"`
	Stock       int     `json:"stock" validate:"omitempty,min=0"`
	ImageURL    string  `json:"image_url" validate:"omitempty,url"`
	IsActive    bool    `json:"is_active" validate:"omitempty"`
	Brand       string  `json:"brand"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	Limit       int   `json:"limit"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
}

type ProductDTO struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	ImageURL    string    `json:"image_url"`
	IsActive    bool      `json:"is_active"`
	UserID      uuid.UUID `json:"user_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Brand       string    `json:"brand"`
}

type PaginatedProductsResponse struct {
	Meta PaginationMeta `json:"meta"`
	Data []ProductDTO   `json:"data"`
}

func ToProductDTO(p *models.Product) ProductDTO {
	return ProductDTO{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		Price:       p.Price,
		Stock:       p.Stock,
		ImageURL:    p.ImageURL,
		IsActive:    p.IsActive,
		UserID:      p.UserID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		Brand:       p.Brand,
	}
}
