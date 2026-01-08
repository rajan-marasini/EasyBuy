package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderItem struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;index" json:"id"`

	OrderID uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	Order   Order     `gorm:"foreignKey:OrderID"`

	ProductID uuid.UUID `gorm:"type:uuid;not null;index" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID"`

	Quantity int     `gorm:"not null" json:"quantity"`
	Price    float64 `gorm:"not null" json:"price"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

func (o *OrderItem) BeforeCreate(tx *gorm.DB) (err error) {
	o.ID = uuid.New()
	return
}
