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
	VerifyKhalti(ctx context.Context, req VerifyKhaltiRequest) (bool, error)
}

type service struct {
	cfg *config.Config
}

func NewService(cfg *config.Config) Service {
	return &service{cfg}
}

func (s *service) VerifyEsewa(ctx context.Context, req VerifyEsewaRequest) (bool, error) {
	// Verify the esewa payment
	url := fmt.Sprintf(
		"%s?product_code=%s&total_amount=%s&transaction_uuid=%s",
		s.cfg.ESEWA_VERIFY_URL,
		req.ProductCode,
		req.TotalAmount,
		req.TransactionUUID,
	)

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

func (s *service) VerifyKhalti(ctx context.Context, req VerifyKhaltiRequest) (bool, error) {

	payload, err := json.Marshal(req)
	if err != nil {
		return false, err
	}

	hREQ, err := http.NewRequestWithContext(ctx, "POST", s.cfg.KHALTI_VERIFY_URL, strings.NewReader(string(payload)))
	if err != nil {
		return false, err
	}

	hREQ.Header.Set("Authorization", fmt.Sprintf("Key %s", s.cfg.KHALTI_LIVE_SECRET_KEY))
	hREQ.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(hREQ)
	if err != nil {
		fmt.Printf("[Khalti] Error calling API: %v\n", err)
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("[Khalti] Error reading response body: %v\n", err)
		return false, err
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("[Khalti] API returned non-200 status: %d. Body: %s\n", resp.StatusCode, string(body))
		return false, fmt.Errorf("khalti verification failed with status: %d", resp.StatusCode)
	}

	var khaltiResp KhaltiLookupResponse
	if err := json.Unmarshal(body, &khaltiResp); err != nil {
		fmt.Printf("[Khalti] Error unmarshaling response: %v\n", err)
		return false, err
	}

	if strings.ToLower(khaltiResp.Status) != "completed" {
		fmt.Printf("[Khalti] Payment not complete. Status: %s\n", khaltiResp.Status)
		return false, nil
	}

	return true, nil
}
