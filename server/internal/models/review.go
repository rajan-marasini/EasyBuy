package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Review struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;index" json:"id"`

	ProductID uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`

	Product Product `gorm:"foreignKey:ProductID" json:"-"`
	User    User    `gorm:"foreignKey:UserID" json:"-"`

	Rating  int    `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment string `gorm:"type:text" json:"comment"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Review) TableName() string {
	return "reviews"
}

func (r *Review) BeforeCreate(tx *gorm.DB) (err error) {
	r.ID = uuid.New()
	return
}
