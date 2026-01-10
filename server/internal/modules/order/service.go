package order

import (
	"context"
	"errors"
	"log"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification/email"
)

type Service interface {
	CreateOrder(ctx context.Context, userID string, req CreateOrderRequest) (*models.Order, error)
}

type service struct {
	repo   Repository
	cfg    *config.Config
	notify notification.NotificationService
}

func NewService(repo Repository, cfg *config.Config, notify notification.NotificationService) Service {
	return &service{repo, cfg, notify}
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

	// Fetch the complete order with details (User, OrderItems)
	completeOrder, err := s.repo.GetOrderWithDetails(ctx, order.ID.String())
	if err != nil {
		return nil, err
	}

	// Send order confirmation email
	go func() {
		type EmailItem struct {
			ProductName string
			Quantity    int
			Price       float64
			Subtotal    float64
		}

		var emailItems []EmailItem
		for _, item := range completeOrder.OrderItems {
			emailItems = append(emailItems, EmailItem{
				ProductName: item.Product.Name,
				Quantity:    item.Quantity,
				Price:       item.Price,
				Subtotal:    item.Price * float64(item.Quantity),
			})
		}

		emailData := map[string]any{
			"Name":            completeOrder.User.Name,
			"OrderID":         completeOrder.ID.String(),
			"Items":           emailItems,
			"TotalAmount":     completeOrder.TotalAmount,
			"ShippingAddress": completeOrder.ShippingAddress,
		}

		emailBody, err := email.RenderTemplate("order_confirmation.tmpl", emailData)
		if err != nil {
			log.Println("Error rendering order confirmation email template: ", err.Error())
			return
		}

		_ = s.notify.SendEmail(context.Background(), completeOrder.User.Email, "Order Confirmation - "+completeOrder.ID.String(), emailBody)
	}()

	return completeOrder, nil
}
