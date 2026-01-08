package models

import (
	"time"

	"github.com/google/uuid"
)

type OrderStatus string
type DeliveryStatus string

const (
	OrderPending   OrderStatus = "PENDING"
	OrderPaid      OrderStatus = "PAID"
	OrderFailed    OrderStatus = "FAILED"
	OrderCancelled OrderStatus = "CANCELLED"
	OrderRefunded  OrderStatus = "REFUNDED"
)

const (
	DeliveryNotShipped     DeliveryStatus = "NOT_SHIPPED"
	DeliveryProcessing     DeliveryStatus = "PROCESSING"
	DeliveryShipped        DeliveryStatus = "SHIPPED"
	DeliveryInTransit      DeliveryStatus = "IN_TRANSIT"
	DeliveryOutForDelivery DeliveryStatus = "OUT_FOR_DELIVERY"
	DeliveryDelivered      DeliveryStatus = "DELIVERED"
	DeliveryReturned       DeliveryStatus = "RETURNED"
)

type Order struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;index" json:"id"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID" json:"user"`

	Amount float64 `gorm:"not null" json:"amount"`

	Status         OrderStatus    `gorm:"size:50;default:'PENDING'" json:"status"`
	DeliveryStatus DeliveryStatus `gorm:"size:50;default:'NOT_SHIPPED'" json:"delivery_status"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	OrderItems []OrderItem `gorm:"constraint:OnDelete:CASCADE" json:"order_items"`
}
