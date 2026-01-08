# -----------------------------------------------------------------------------
# POWERGRID MASTER MAKEFILE
# 
# This file automates the build, deployment, and cleanup processes for the
# Intelligent CoE Core project.
#
# Usage:
#   make up           - Build and start the local development environment
#   make down         - Stop the local environment
#   make clean        - Deep clean (containers, images, volumes, cache)
#   make test         - Run unit tests across all services
#   make infra-deploy - Provision Azure resources via Terraform
#   make infra-nuke   - DESTROY all Azure resources (Cost Saving)
# -----------------------------------------------------------------------------

# Variables
DC_FILE := infra/docker-compose.yaml
TF_DIR := infra/terraform

.PHONY: help up down logs clean test infra-init infra-plan infra-deploy infra-nuke

# -----------------------------------------------------------------------------
# LOCAL DEVELOPMENT (Docker Compose)
# -----------------------------------------------------------------------------
up: ## Build and start the full stack (Go, Python, React, Nginx) in detached mode
	@echo "Starting PowerGrid environment..."
	docker-compose -f $(DC_FILE) up --build -d
	@echo "Services are up! Dashboard: http://localhost:3000"

down: ## Stop containers and remove network artifacts
	@echo "Stopping services..."
	docker-compose -f $(DC_FILE) down
	@echo "Environment stopped."

logs: ## Follow logs for all services
	docker-compose -f $(DC_FILE) logs -f

restart: down up ## Restart the environment

# -----------------------------------------------------------------------------
# CLEANUP & MAINTENANCE
# -----------------------------------------------------------------------------
clean: ## Deep clean: Stop containers, remove volumes, images, and build cache
	@echo "performing Deep Clean..."
	docker-compose -f $(DC_FILE) down -v --rmi local --remove-orphans
	@echo "Pruning unused Docker objects..."
	docker system prune -f
	@echo "System clean."

# -----------------------------------------------------------------------------
# TESTING
# -----------------------------------------------------------------------------
# Rebuild to ensure test dependencies (pytest) are installed
# "--run" creates a single pass (no watch mode)
test: ## Run unit tests for Go, Python, and React
	@echo "Running Go Tests..."
	cd services/ingestion-engine && go test -v ./...
	
	@echo "Running Python Tests..."
	docker-compose -f $(DC_FILE) build intelligence-api
	docker-compose -f $(DC_FILE) run --rm intelligence-api pytest
	
	@echo "Running React Tests (Vitest)..."
	cd web && npm run test -- --run

# -----------------------------------------------------------------------------
# INFRASTRUCTURE (Terraform / Azure)
# -----------------------------------------------------------------------------
infra-init: ## Initialize Terraform (download providers)
	@echo "Initializing Terraform..."
	cd $(TF_DIR) && terraform init

infra-plan: infra-init ## Show the Azure resources that will be created
	@echo "Planning Infrastructure..."
	cd $(TF_DIR) && terraform plan

infra-deploy: infra-init ## Apply Terraform config to provision Azure resources
	@echo "Deploying to Azure..."
	cd $(TF_DIR) && terraform apply -auto-approve
	@echo "Infrastructure deployed successfully."

infra-nuke: ## DESTROY all Azure resources (Use with caution!)
	@echo "DESTROYING AZURE RESOURCES..."
	cd $(TF_DIR) && terraform destroy -auto-approve
	@echo "Azure resources have been destroyed."