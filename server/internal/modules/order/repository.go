package order

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository interface {
	WithTransaction(fn func(txRepo Repository) error) error
	CreateOrder(ctx context.Context, order *models.Order) error
	GetProductByIDLocked(ctx context.Context, id string) (*models.Product, error)
	CreateOrderItem(ctx context.Context, item *models.OrderItem) error
	UpdateProductStock(ctx context.Context, id string, newStock int) error
	UpdateOrderTotal(ctx context.Context, id string, total float64) error
	InvalidateProductCache(ctx context.Context, productIDs []string) error
	InvalidateOrderCache(ctx context.Context) error
	GetOrderWithDetails(ctx context.Context, id string) (*models.Order, error)
	GetUserOrders(ctx context.Context, id string, limit, offset int) ([]models.Order, int64, error)
	GetAllOrders(ctx context.Context, limit, offset int) ([]models.Order, int64, error)
	UpdateOrderPaymentInfo(ctx context.Context, id string, paymentStatus, orderStatus, transactionID string, paidAt *time.Time) error
	UpdateOrderStatus(ctx context.Context, id string, status string) error
	UpdateDeliveryStatus(ctx context.Context, id string, status string) error
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, redis *redis.Client) Repository {
	return &repository{db, redis}
}

func (r *repository) WithTransaction(fn func(txRepo Repository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &repository{
			db:    tx,
			redis: r.redis,
		}
		return fn(txRepo)
	})
}

func (r *repository) CreateOrder(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *repository) GetProductByIDLocked(ctx context.Context, id string) (*models.Product, error) {
	var product models.Product
	if err := r.db.WithContext(ctx).Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *repository) CreateOrderItem(ctx context.Context, item *models.OrderItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *repository) UpdateProductStock(ctx context.Context, id string, newStock int) error {
	return r.db.WithContext(ctx).Model(&models.Product{}).Where("id = ?", id).Update("stock", newStock).Error
}

func (r *repository) UpdateOrderTotal(ctx context.Context, id string, total float64) error {
	return r.db.WithContext(ctx).Model(&models.Order{}).Where("id = ?", id).Update("total_amount", total).Error
}

func (r *repository) InvalidateProductCache(ctx context.Context, productIDs []string) error {
	// 1. Delete individual product ID keys
	for _, id := range productIDs {
		key := fmt.Sprintf("product:id:%s", id)
		r.redis.Del(ctx, key)
	}

	// 2. Clear pagination keys (wildcard scan)
	iter := r.redis.Scan(ctx, 0, "products:page:*", 0).Iterator()
	for iter.Next(ctx) {
		r.redis.Del(ctx, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return err
	}
	return nil
}

func (r *repository) GetOrderWithDetails(ctx context.Context, id string) (*models.Order, error) {
	var order models.Order
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		First(&order, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *repository) GetAllOrders(ctx context.Context, limit, offset int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	// Calculate page number for cache key
	page := (offset / limit) + 1
	cacheKey := fmt.Sprintf("orders:page:%d:limit:%d", page, limit)

	type CachedData struct {
		Orders []models.Order `json:"orders"`
		Total  int64          `json:"total"`
	}

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var cached CachedData
		if err := json.Unmarshal([]byte(val), &cached); err == nil {
			log.Println("Cache hit for", cacheKey)
			return cached.Orders, cached.Total, nil
		}
	}

	// Get total count
	if err := r.db.WithContext(ctx).Model(&models.Order{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated orders - apply Offset and Limit BEFORE Find
	if err := r.db.WithContext(ctx).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "email")
		}).
		Preload("OrderItems", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "order_id", "product_id", "quantity", "price")
		}).
		Preload("OrderItems.Product", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name")
		}).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	// Cache the results
	cached := CachedData{Orders: orders, Total: total}
	if cachedByte, err := json.Marshal(&cached); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, cachedByte, time.Hour)
	}

	return orders, total, nil
}

func (r *repository) GetUserOrders(ctx context.Context, id string, limit, offset int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	// Calculate page number for cache key
	page := (offset / limit) + 1
	cacheKey := fmt.Sprintf("user:orders:%s:page:%d:limit:%d", id, page, limit)

	type CachedData struct {
		Orders []models.Order `json:"orders"`
		Total  int64          `json:"total"`
	}

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var cached CachedData
		if err := json.Unmarshal([]byte(val), &cached); err == nil {
			log.Println("Cache hit for", cacheKey)
			return cached.Orders, cached.Total, nil
		}
	}

	// Get total count for this user
	if err := r.db.WithContext(ctx).Model(&models.Order{}).Where("user_id = ?", id).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated orders - apply Offset and Limit BEFORE Find
	if err := r.db.WithContext(ctx).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "email")
		}).
		Preload("OrderItems", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "order_id", "product_id", "quantity", "price")
		}).
		Preload("OrderItems.Product", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name")
		}).
		Where("user_id = ?", id).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	// Cache the results
	cached := CachedData{Orders: orders, Total: total}
	if cachedByte, err := json.Marshal(&cached); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, cachedByte, time.Hour)
	}

	return orders, total, nil
}

func (r *repository) UpdateOrderPaymentInfo(ctx context.Context, id string, paymentStatus, orderStatus, transactionID string, paidAt *time.Time) error {
	updates := map[string]interface{}{
		"payment_status": paymentStatus,
		"order_status":   orderStatus,
		"transaction_id": transactionID,
		"paid_at":        paidAt,
	}
	return r.db.WithContext(ctx).Model(&models.Order{}).Where("id = ?", id).Updates(updates).Error
}

func (r *repository) UpdateOrderStatus(ctx context.Context, id string, status string) error {
	if err := r.db.WithContext(ctx).Model(&models.Order{}).Where("id = ?", id).Update("order_status", status).Error; err != nil {
		return err
	}
	return r.InvalidateOrderCache(ctx)
}

func (r *repository) UpdateDeliveryStatus(ctx context.Context, id string, status string) error {
	if err := r.db.WithContext(ctx).Model(&models.Order{}).Where("id = ?", id).Update("delivery_status", status).Error; err != nil {
		return err
	}
	return r.InvalidateOrderCache(ctx)
}

func (r *repository) InvalidateOrderCache(ctx context.Context) error {
	// Clear all order pagination keys
	iter := r.redis.Scan(ctx, 0, "orders:page:*", 0).Iterator()
	for iter.Next(ctx) {
		r.redis.Del(ctx, iter.Val())
	}
	iter2 := r.redis.Scan(ctx, 0, "user:orders:*", 0).Iterator()
	for iter2.Next(ctx) {
		r.redis.Del(ctx, iter2.Val())
	}
	return nil
}
