package queue

type EmailJob struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

type NotificationJob struct {
	UserID  string `json:"user_id"`
	Title   string `json:"title"`
	Message string `json:"message"`
}
