package product

import "github.com/rajan-marasini/EasyBuy/server/internal/models"

type Service interface {
	GetAllProducts() ([]models.Product, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetAllProducts() ([]models.Product, error) {
	return s.repo.GetAllProducts()
}
