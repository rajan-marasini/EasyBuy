package product

import (
	"context"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	GetAllProducts(ctx context.Context, req PaginationRequest) (*PaginatedProductsResponse, error)
	GetProductById(ctx context.Context, id string) (*models.Product, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetAllProducts(ctx context.Context, req PaginationRequest) (*PaginatedProductsResponse, error) {
	products, total, err := s.repo.GetAllProducts(ctx, req.Page, req.Limit)
	if err != nil {
		return nil, err
	}

	productDTOs := make([]ProductDTO, len(products))
	for i, p := range products {
		productDTOs[i] = ToProductDTO(&p)
	}

	totalPages := int(total) / req.Limit
	if int(total)%req.Limit != 0 {
		totalPages++
	}

	return &PaginatedProductsResponse{
		Meta: PaginationMeta{
			CurrentPage: req.Page,
			Limit:       req.Limit,
			TotalItems:  total,
			TotalPages:  totalPages,
		},
		Data: productDTOs,
	}, nil
}

func (s *service) GetProductById(ctx context.Context, id string) (*models.Product, error) {
	return s.repo.GetByID(ctx, id)
}
