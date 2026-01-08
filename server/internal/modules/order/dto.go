package order

type CreateOrderRequest struct {
	Items []struct {
		ProductID string `json:"productId" validate:"required"`
		Quantity  int    `json:"quantity" validate:"required,min=1"`
	} `json:"items" validate:"required,min=1,dive"`
	PaymentMethod   string `json:"paymentMethod" validate:"required,oneof=COD KHALTI"`
	ShippingAddress string `json:"shippingAddress" validate:"required"`
}
