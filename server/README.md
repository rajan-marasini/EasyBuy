# EasyBuy Server

EasyBuy Server is a robust backend API built with Go, designed to power the EasyBuy e-commerce platform. It leverages the Fiber web framework and GORM for database interactions, providing a scalable and efficient architecture.

## 🚀 Tech Stack

-   **Language**: [Go](https://golang.org/) (1.25.5+)
-   **Web Framework**: [Fiber v2](https://gofiber.io/)
-   **ORM**: [GORM](https://gorm.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **Cache**: [Redis](https://redis.io/)
-   **Image Storage**: [Cloudinary](https://cloudinary.com/)
-   **Authentication**: JWT (JSON Web Tokens)
-   **Validation**: [Go Playground Validator](https://github.com/go-playground/validator)
-   **Live Reload**: [Air](https://github.com/cosmtrek/air)

## 📁 Project Structure

```text
server/
├── cmd/
│   └── api/              # Application entry point
├── internal/
│   ├── app/              # Core application setup (Fiber instance, global middlewares)
│   ├── config/           # Configuration management and environment loading
│   ├── database/         # Database and Redis connection logic
│   ├── middleware/       # Custom application-wide middlewares (Auth, etc.)
│   ├── models/           # Common database models
│   ├── modules/          # Business logic organized by domain (Modular structure)
│   │   ├── auth/         # Authentication and registration
│   │   ├── category/     # Product categories management
│   │   ├── product/      # Product management and search
│   │   ├── user/         # User profiles and management
│   │   └── ...           # (Notifications, Payment, Order, Review)
│   ├── routes/           # Centralized route registration
│   └── utils/            # Shared utility functions (Cloudinary, etc.)
├── scripts/              # Helper scripts
└── .air.toml             # Configuration for live reloading
```

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed:

-   [Go](https://go.dev/doc/install)
-   [PostgreSQL](https://www.postgresql.org/download/)
-   [Redis](https://redis.io/download/)

### Setup

1.  **Clone the repository and navigate to the server folder**:

    ```bash
    cd server
    ```

2.  **Install dependencies**:

    ```bash
    go mod download
    ```

3.  **Configure environment variables**:
    Copy the `.env.example` file and update it with your local settings.

    ```bash
    cp .env.example .env
    ```

4.  **Run the application**:
    -   **For Development (with live reload)**:
        Make sure you have `air` installed (`go install github.com/cosmtrek/air@latest`).
        ```bash
        air
        ```
    -   **For Production/Standard run**:
        ```bash
        go run cmd/api/main.go
        ```

## 🌐 Environment Variables

| Variable            | Description                                             |
| :------------------ | :------------------------------------------------------ |
| `PORT`              | Port number the server will listen on (default: `8000`) |
| `CLIENT_URL`        | Frontend URL for CORS configuration                     |
| `DATABASE_HOST`     | PostgreSQL host                                         |
| `DATABASE_USER`     | PostgreSQL username                                     |
| `DATABASE_PASSWORD` | PostgreSQL password                                     |
| `DATABASE_DBNAME`   | PostgreSQL database name                                |
| `DATABASE_PORT`     | PostgreSQL port                                         |
| `JWT_SECRET`        | Secret key for signing JWT tokens                       |
| `REDIS_ADDRESS`     | Redis server address                                    |
| `CLOUDINARY_*`      | Cloudinary credentials for image uploads                |

## ✨ Features

-   **Modular Architecture**: Easy to maintain and scale.
-   **RESTful API**: Clean and consistent API endpoints.
-   **Image Uploads**: Integrated with Cloudinary for handling product images.
-   **Caching**: Redis integration for performance optimization.
-   **Security**: JWT-based authentication and secure password hashing.
-   **Validation**: Strict input validation using `go-playground/validator`.
