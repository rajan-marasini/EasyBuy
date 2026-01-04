package user

import (
	"context"
	"errors"
	"math"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

type Service interface {
	GetAll(ctx context.Context, req PaginationRequest) (PaginatedUsersResponse, error)
	GetByID(ctx context.Context, id string) (UserDTO, error)
	Create(ctx context.Context, req CreateUserRequest) (UserDTO, error)
	Update(ctx context.Context, id string, req UpdateUserRequest) (UserDTO, error)
	Delete(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetAll(ctx context.Context, req PaginationRequest) (PaginatedUsersResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}

	users, total, err := s.repo.GetAll(ctx, req.Page, req.Limit)
	if err != nil {
		return PaginatedUsersResponse{}, err
	}

	var userDTOs []UserDTO
	for _, u := range users {
		userDTOs = append(userDTOs, ToUserDTO(&u))
	}

	totalPages := int(math.Ceil(float64(total) / float64(req.Limit)))

	return PaginatedUsersResponse{
		Meta: PaginationMeta{
			CurrentPage: req.Page,
			Limit:       req.Limit,
			TotalItems:  total,
			TotalPages:  totalPages,
		},
		Data: userDTOs,
	}, nil
}

func (s *service) GetByID(ctx context.Context, id string) (UserDTO, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return UserDTO{}, err
	}
	return ToUserDTO(user), nil
}

func (s *service) Create(ctx context.Context, req CreateUserRequest) (UserDTO, error) {
	// Check if user already exists
	existing, _ := s.repo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return UserDTO{}, errors.New("email already exists")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return UserDTO{}, err
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Phone:    req.Phone,
		Role:     req.Role,
	}

	if user.Role == "" {
		user.Role = "user"
	}

	createdUser, err := s.repo.Create(ctx, user)
	if err != nil {
		return UserDTO{}, err
	}

	return ToUserDTO(createdUser), nil
}

func (s *service) Update(ctx context.Context, id string, req UpdateUserRequest) (UserDTO, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return UserDTO{}, err
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.Status != "" {
		user.Status = req.Status
	}

	updatedUser, err := s.repo.Update(ctx, user)
	if err != nil {
		return UserDTO{}, err
	}

	return ToUserDTO(updatedUser), nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
