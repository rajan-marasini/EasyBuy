package auth

import (
	"github.com/rajan-marasini/EasyBuy/server/internal/errors"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo}
}

func (s *Service) RegisterUser(req UserRegisterRequest) (*UserRegisterResponse, error) {
	userAlreadyExist, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if userAlreadyExist != nil {
		return nil, errors.BadRequest("User already exists")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}
	req.Password = hashedPassword

	user, err := s.repo.Create(req)
	if err != nil {
		return nil, err
	}

	return &UserRegisterResponse{
		ID:    user.ID.String(),
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}, nil

}
