package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;index" json:"id"`

	// Basic Info
	Name  string `gorm:"size:100;not null" json:"name"`
	Email string `gorm:"size:255;uniqueIndex;not null;index" json:"email"`
	Phone string `gorm:"size:20" json:"phone"`

	// Authentication
	Password   string `gorm:"not null" json:"password"`
	IsVerified bool   `gorm:"default:false" json:"is_verified"`

	EmailVerifiedAt        *time.Time `json:"email_verified_at,omitempty"`
	PasswordResetToken     string     `gorm:"size:255" json:"-"`
	PasswordResetExpiresAt *time.Time `json:"-"`

	// Role & Status
	Role   string `gorm:"size:20;default:user" json:"role"` // user, admin
	Status string `gorm:"size:20;default:active" json:"status"`

	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	LastLoginAt *time.Time `json:"last_login_at,omitempty"`

	Products []Product `gorm:"foreignKey:UserID" json:"products,omitempty"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
