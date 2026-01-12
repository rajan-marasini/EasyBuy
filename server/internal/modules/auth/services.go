package auth

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification/email"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

type Service interface {
	RegisterUser(req UserRegisterRequest) (*UserRegisterResponse, error)
	LoginUser(req UserLoginRequest) (*UserLoginResponse, error)
	GetUserProfile(userID string) (*UserProfileResponse, error)
	VerifyEmail(token, email string) error
	ForgotPassword(email string) error
	ResetPassword(req ResetPasswordRequest) error
}

type service struct {
	repo   Repository
	cfg    *config.Config
	notify notification.NotificationService
}

func NewService(repo Repository, cfg *config.Config, notify notification.NotificationService) Service {
	return &service{repo, cfg, notify}
}

func (s *service) RegisterUser(req UserRegisterRequest) (*UserRegisterResponse, error) {
	userAlreadyExist, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if userAlreadyExist != nil {
		return nil, fiber.NewError(400, "User already exist")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	token := uuid.New().String()

	user := &models.User{
		Name:                   req.Name,
		Email:                  req.Email,
		Password:               hashedPassword,
		EmailVerificationToken: token,
	}
	createdUser, err := s.repo.Create(user)
	if err != nil {
		return nil, err
	}

	verifyURL := s.cfg.API_URL + "/auth/verify-email?token=" + token + "&email=" + createdUser.Email
	emailBody, err := email.RenderTemplate("verify_email.tmpl", map[string]string{
		"Name":                  createdUser.Name,
		"EmailVerificationLink": verifyURL,
	})
	if err != nil {
		log.Println("Error rendering email template: ", err.Error())
	}

	_ = s.notify.SendEmail(context.Background(), createdUser.Email, "Verify your email", emailBody)

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
		return nil, fiber.NewError(400, "Invalid credentials")
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, fiber.NewError(400, "Invalid credentials")
	}

	token, err := utils.GenerateToken(user.ID.String(), user.Email, user.Role, s.cfg.JWT_SECRET)
	if err != nil {
		return nil, err
	}

	if err := s.repo.UpdateLoginTime(user.ID.String()); err != nil {
		return nil, err
	}

	return &UserLoginResponse{
		ID:         user.ID.String(),
		Name:       user.Name,
		Email:      user.Email,
		Role:       user.Role,
		Token:      token,
		IsVerified: user.IsVerified,
	}, nil
}

func (s *service) GetUserProfile(userID string) (*UserProfileResponse, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fiber.NewError(404, "User not found")
	}

	return &UserProfileResponse{
		ID:              user.ID,
		Name:            user.Name,
		Email:           user.Email,
		Status:          user.Status,
		Phone:           user.Phone,
		Role:            user.Role,
		IsVerified:      user.IsVerified,
		LastLoginAt:     user.LastLoginAt,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		EmailVerifiedAt: user.EmailVerifiedAt,
	}, nil
}

func (s *service) VerifyEmail(token, email string) error {
	if token == "" || email == "" {
		return fiber.NewError(400, "Invalid verification link")
	}

	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return err
	}
	if user == nil {
		return fiber.NewError(400, "Invalid token or email")
	}

	if user.IsVerified {
		return fiber.NewError(400, "Email already verified")
	}

	if _, err := s.repo.VerifyEmailToken(token, email); err != nil {
		return fiber.NewError(400, "Invalid verification token", err.Error())
	}
	return nil
}

func (s *service) ForgotPassword(emailStr string) error {
	user, err := s.repo.FindByEmail(emailStr)
	if err != nil {
		return err
	}
	if user == nil {
		return fiber.NewError(404, "User not found")
	}

	otp := utils.GenerateOTP(6)
	if err := s.repo.SetPasswordResetOTP(emailStr, otp); err != nil {
		return err
	}

	emailBody, err := email.RenderTemplate("forgot_password.tmpl", map[string]string{
		"Name": user.Name,
		"OTP":  otp,
	})
	if err != nil {
		log.Println("Error rendering email template: ", err.Error())
	}

	_ = s.notify.SendEmail(context.Background(), user.Email, "Reset your password", emailBody)

	return nil
}

func (s *service) ResetPassword(req ResetPasswordRequest) error {
	savedOTP, err := s.repo.GetPasswordResetOTP(req.Email)
	if err != nil {
		return fiber.NewError(400, err.Error())
	}

	if savedOTP != req.OTP {
		return fiber.NewError(400, "Invalid OTP")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	if err := s.repo.UpdatePassword(req.Email, hashedPassword); err != nil {
		return err
	}

	user, err := s.repo.FindByEmail(req.Email)
	if err == nil && user != nil {
		emailBody, err := email.RenderTemplate("password_reset_success.tmpl", map[string]string{
			"Name": user.Name,
		})
		if err == nil {
			_ = s.notify.SendEmail(context.Background(), user.Email, "Password Reset Successful", emailBody)
		}

	}

	return nil
}
