package email

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	gomail "gopkg.in/gomail.v2"
)

//go:embed templates/*.tmpl
var templateFS embed.FS

func RenderTemplate(name string, data any) (string, error) {
	tmpl, err := template.ParseFS(templateFS, "templates/"+name)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func SendEmail(cfg *config.Config, to, subject, body string) error {
	// If using Resend HTTP API (over HTTPS port 443 - bypasses all cloud SMTP port blocks)
	if strings.Contains(cfg.SMTP_HOST, "resend") || strings.HasPrefix(cfg.SMTP_PASSWORD, "re_") {
		return sendResendHTTP(cfg, to, subject, body)
	}

	// If using Brevo HTTP API (over HTTPS port 443 - bypasses all cloud SMTP port blocks)
	if strings.Contains(cfg.SMTP_HOST, "brevo") || strings.HasPrefix(cfg.SMTP_PASSWORD, "xkeysib-") || strings.HasPrefix(cfg.SMTP_PASSWORD, "xsmtpsib-") {
		return sendBrevoHTTP(cfg, to, subject, body)
	}

	// Standard SMTP via Gomail (for local dev)
	m := gomail.NewMessage()
	m.SetHeader("From", cfg.SMTP_USER)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	port, err := strconv.Atoi(cfg.SMTP_PORT)
	if err != nil {
		port = 587
	}
	d := gomail.NewDialer(cfg.SMTP_HOST, port, cfg.SMTP_USER, cfg.SMTP_PASSWORD)

	return d.DialAndSend(m)
}

func sendBrevoHTTP(cfg *config.Config, to, subject, body string) error {
	url := "https://api.brevo.com/v3/smtp/email"
	senderEmail := cfg.SMTP_USER
	if senderEmail == "" {
		senderEmail = "no-reply@easybuy.com"
	}

	payload := map[string]any{
		"sender": map[string]string{
			"email": senderEmail,
			"name":  "EasyBuy",
		},
		"to": []map[string]string{
			{"email": to},
		},
		"subject":     subject,
		"htmlContent": body,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}

	req.Header.Set("api-key", cfg.SMTP_PASSWORD)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("brevo API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func sendResendHTTP(cfg *config.Config, to, subject, body string) error {
	url := "https://api.resend.com/emails"
	fromEmail := cfg.SMTP_USER
	if fromEmail == "" || !strings.Contains(fromEmail, "@") {
		fromEmail = "EasyBuy <onboarding@resend.dev>"
	}

	payload := map[string]any{
		"from":    fromEmail,
		"to":      []string{to},
		"subject": subject,
		"html":    body,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+cfg.SMTP_PASSWORD)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}
