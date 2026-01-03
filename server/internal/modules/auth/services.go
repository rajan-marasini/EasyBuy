package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

type Service interface {
	RegisterUser(req UserRegisterRequest) (*UserRegisterResponse, error)
	LoginUser(req UserLoginRequest) (*UserLoginResponse, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
}

func NewService(repo Repository, cfg *config.Config) Service {
	return &service{repo, cfg}
}

func (s *service) RegisterUser(req UserRegisterRequest) (*UserRegisterResponse, error) {
	userAlreadyExist, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if userAlreadyExist != nil {
		return nil, fiber.NewError(200, "User already exist")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}
	createdUser, err := s.repo.Create(user)
	if err != nil {
		return nil, err
	}

	return &UserRegisterResponse{
		ID:    createdUser.ID.String(),
		Name:  createdUser.Name,
		Email: createdUser.Email,
		Role:  createdUser.Role,
	}, nil
}

func (s *service) LoginUser(req UserLoginRequest) (*UserLoginResponse, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, fiber.NewError(200, "Invalid credentials")
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, fiber.NewError(200, "Invalid credentials")
	}

	token, err := utils.GenerateToken(user.ID.String(), user.Email, user.Role, s.cfg.JWT_SECRET)
	if err != nil {
		return nil, err
	}

	if err := s.repo.UpdateLoginTime(user.ID.String()); err != nil {
		return nil, err
	}

	return &UserLoginResponse{
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
		Token: token,
	}, nil

}
