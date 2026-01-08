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
# Azure Resource Names (Must match main.tf)
ACR_NAME      = acrpowergriddev001
RG_NAME       = rg-powergrid-dev-weu-001
WEB_APP_NAME  = app-powergrid-core-dev

infra-init: ## Initialize Terraform (download providers)
	@echo "Initializing Terraform..."
	cd $(TF_DIR) && terraform init

infra-plan: infra-init ## Show the Azure resources that will be created
	@echo "Planning Infrastructure..."
	cd $(TF_DIR) && terraform plan

infra-apply: infra-init ## Provision all Azure resources (ACR, App Service, etc.)
	@echo "Provisioning Azure Infrastructure..."
	cd $(TF_DIR) && terraform apply -auto-approve
	@echo "Infrastructure is ready."

infra-build: ## Build locally and Push to Azure Container Registry (ACR)
	@echo "Logging into Azure Container Registry..."
	az acr login --name $(ACR_NAME)
	
	@echo "1. Building & Pushing Ingestion Engine..."
	docker build -t $(ACR_NAME).azurecr.io/ingestion-engine:latest ./services/ingestion-engine
	docker push $(ACR_NAME).azurecr.io/ingestion-engine:latest
	
	@echo "2. Building & Pushing Intelligence API..."
	docker build -t $(ACR_NAME).azurecr.io/intelligence-api:latest ./services/intelligence-api
	docker push $(ACR_NAME).azurecr.io/intelligence-api:latest
	
	@echo "3. Building & Pushing Gateway..."
	docker build -t $(ACR_NAME).azurecr.io/gateway:latest ./services/gateway
	docker push $(ACR_NAME).azurecr.io/gateway:latest
	
	@echo "4. Building & Pushing Frontend (Web)..."
	docker build -t $(ACR_NAME).azurecr.io/web:latest ./web
	docker push $(ACR_NAME).azurecr.io/web:latest
	
	@echo "All images pushed to $(ACR_NAME).azurecr.io"

infra-refresh: ## Restart the Azure Web App to pull the latest images
	@echo "Restarting Azure Web App to apply changes..."
	az webapp restart --name $(WEB_APP_NAME) --resource-group $(RG_NAME)
	@echo "App restarted. Check your URL in 2 minutes."

infra-up: infra-apply infra-build infra-refresh ## One-Command Deployment: Provision, Build, and Launch
	@echo "PowerGrid is fully deployed to Azure!"

infra-nuke: ## DESTROY all Azure resources (Use with caution!)
	@echo "DESTROYING AZURE RESOURCES..."
	cd $(TF_DIR) && terraform destroy -auto-approve
	@echo "Azure resources have been destroyed."