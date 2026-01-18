package payment

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/rajan-marasini/EasyBuy/server/internal/config"
)

type Service interface {
	VerifyEsewa(ctx context.Context, req VerifyEsewaRequest) (bool, error)
}

type service struct {
	cfg *config.Config
}

func NewService(cfg *config.Config) Service {
	return &service{cfg}
}

func (s *service) VerifyEsewa(ctx context.Context, req VerifyEsewaRequest) (bool, error) {
	// 2. Call eSewa Status Verification API
	// Correct API for v2 status check: https://rc-epay.esewa.com.np/api/epay/transaction/status/
	url := fmt.Sprintf("https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=%s&total_amount=%s&transaction_uuid=%s",
		req.ProductCode, req.TotalAmount, req.TransactionUUID)

	fmt.Printf("[eSewa] Verifying URL: %s\n", url)

	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("[eSewa] Error calling API: %v\n", err)
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("[eSewa] Error reading response body: %v\n", err)
		return false, err
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("[eSewa] API returned non-200 status: %d. Body: %s\n", resp.StatusCode, string(body))
		return false, fmt.Errorf("esewa verification failed with status: %d", resp.StatusCode)
	}

	fmt.Printf("[eSewa] API Response: %s\n", string(body))

	var esewaResp struct {
		Status      string      `json:"status"`
		TotalAmount interface{} `json:"total_amount"`
	}

	if err := json.Unmarshal(body, &esewaResp); err != nil {
		fmt.Printf("[eSewa] Error unmarshaling response: %v\n", err)
		return false, err
	}

	// eSewa status for success is "COMPLETE" for v2.
	if strings.ToUpper(esewaResp.Status) != "COMPLETE" {
		fmt.Printf("[eSewa] Payment not complete. Status: %s\n", esewaResp.Status)
		return false, nil
	}

	return true, nil
}
