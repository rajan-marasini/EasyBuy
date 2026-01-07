package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Product struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;index" json:"id"`

	Name        string `gorm:"size:255;not null;index" json:"name"`
	Description string `gorm:"type:text" json:"description"`

	Brand string `gorm:"type:text" json:"brand"`

	Price    float64        `gorm:"not null" json:"price"`
	Stock    int            `gorm:"default:0" json:"stock"`
	Images   pq.StringArray `gorm:"type:text[]" json:"images"`
	IsActive bool           `gorm:"default:true" json:"is_active"`

	AverageRating float64 `gorm:"default:0" json:"average_rating"`
	TotalReviews  int     `gorm:"default:0" json:"total_reviews"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"-"`

	CategoryID uuid.UUID `gorm:"type:uuid;index" json:"category_id"`
	Category   Category  `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"category"`

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
