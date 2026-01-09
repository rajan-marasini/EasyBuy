package email

import (
	"bytes"
	"embed"
	"html/template"
	"strconv"

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
	m := gomail.NewMessage()
	m.SetHeader("From", cfg.SMTP_USER)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	port, err := strconv.Atoi(cfg.SMTP_PORT)
	if err != nil {
		return err
	}
	d := gomail.NewDialer(cfg.SMTP_HOST, port, cfg.SMTP_USER, cfg.SMTP_PASSWORD)

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
