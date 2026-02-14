package product

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	GetAllProducts(ctx context.Context, req PaginationRequest) (*PaginatedProductsResponse, error)
	GetProductById(ctx context.Context, id string) (*models.Product, error)
	CreateProduct(ctx context.Context, req CreateProductRequest, userID string) (*ProductDTO, error)
	UpdateProduct(ctx context.Context, id string, req UpdateProductRequest, userID string) (*ProductDTO, error)
	DeleteProduct(ctx context.Context, id string, userID string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetAllProducts(ctx context.Context, req PaginationRequest) (*PaginatedProductsResponse, error) {
	products, total, err := s.repo.GetAllProducts(ctx, req.Page, req.Limit, req.Search)
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

func (s *service) CreateProduct(ctx context.Context, req CreateProductRequest, userID string) (*ProductDTO, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	product := &models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		Images:      req.Images,
		IsActive:    req.IsActive,
		UserID:      uid,
		Brand:       req.Brand,
	}

	if req.CategoryID != uuid.Nil {
		product.CategoryID = &req.CategoryID
	}

	createdProduct, err := s.repo.Create(ctx, product)
	if err != nil {
		return nil, err
	}

	dto := ToProductDTO(createdProduct)
	return &dto, nil
}

func (s *service) UpdateProduct(ctx context.Context, id string, req UpdateProductRequest, userID string) (*ProductDTO, error) {
	product, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if product.UserID.String() != userID {
		return nil, fmt.Errorf("unauthorized to update this product")
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}
	if len(req.Images) > 0 {
		product.Images = req.Images
	}
	if req.Brand != "" {
		product.Brand = req.Brand
	}
	if req.CategoryID != uuid.Nil {
		product.CategoryID = &req.CategoryID
	}

	updatedProduct, err := s.repo.Update(ctx, product)
	if err != nil {
		return nil, err
	}

	dto := ToProductDTO(updatedProduct)
	return &dto, nil
}

func (s *service) DeleteProduct(ctx context.Context, id string, userID string) error {

	product, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if product == nil {
		return nil
	}

	_, err = s.repo.Delete(ctx, id)
	return err
}
