terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 1. Resource Group
resource "azurerm_resource_group" "powergrid_rg" {
  name     = "rg-powergrid-dev-weu-001"
  location = "swedencentral"
  
  tags = {
    Environment = "Development"
    Project     = "PowerGrid"
    Owner       = "CenterOfExcellence"
  }
}

# 2. Azure Container Registry (ACR)
resource "azurerm_container_registry" "acr" {
  name                = "acrpowergriddev001" 
  resource_group_name = azurerm_resource_group.powergrid_rg.name
  location            = azurerm_resource_group.powergrid_rg.location
  sku                 = "Basic"
  admin_enabled       = true 
}

# 3. App Service Plan
resource "azurerm_service_plan" "powergrid_plan" {
  name                = "asp-powergrid-dev-weu-001"
  resource_group_name = azurerm_resource_group.powergrid_rg.name
  location            = azurerm_resource_group.powergrid_rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# 4. Web App
resource "azurerm_linux_web_app" "powergrid_app" {
  name                = "app-powergrid-core-dev"
  resource_group_name = azurerm_resource_group.powergrid_rg.name
  location            = azurerm_service_plan.powergrid_plan.location
  service_plan_id     = azurerm_service_plan.powergrid_plan.id

  site_config {
    # -------------------------------------------------------------------------
    # FIX: Explicitly tell Azure to run Docker Compose
    # -------------------------------------------------------------------------
    app_command_line = "docker-compose up" 
    
    container_registry_use_managed_identity = false
    
    application_stack {
      # -----------------------------------------------------------------------
      # FIX: Terraform requires a 'docker_image_name' even for Compose setups.
      # We point to the gateway image, but the 'docker-compose up' command
      # above overrides this to run the full stack.
      # -----------------------------------------------------------------------
      docker_image_name        = "gateway:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "WEBSITES_CONTAINER_START_TIME_LIMIT" = "1800"
    
    # Registry Credentials for the App Service to pull images
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
  }
}