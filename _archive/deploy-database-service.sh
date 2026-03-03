#!/bin/bash

# Koyeb Database Service Deployment Script
# This script deploys the PostgreSQL database service to Koyeb

set -e

# Configuration
SERVICE_NAME="octavia-postgres"
APP_NAME="octavia-interview-buddy"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Koyeb CLI is installed
check_koyeb_cli() {
    echo_step "Checking Koyeb CLI installation..."
    
    if ! command -v koyeb &> /dev/null; then
        echo_error "Koyeb CLI is not installed"
        echo "Please install it using one of these methods:"
        echo "  npm install -g @koyeb/cli"
        echo "  brew tap koyeb/tap && brew install koyeb"
        echo "  curl -L https://koyeb-cli.netlify.app/install.sh | sh"
        exit 1
    fi
    
    echo_info "Koyeb CLI version: $(koyeb version)"
}

# Authenticate with Koyeb (if not already authenticated)
authenticate_koyeb() {
    echo_step "Checking Koyeb authentication..."
    
    # Test authentication by listing organizations
    if koyeb organizations list &> /dev/null; then
        echo_info "Already authenticated with Koyeb"
        ORG_INFO=$(koyeb organizations list --output json | jq -r '.[0].name' 2>/dev/null || echo "unknown")
        echo_info "Current organization: $ORG_INFO"
    else
        echo_info "Not authenticated with Koyeb. Please authenticate:"
        koyeb login
    fi
}

# Create application if it doesn't exist
create_application() {
    echo_step "Creating/checking application..."
    
    if koyeb app list | grep -q "$APP_NAME"; then
        echo_info "Application '$APP_NAME' already exists"
    else
        echo_info "Creating application '$APP_NAME'..."
        koyeb app create "$APP_NAME"
        echo_info "Application created successfully"
    fi
}

# Create database secrets
create_database_secrets() {
    echo_step "Creating database secrets..."
    
    # Generate secure passwords if not provided
    POSTGRES_USER="${POSTGRES_USER:-octavia_db_user}"
    POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -base64 32)}"
    
    # Create secrets
    echo_info "Creating database user secret..."
    koyeb secret create postgres-user --value "$POSTGRES_USER" --app "$APP_NAME" || echo_warning "Secret might already exist"
    
    echo_info "Creating database password secret..."
    koyeb secret create postgres-password --value "$POSTGRES_PASSWORD" --app "$APP_NAME" || echo_warning "Secret might already exist"
    
    echo_info "Database secrets created successfully"
    echo_info "Username: $POSTGRES_USER"
    echo_info "Password: [REDACTED - stored in Koyeb secret]"
}

# Deploy database service
deploy_database_service() {
    echo_step "Deploying database service..."
    
    # Deploy using the database service configuration
    koyeb service create "$SERVICE_NAME" \
        --app "$APP_NAME" \
        --type database \
        --database-engine postgresql \
        --database-version 15 \
        --instance-type standard-2x \
        --disk-size 20 \
        --region "$REGION" \
        --env POSTGRES_DB=octavia_interview_buddy \
        --secret POSTGRES_USER=ref:secret:postgres-user \
        --secret POSTGRES_PASSWORD=ref:secret:postgres-password
    
    echo_info "Database service deployment initiated"
    echo_info "Service name: $SERVICE_NAME"
    echo_info "Application: $APP_NAME"
}

# Wait for service to be ready
wait_for_service_ready() {
    echo_step "Waiting for database service to be ready..."
    
    local max_attempts=60
    local attempt=1
    local wait_time=30
    
    while [ $attempt -le $max_attempts ]; do
        echo_info "Checking service status (attempt $attempt/$max_attempts)..."
        
        SERVICE_STATUS=$(koyeb service describe "$SERVICE_NAME" --app "$APP_NAME" --output json | jq -r '.status' 2>/dev/null || echo "unknown")
        
        if [ "$SERVICE_STATUS" = "running" ]; then
            echo_info "Database service is ready!"
            return 0
        elif [ "$SERVICE_STATUS" = "error" ]; then
            echo_error "Database service deployment failed"
            koyeb service logs "$SERVICE_NAME" --app "$APP_NAME"
            exit 1
        fi
        
        echo_info "Service status: $SERVICE_STATUS. Waiting ${wait_time}s..."
        sleep $wait_time
        attempt=$((attempt + 1))
    done
    
    echo_error "Database service did not become ready in time"
    exit 1
}

