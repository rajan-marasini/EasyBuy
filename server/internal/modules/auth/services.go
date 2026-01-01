package auth

import (
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/errors"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

type Service struct {
	repo Repository
	cfg  *config.Config
}

func NewService(repo Repository, cfg *config.Config) *Service {
	return &Service{repo, cfg}
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

func (s *Service) LoginUser(req UserLoginRequest) (*UserLoginResponse, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, errors.BadRequest("Invalid credentials")
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.BadRequest("Invalid credentials")
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
