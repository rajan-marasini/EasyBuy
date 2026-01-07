package product

import (
	"time"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/category"
)

type PaginationRequest struct {
	Page  int `query:"page" json:"page" validate:"min=1"`
	Limit int `query:"limit" json:"limit" validate:"min=1,max=100"`
}

type CreateProductRequest struct {
	Name        string    `json:"name" form:"name" validate:"required,min=3,max=255"`
	Description string    `json:"description" form:"description" validate:"omitempty"`
	Price       float64   `json:"price" form:"price" validate:"required,min=0"`
	Stock       int       `json:"stock" form:"stock" validate:"required,min=0"`
	Images      []string  `json:"images" form:"images" validate:"omitempty"`
	IsActive    bool      `json:"is_active" form:"isActive" validate:"omitempty"`
	Brand       string    `json:"brand" form:"brand"`
	CategoryID  uuid.UUID `json:"category_id" form:"category_id" validate:"omitempty"`
}

type UpdateProductRequest struct {
	Name        string    `json:"name" form:"name" validate:"omitempty,min=3,max=255"`
	Description string    `json:"description" form:"description" validate:"omitempty"`
	Price       float64   `json:"price" form:"price" validate:"omitempty,min=0"`
	Stock       int       `json:"stock" form:"stock" validate:"omitempty,min=0"`
	Images      []string  `json:"images" form:"images" validate:"omitempty"`
	IsActive    bool      `json:"is_active" form:"isActive" validate:"omitempty"`
	Brand       string    `json:"brand" form:"brand"`
	CategoryID  uuid.UUID `json:"category_id" form:"category_id" validate:"omitempty"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	Limit       int   `json:"limit"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
}

type ProductDTO struct {
	ID            uuid.UUID            `json:"id"`
	Name          string               `json:"name"`
	Description   string               `json:"description"`
	Price         float64              `json:"price"`
	Stock         int                  `json:"stock"`
	Images        []string             `json:"images"`
	IsActive      bool                 `json:"is_active"`
	AverageRating float64              `json:"average_rating"`
	TotalReviews  int                  `json:"total_reviews"`
	UserID        uuid.UUID            `json:"user_id"`
	CategoryID    uuid.UUID            `json:"category_id"`
	Category      category.CategoryDTO `json:"category"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
	Brand         string               `json:"brand"`
}

type PaginatedProductsResponse struct {
	Meta PaginationMeta `json:"meta"`
	Data []ProductDTO   `json:"data"`
}

func ToProductDTO(p *models.Product) ProductDTO {
	return ProductDTO{
		ID:            p.ID,
		Name:          p.Name,
		Description:   p.Description,
		Price:         p.Price,
		Stock:         p.Stock,
		Images:        p.Images,
		IsActive:      p.IsActive,
		AverageRating: p.AverageRating,
		TotalReviews:  p.TotalReviews,
		UserID:        p.UserID,
		CategoryID:    p.CategoryID,
		Category:      category.ToCategoryDTO(&p.Category),
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
		Brand:         p.Brand,
	}
}
