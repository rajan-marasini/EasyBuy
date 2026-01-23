package order

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification/email"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/payment"
)

type Service interface {
	CreateOrder(ctx context.Context, userID string, req CreateOrderRequest) (*models.Order, error)
	GetAllOrders(ctx context.Context, limit, offset int) ([]models.Order, int64, error)
	GetUserOrders(ctx context.Context, id string, limit, offset int) ([]models.Order, int64, error)
	UpdateOrderStatus(ctx context.Context, id string, status string) error
	UpdateDeliveryStatus(ctx context.Context, id string, status string) error
}

type service struct {
	repo    Repository
	cfg     *config.Config
	notify  notification.NotificationService
	payment payment.Service
}

func NewService(repo Repository, cfg *config.Config, notify notification.NotificationService, payment payment.Service) Service {
	return &service{repo, cfg, notify, payment}
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

	// For eSewa, verify payment before creating order with PAID status
	if req.PaymentMethod == "ESEWA" {
		if req.PaymentID == "" {
			return nil, errors.New("payment ID is required for eSewa")
		}
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

		// Calculate final total (including tax/shipping if we had that logic on backend)
		// For now matching frontend: 10% tax + shipping (0 if total > 100, else 10)
		tax := total * 0.1
		shipping := 0.0
		if total <= 100 {
			shipping = 10.0
		}
		finalTotal := total + tax + shipping

		fmt.Printf("[Order] Calculated Total: %.2f (Base: %.2f, Tax: %.2f, Shipping: %.2f)\n", finalTotal, total, tax, shipping)

		if err := txRepo.UpdateOrderTotal(ctx, order.ID.String(), finalTotal); err != nil {
			return err
		}

		order.TotalAmount = finalTotal

		// Verify payment if not COD
		if req.PaymentMethod == "ESEWA" {
			verifyReq := payment.VerifyEsewaRequest{
				TotalAmount:     fmt.Sprintf("%.2f", finalTotal),
				TransactionUUID: req.PaymentID,
				ProductCode:     s.cfg.ESEWA_PRODUCT_CODE,
			}

			fmt.Printf("[Order] Requesting eSewa Verification: %+v\n", verifyReq)

			success, err := s.payment.VerifyEsewa(ctx, verifyReq)
			if err != nil || !success {
				fmt.Printf("[Order] eSewa Verification Failed. Error: %v, Success: %v\n", err, success)
				return errors.New("payment verification failed")
			}

			order.PaymentStatus = models.PaymentCompleted
			order.OrderStatus = models.OrderPaid
			order.TransactionID = req.PaymentID
			now := time.Now()
			order.PaidAt = &now

			// Update the created order record with payment info
			// We can use the txRepo to update these specific fields
			if err := txRepo.UpdateOrderPaymentInfo(ctx, order.ID.String(), string(models.PaymentCompleted), string(models.OrderPaid), req.PaymentID, &now); err != nil {
				return err
			}
		}

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

func (s *service) GetAllOrders(ctx context.Context, limit, offset int) ([]models.Order, int64, error) {
	return s.repo.GetAllOrders(ctx, limit, offset)
}

func (s *service) GetUserOrders(ctx context.Context, id string, limit, offset int) ([]models.Order, int64, error) {
	return s.repo.GetUserOrders(ctx, id, limit, offset)
}

func (s *service) UpdateOrderStatus(ctx context.Context, id string, status string) error {
	return s.repo.UpdateOrderStatus(ctx, id, status)
}

func (s *service) UpdateDeliveryStatus(ctx context.Context, id string, status string) error {
	return s.repo.UpdateDeliveryStatus(ctx, id, status)
}
