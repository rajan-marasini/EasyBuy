package category

import (
	"context"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	GetAll(ctx context.Context) ([]CategoryDTO, error)
	GetByID(ctx context.Context, id string) (CategoryDTO, error)
	Create(ctx context.Context, req CreateCategoryRequest) (CategoryDTO, error)
	Update(ctx context.Context, id string, req UpdateCategoryRequest) (CategoryDTO, error)
	Delete(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetAll(ctx context.Context) ([]CategoryDTO, error) {
	categories, err := s.repo.GetAllCategories(ctx)
	if err != nil {
		return nil, err
	}

	var categoryDTOs []CategoryDTO
	for _, c := range categories {
		categoryDTOs = append(categoryDTOs, ToCategoryDTO(&c))
	}

	return categoryDTOs, nil
}

func (s *service) GetByID(ctx context.Context, id string) (CategoryDTO, error) {
	category, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return CategoryDTO{}, err
	}
	return ToCategoryDTO(category), nil
}

func (s *service) Create(ctx context.Context, req CreateCategoryRequest) (CategoryDTO, error) {
	category := &models.Category{
		Name: req.Name,
	}

	createdCategory, err := s.repo.Create(ctx, category)
	if err != nil {
		return CategoryDTO{}, err
	}

	return ToCategoryDTO(createdCategory), nil
}

func (s *service) Update(ctx context.Context, id string, req UpdateCategoryRequest) (CategoryDTO, error) {
	category, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return CategoryDTO{}, err
	}

	category.Name = req.Name

	updatedCategory, err := s.repo.Update(ctx, category)
	if err != nil {
		return CategoryDTO{}, err
	}

	return ToCategoryDTO(updatedCategory), nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	_, err := s.repo.Delete(ctx, id)
	return err
}
