package category

import (
	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type ProductSlimDTO struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	ImageURL    string    `json:"image_url"`
	IsActive    bool      `json:"is_active"`
	Brand       string    `json:"brand"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=255"`
}

type UpdateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=255"`
}

type CategoryDTO struct {
	ID       uuid.UUID        `json:"id"`
	Name     string           `json:"name"`
	Products []ProductSlimDTO `json:"products,omitempty"`
}

func ToCategoryDTO(c *models.Category) CategoryDTO {
	var productDTOs []ProductSlimDTO
	for _, p := range c.Products {
		productDTOs = append(productDTOs, ProductSlimDTO{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Price:       p.Price,
			Stock:       p.Stock,
			ImageURL:    p.ImageURL,
			IsActive:    p.IsActive,
			Brand:       p.Brand,
		})
	}

	return CategoryDTO{
		ID:       c.ID,
		Name:     c.Name,
		Products: productDTOs,
	}
}
