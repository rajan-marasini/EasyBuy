package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;index" json:"id"`

	Name        string `gorm:"size:255;not null;index" json:"name"`
	Description string `gorm:"type:text" json:"description"`

	Price    float64 `gorm:"not null" json:"price"`
	Stock    int     `gorm:"default:0" json:"stock"`
	ImageURL string  `gorm:"size:500" json:"image_url"`
	IsActive bool    `gorm:"default:true" json:"is_active"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Product) TableName() string {
	return "products"
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = uuid.New()
	return
}