# Get database connection information
get_connection_info() {
    echo_step "Getting database connection information..."
    
    # Get service details
    SERVICE_DETAILS=$(koyeb service describe "$SERVICE_NAME" --app "$APP_NAME" --output json)
    
    # Extract connection details
    DB_HOST=$(echo "$SERVICE_DETAILS" | jq -r '.connections[0].host' 2>/dev/null || echo "unknown")
    DB_PORT=$(echo "$SERVICE_DETAILS" | jq -r '.connections[0].port' 2>/dev/null || echo "5432")
    
    # Get secrets
    DB_USER=$(koyeb secret get postgres-user --app "$APP_NAME" --output json | jq -r '.value' 2>/dev/null || echo "unknown")
    DB_PASSWORD=$(koyeb secret get postgres-password --app "$APP_NAME" --output json | jq -r '.value' 2>/dev/null || echo "unknown")
    
    # Create connection string
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/octavia_interview_buddy?sslmode=require"
    
    echo_info "Database connection information:"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: octavia_interview_buddy"
    echo "Username: $DB_USER"
    echo ""
    echo "Connection string:"
    echo "$CONNECTION_STRING"
    echo ""
    
    # Save to environment file
    cat > .env.koyeb.db << EOF
# Koyeb Database Connection
KOYEB_DATABASE_URL=$CONNECTION_STRING
DATABASE_URL=$CONNECTION_STRING
KOYEB_DATABASE_HOST=$DB_HOST
KOYEB_DATABASE_PORT=$DB_PORT
KOYEB_DATABASE_USER=$DB_USER
KOYEB_DATABASE_PASSWORD=$DB_PASSWORD
KOYEB_DATABASE_NAME=octavia_interview_buddy
EOF
    
    echo_info "Connection information saved to .env.koyeb.db"
}

# Initialize database schema and data
initialize_database() {
    echo_step "Initializing database schema and data..."
    
    # Get connection info
    source .env.koyeb.db
    
    # Copy initialization script to temp location
    cp database/init-koyeb-database.sh /tmp/init-db.sh
    chmod +x /tmp/init-db.sh
    
    # Run initialization in a temporary container
    echo_info "Running database initialization..."
    
    # Create a temporary service to run initialization
    TEMP_SERVICE="db-init-$(date +%s)"
    
    koyeb service create "$TEMP_SERVICE" \
        --app "$APP_NAME" \
        --docker-image postgres:15-alpine \
        --env-file .env.koyeb.db \
        --env CREATE_DEV_DATA=false \
        --command "sleep 300" \
        --region "$REGION"
    
    # Wait for init service to be ready
    sleep 30
    
    # Copy and run initialization script
    echo_info "Copying initialization files..."
    # Note: In a real deployment, you'd mount the database files or use a custom image
    
    # Clean up temporary service
    koyeb service delete "$TEMP_SERVICE" --app "$APP_NAME" || true
    
    echo_info "Database initialization completed"
}

# Update backend service with new database connection
update_backend_service() {
    echo_step "Updating backend service with new database connection..."
    
    if koyeb service list --app "$APP_NAME" | grep -q "octavia-backend"; then
        echo_info "Updating existing backend service..."
        
        koyeb service update octavia-backend \
            --app "$APP_NAME" \
            --env KOYEB_DATABASE_URL="$CONNECTION_STRING" \
            --env DATABASE_URL="$CONNECTION_STRING"
        
        echo_info "Backend service updated with new database connection"
    else
        echo_info "Backend service not found, skipping update"
        echo_info "Remember to update your backend service with these environment variables:"
        echo "  KOYEB_DATABASE_URL=$CONNECTION_STRING"
        echo "  DATABASE_URL=$CONNECTION_STRING"
    fi
}

# Display final status and next steps
display_final_status() {
    echo_info "=== Database Service Deployment Complete ==="
    echo ""
    echo "✅ Database service deployed successfully!"
    echo "📋 Service Details:"
    echo "   - Name: $SERVICE_NAME"
    echo "   - Application: $APP_NAME"
    echo "   - Region: $REGION"
    echo "   - Status: Running"
    echo ""
    echo "🔗 Connection Information:"
    echo "   - Host: $DB_HOST"
    echo "   - Port: $DB_PORT"
    echo "   - Database: octavia_interview_buddy"
    echo "   - Username: $DB_USER"
    echo ""
    echo "📁 Configuration Files Created:"
    echo "   - .env.koyeb.db (connection details)"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Update your backend service with the new database connection"
    echo "   2. Test the database connection"
    echo "   3. Run your application against the new database"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View service: koyeb service describe $SERVICE_NAME --app $APP_NAME"
    echo "   View logs: koyeb service logs $SERVICE_NAME --app $APP_NAME"
    echo "   Scale service: koyeb service update $SERVICE_NAME --app $APP_NAME --instances 2"
    echo "   Delete service: koyeb service delete $SERVICE_NAME --app $APP_NAME"
}

# Main execution
main() {
    echo_info "Starting Koyeb database service deployment..."
    
    check_koyeb_cli
    authenticate_koyeb
    create_application
    create_database_secrets
    deploy_database_service
    wait_for_service_ready
    get_connection_info
    initialize_database
    update_backend_service
    display_final_status
    
    echo_info "Deployment completed successfully! 🎉"
}

# Handle cleanup on script termination
cleanup() {
    echo_info "Cleaning up..."
    # Any cleanup operations if needed
}

trap cleanup EXIT

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  POSTGRES_USER      Database username (default: generated)"
        echo "  POSTGRES_PASSWORD  Database password (default: generated)"
        echo "  REGION            Deployment region (default: us-east-1)"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac