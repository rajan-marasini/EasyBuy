package order

import "github.com/rajan-marasini/EasyBuy/server/internal/models"

type CreateOrderRequest struct {
	Items []struct {
		ProductID string `json:"productId" validate:"required"`
		Quantity  int    `json:"quantity" validate:"required,min=1"`
	} `json:"items" validate:"required,min=1,dive"`
	PaymentMethod   string `json:"paymentMethod" validate:"required,oneof=COD KHALTI"`
	ShippingAddress string `json:"shippingAddress" validate:"required"`
}

type OrderItemResponse struct {
	ID           string  `json:"id"`
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductImage string  `json:"product_image,omitempty"`
	Quantity     int     `json:"quantity"`
	Price        float64 `json:"price"`
}

type UserResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type OrderResponse struct {
	ID              string              `json:"id"`
	User            UserResponse        `json:"user"`
	TotalAmount     float64             `json:"total_amount"`
	PaymentStatus   string              `json:"payment_status"`
	PaymentMethod   string              `json:"payment_method"`
	OrderStatus     string              `json:"order_status"`
	DeliveryStatus  string              `json:"delivery_status"`
	ShippingAddress string              `json:"shipping_address"`
	Items           []OrderItemResponse `json:"items"`
	CreatedAt       string              `json:"created_at"`
}

func toOrderResponse(order *models.Order) OrderResponse {
	return OrderResponse{
		ID:              order.ID.String(),
		TotalAmount:     order.TotalAmount,
		PaymentStatus:   string(order.PaymentStatus),
		PaymentMethod:   order.PaymentMethod,
		OrderStatus:     string(order.OrderStatus),
		DeliveryStatus:  string(order.DeliveryStatus),
		ShippingAddress: order.ShippingAddress,
		CreatedAt:       order.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		User: UserResponse{
			ID:    order.User.ID.String(),
			Name:  order.User.Name,
			Email: order.User.Email,
		},
		Items: make([]OrderItemResponse, len(order.OrderItems)),
	}

}

func toOrderItemResponse(item *models.OrderItem) OrderItemResponse {
	return OrderItemResponse{
		ID:          item.ID.String(),
		ProductID:   item.Product.ID.String(),
		ProductName: item.Product.Name,
		Quantity:    item.Quantity,
		Price:       item.Price,
	}
}
