package user

import (
	"time"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type PaginationRequest struct {
	Page   int    `query:"page" json:"page" validate:"min=1"`
	Limit  int    `query:"limit" json:"limit" validate:"min=1,max=100"`
	Search string `query:"search" json:"search"`
}

type CreateUserRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Phone    string `json:"phone" validate:"omitempty"`
	Role     string `json:"role" validate:"omitempty,oneof=user admin"`
}

type UpdateUserRequest struct {
	Name   string `json:"name" validate:"omitempty,min=2,max=100"`
	Phone  string `json:"phone" validate:"omitempty"`
	Role   string `json:"role" validate:"omitempty,oneof=user admin"`
	Status string `json:"status" validate:"omitempty,oneof=active inactive"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	Limit       int   `json:"limit"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
}

type PaginatedUsersResponse struct {
	Meta PaginationMeta `json:"meta"`
	Data []UserDTO      `json:"data"`
}

type UserDTO struct {
	ID              uuid.UUID  `json:"id"`
	Name            string     `json:"name"`
	Email           string     `json:"email"`
	Phone           string     `json:"phone"`
	Role            string     `json:"role"`
	Status          string     `json:"status"`
	IsVerified      bool       `json:"is_verified"`
	EmailVerifiedAt *time.Time `json:"email_verified_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
}

func ToUserDTO(u *models.User) UserDTO {
	return UserDTO{
		ID:              u.ID,
		Name:            u.Name,
		Email:           u.Email,
		Phone:           u.Phone,
		Role:            u.Role,
		Status:          u.Status,
		IsVerified:      u.IsVerified,
		EmailVerifiedAt: u.EmailVerifiedAt,
		CreatedAt:       u.CreatedAt,
		UpdatedAt:       u.UpdatedAt,
		LastLoginAt:     u.LastLoginAt,
	}
}
