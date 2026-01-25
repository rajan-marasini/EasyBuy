package payment

type VerifyEsewaRequest struct {
	Amount          string `json:"amount"`
	TotalAmount     string `json:"total_amount"`
	TransactionUUID string `json:"transaction_uuid"`
	ProductCode     string `json:"product_code"`
}

type EsewaResponse struct {
	Status           string `json:"status"`
	Signature        string `json:"signature"`
	TransactionUUID  string `json:"transaction_uuid"`
	TotalAmount      string `json:"total_amount"`
	TransactionCode  string `json:"transaction_code"`
	SuccessURL       string `json:"success_url"`
	SignedFieldNames string `json:"signed_field_names"`
}

type VerifyKhaltiRequest struct {
	PIDX string `json:"pidx"`
}

type KhaltiLookupResponse struct {
	PIDX          string `json:"pidx"`
	TotalAmount   int    `json:"total_amount"`
	Status        string `json:"status"`
	TransactionID string `json:"transaction_id"`
	Fee           int    `json:"fee"`
	Refunded      bool   `json:"refunded"`
}
