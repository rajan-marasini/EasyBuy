package category

import (
	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type ProductSlimDTO struct {
	ID            *uuid.UUID `json:"id,omitempty"`
	Name          string     `json:"name"`
	Description   string     `json:"description"`
	Price         float64    `json:"price"`
	Stock         int        `json:"stock"`
	Images        []string   `json:"images"`
	IsActive      bool       `json:"is_active"`
	Brand         string     `json:"brand"`
	AverageRating float64    `json:"average_rating"`
	TotalReviews  int        `json:"total_reviews"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=255"`
}

type UpdateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=255"`
}

type CategoryDTO struct {
	ID       *uuid.UUID       `json:"id,omitempty"`
	Name     string           `json:"name"`
	Products []ProductSlimDTO `json:"products,omitempty"`
}

func ToCategoryDTO(c *models.Category) CategoryDTO {
	var productDTOs []ProductSlimDTO
	for _, p := range c.Products {
		var pID *uuid.UUID
		if p.ID != uuid.Nil {
			pID = &p.ID
		}
		productDTOs = append(productDTOs, ProductSlimDTO{
			ID:            pID,
			Name:          p.Name,
			Description:   p.Description,
			Price:         p.Price,
			Stock:         p.Stock,
			Images:        p.Images,
			IsActive:      p.IsActive,
			Brand:         p.Brand,
			AverageRating: p.AverageRating,
			TotalReviews:  p.TotalReviews,
		})
	}

	var cID *uuid.UUID
	if c.ID != uuid.Nil {
		cID = &c.ID
	}

	return CategoryDTO{
		ID:       cID,
		Name:     c.Name,
		Products: productDTOs,
	}
}
