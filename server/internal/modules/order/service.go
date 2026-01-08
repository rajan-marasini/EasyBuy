package order

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
)

type Service interface {
	CreateOrder(ctx context.Context, userID string, req CreateOrderRequest) (*models.Order, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) CreateOrder(ctx context.Context, userID string, req CreateOrderRequest) (*models.Order, error) {
	userIdUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	order := &models.Order{
		UserID:          userIdUUID,
		OrderStatus:     models.OrderPending,
		PaymentStatus:   models.PaymentPending,
		PaymentMethod:   req.PaymentMethod,
		ShippingAddress: req.ShippingAddress,
	}

	var affectedProductIDs []string

	err = s.repo.WithTransaction(func(txRepo Repository) error {
		if err := txRepo.CreateOrder(ctx, order); err != nil {
			return err
		}

		var total float64

		for _, item := range req.Items {
			product, err := txRepo.GetProductByIDLocked(ctx, item.ProductID)
			if err != nil {
				return err
			}

			if product.Stock < item.Quantity {
				return errors.New("insufficient stock for product: " + product.Name)
			}

			orderItem := &models.OrderItem{
				OrderID:   order.ID,
				ProductID: product.ID,
				Quantity:  item.Quantity,
				Price:     product.Price,
			}

			if err := txRepo.CreateOrderItem(ctx, orderItem); err != nil {
				return err
			}

			if err := txRepo.UpdateProductStock(ctx, product.ID.String(), product.Stock-item.Quantity); err != nil {
				return err
			}

			total += product.Price * float64(item.Quantity)
			affectedProductIDs = append(affectedProductIDs, product.ID.String())
		}

		if err := txRepo.UpdateOrderTotal(ctx, order.ID.String(), total); err != nil {
			return err
		}

		order.TotalAmount = total
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Invalidate cache after successful transaction
	if len(affectedProductIDs) > 0 {
		_ = s.repo.InvalidateProductCache(ctx, affectedProductIDs)
	}

	return order, nil
}
