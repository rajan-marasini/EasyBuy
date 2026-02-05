.PHONY: build run dev migrate seed test tidy clean help

# Binary name
BINARY_NAME=easybuy-api

# Build the application
build:
	@echo "Building..."
	@go build -o ./tmp/$(BINARY_NAME) ./cmd/api/main.go

# Run the application
run: build
	./tmp/main

# Run development with air (live reload)
dev:
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "Air is not installed. Running normally..."; \
		go run ./cmd/api/main.go; \
	fi

# Run migrations
migrate:
	@go run ./scripts/main.go migrate

# Seed database
seed:
	@go run ./scripts/main.go seed

# Run tests
test:
	@go test -v ./...

# Tidy dependencies
tidy:
	@go mod tidy

# Clean build artifacts
clean:
	@rm -f ./tmp/$(BINARY_NAME)
	@rm -rf tmp

# Display help
help:
	@echo "Available commands:"
	@echo "  make build   - Build the API server"
	@echo "  make run     - Run the API server"
	@echo "  make dev     - Run development with live reload (requires air)"
	@echo "  make migrate - Run database migrations"
	@echo "  make seed    - Seed the database"
	@echo "  make test    - Run all tests"
	@echo "  make tidy    - Clean up go.mod and go.sum"
	@echo "  make clean   - Remove build artifacts"
