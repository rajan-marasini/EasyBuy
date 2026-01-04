package product

import (
	"context"
)

type Service interface {
	GetAllProducts(ctx context.Context, req PaginationRequest) (*PaginatedProductsResponse, error)
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
