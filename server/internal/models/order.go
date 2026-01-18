package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderStatus string
type PaymentStatus string
type DeliveryStatus string

const (
	OrderPending   OrderStatus = "PENDING"
	OrderPaid      OrderStatus = "PAID"
	OrderFailed    OrderStatus = "FAILED"
	OrderCancelled OrderStatus = "CANCELLED"
	OrderRefunded  OrderStatus = "REFUNDED"
)

const (
	PaymentPending   PaymentStatus = "PENDING"
	PaymentCompleted PaymentStatus = "COMPLETED"
	PaymentFailed    PaymentStatus = "FAILED"
	PaymentRefunded  PaymentStatus = "REFUNDED"
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
	User   User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`

	TotalAmount float64 `gorm:"type:decimal(12,2);not null;column:total_amount" json:"total_amount"`

	PaymentStatus PaymentStatus `gorm:"type:varchar(50);not null;default:'PENDING'" json:"payment_status"`
	PaymentMethod string        `gorm:"size:50;not null" json:"payment_method"` // COD, KHALTI, STRIPE
	TransactionID string        `gorm:"size:100" json:"transaction_id"`
	PaidAt        *time.Time    `json:"paid_at"`

	OrderStatus    OrderStatus    `gorm:"type:varchar(50);not null;default:'PENDING'" json:"order_status"`
	DeliveryStatus DeliveryStatus `gorm:"type:varchar(50);not null;default:'NOT_SHIPPED'" json:"delivery_status"`

	ShippingAddress string `gorm:"type:text;not null" json:"shipping_address"`

	OrderItems []OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"order_items"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Order) TableName() string {
	return "orders"
}

func (o *Order) BeforeCreate(tx *gorm.DB) (err error) {
	o.ID = uuid.New()
	return
}
