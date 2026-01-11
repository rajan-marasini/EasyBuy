# EasyBuy 🛒

EasyBuy is a modern, full-stack e-commerce platform built with efficiency and scalability in mind. It features a robust Go-based backend using the Fiber framework and a high-performance frontend powered by Next.js and Tailwind CSS.

## 🚀 Features

-   **Authentication & Authorization**: Secure JWT-based authentication.
-   **Product Management**: Browse, search, and manage products with ease.
-   **Shopping Cart**: Fully functional cart system with state management.
-   **Order Processing**: Streamlined checkout and order management.
-   **Reviews & Ratings**: Integrated product review system.
-   **Email Service**: Asynchronous email sending (e.g., verification, order confirmation) via RabbitMQ.
-   **Admin Dashboard**: Comprehensive management interface for administrators.
-   **Multi-image Uploads**: Concurrent image uploads to Cloudinary.
-   **Caching**: High-performance data retrieval using Redis.

## 🛠️ Tech Stack

### Backend

-   **Language**: [Go](https://go.dev/)
-   **Web Framework**: [Fiber](https://gofiber.io/)
-   **ORM**: [GORM](https://gorm.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **Caching**: [Redis](https://redis.io/)
-   **Message Broker**: [RabbitMQ](https://www.rabbitmq.com/)
-   **Authentication**: JWT (JSON Web Token)
-   **Image Storage**: [Cloudinary](https://cloudinary.com/)
-   **Validation**: [Go Playground Validator](https://github.com/go-playground/validator)

### Frontend

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Data Fetching**: [React Query](https://tanstack.com/query/latest)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/), [Shadcn UI](https://ui.shadcn.com/)
-   **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 📂 Project Structure

```text
EasyBuy/
├── client/           # Next.js frontend application
│   ├── src/          # Source files (components, hooks, app, etc.)
│   └── ...
├── server/           # Go backend application
│   ├── cmd/          # Entry points (main application)
│   ├── internal/     # Internal logic (modules, services, repositories)
│   ├── scripts/      # Utility scripts (seeding)
│   └── ...
└── docker-compose.yml # Docker configuration for dependencies and app
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

-   [Go](https://go.dev/doc/install) (1.24 or later)
-   [Node.js](https://nodejs.org/) (v24 or later)
-   [Docker](https://www.docker.com/products/docker-desktop) & Docker Compose
-   [Bun](https://bun.sh/) (Optional, for client-side package management)

## 🏗️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rajan-marasini/EasyBuy.git
cd EasyBuy
```

### 2. Set up Environment Variables

Create `.env` files for both the server and client using the provided examples.

#### Server

```bash
cp server/.env.example server/.env
# Edit server/.env with your secrets (Cloudinary, SMTP, etc.)
```

#### Client

```bash
cp client/.env.example client/.env
```

### 3. Run with Docker (Recommended)

You can start all services (database, redis, rabbitmq, server, and client) with a single command:

```bash
docker-compose up --build
```

### 4. Running Manually

#### Backend

```bash
cd server
go mod download
go run cmd/main.go
```

#### Frontend

```bash
cd client
bun install # or npm install
bun dev     # or npm run dev
```

### 5. Seeding Data

To populate the database with initial products and reviews:

-   If using Docker: `docker-compose run seed`
-   Manually: `cd server && go run scripts/seed.go`

## 🐳 Docker Deployment

The project includes a `docker-compose.yml` file that orchestrates the following services:

-   **PostgreSQL**: Relational database storage.
-   **Redis**: For caching and session management.
-   **RabbitMQ**: Message broker for asynchronous tasks.
-   **Server**: The Go API.
-   **Client**: The Next.js frontend.
