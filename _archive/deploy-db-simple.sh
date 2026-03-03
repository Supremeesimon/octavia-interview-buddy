#!/bin/bash

# Simplified Koyeb PostgreSQL Database Deployment Script
# Uses correct Koyeb CLI syntax

set -e

# Configuration
DB_SERVICE_NAME="octavia-postgres"
APP_NAME="octavia-interview-buddy"
REGION="was"  # Washington DC region

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check authentication
check_authentication() {
    echo_step "Checking Koyeb authentication..."
    
    if koyeb organizations list &> /dev/null; then
        echo_info "Successfully authenticated with Koyeb"
    else
        echo_error "Not authenticated with Koyeb"
        echo "Please run: koyeb login"
        exit 1
    fi
}

# Create application if it doesn't exist
create_application() {
    echo_step "Checking application..."
    
    # Try to get the app first - if it succeeds, it exists
    if koyeb apps get "$APP_NAME" &> /dev/null; then
        echo_info "Application '$APP_NAME' already exists"
    else
        echo_info "Creating application '$APP_NAME'..."
        koyeb apps create "$APP_NAME"
        echo_info "Application created successfully"
    fi
}

# Create database service
create_database() {
    echo_step "Creating PostgreSQL database service..."
    
    # Generate secure password
    DB_PASSWORD=$(openssl rand -base64 32)
    DB_USER="octavia_db_user"
    
    # Create the database
    koyeb databases create "$DB_SERVICE_NAME" \
        --app "$APP_NAME" \
        --db-name "octavia_interview_buddy" \
        --db-owner "$DB_USER" \
        --instance-type "small" \
        --pg-version 15 \
        --region "$REGION"
    
    echo_info "Database service created successfully!"
    echo_info "Service name: $DB_SERVICE_NAME"
    echo_info "Database name: octavia_interview_buddy"
    echo_info "Database user: $DB_USER"
    echo_info "Database password: $DB_PASSWORD"
    
    # Store password as secret
    echo_step "Creating database password secret..."
    echo "$DB_PASSWORD" | koyeb secrets create "db-password-$DB_SERVICE_NAME" --value-from-stdin
    
    echo_info "Database password stored as secret"
}

# Wait for database to be ready
wait_for_database_ready() {
    echo_step "Waiting for database to be ready..."
    
    local max_attempts=30
    local attempt=1
    local wait_time=30
    
    while [ $attempt -le $max_attempts ]; do
        echo_info "Checking database status (attempt $attempt/$max_attempts)..."
        
        # Get database status
        DB_STATUS=$(koyeb databases get "$DB_SERVICE_NAME" --app "$APP_NAME" --output json | jq -r '.status' 2>/dev/null || echo "unknown")
        
        if [ "$DB_STATUS" = "running" ]; then
            echo_info "Database is ready!"
            return 0
        elif [ "$DB_STATUS" = "error" ]; then
            echo_error "Database deployment failed"
            koyeb databases get "$DB_SERVICE_NAME" --app "$APP_NAME"
            exit 1
        fi
        
        echo_info "Database status: $DB_STATUS. Waiting ${wait_time}s..."
        sleep $wait_time
        attempt=$((attempt + 1))
    done
    
    echo_error "Database did not become ready in time"
    exit 1
}

# Get connection information
get_connection_info() {
    echo_step "Getting database connection information..."
    
    # Get database details
    DB_DETAILS=$(koyeb databases get "$DB_SERVICE_NAME" --app "$APP_NAME" --output json)
    
    # Extract connection details
    DB_HOST=$(echo "$DB_DETAILS" | jq -r '.connection_info.host' 2>/dev/null || echo "unknown")
    DB_PORT=$(echo "$DB_DETAILS" | jq -r '.connection_info.port' 2>/dev/null || echo "5432")
    DB_NAME=$(echo "$DB_DETAILS" | jq -r '.name' 2>/dev/null || echo "octavia_interview_buddy")
    DB_USER=$(echo "$DB_DETAILS" | jq -r '.owner' 2>/dev/null || echo "octavia_db_user")
    
    # Get password from secret
    DB_PASSWORD=$(koyeb secrets reveal "db-password-$DB_SERVICE_NAME" --output json | jq -r '.value' 2>/dev/null || echo "unknown")
    
    # Create connection string
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"
    
    echo_info "Database connection information:"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_NAME"
    echo "Username: $DB_USER"
    echo "Password: [REDACTED]"
    echo ""
    echo "Connection string:"
    echo "$CONNECTION_STRING"
    echo ""
    
    # Save to environment file
    cat > .env.koyeb.db << EOF
# Koyeb Database Connection for Octavia Interview Buddy
# Generated on: $(date)

KOYEB_DATABASE_URL=$CONNECTION_STRING
DATABASE_URL=$CONNECTION_STRING
KOYEB_DATABASE_HOST=$DB_HOST
KOYEB_DATABASE_PORT=$DB_PORT
KOYEB_DATABASE_USER=$DB_USER
KOYEB_DATABASE_PASSWORD=$DB_PASSWORD
KOYEB_DATABASE_NAME=$DB_NAME

# Usage in your application:
# source .env.koyeb.db
# Then use \$DATABASE_URL in your application configuration
EOF
    
    echo_info "Connection information saved to .env.koyeb.db"
}

# Initialize database schema
initialize_database() {
    echo_step "Initializing database schema..."
    
    # Source the connection info
    source .env.koyeb.db
    
    echo_info "Database will be initialized with the schema from database/schema.sql"
    echo_info "You can run this manually with:"
    echo "psql \"\$DATABASE_URL\" -f database/schema.sql"
}

# Display final status
display_final_status() {
    echo_info "=== Database Service Deployment Complete ==="
    echo ""
    echo "✅ Database service deployed successfully!"
    echo "📋 Service Details:"
    echo "   - Name: $DB_SERVICE_NAME"
    echo "   - Application: $APP_NAME"
    echo "   - Region: $REGION"
    echo "   - Status: Running"
    echo ""
    echo "🔗 Connection Information:"
    echo "   - Host: $DB_HOST"
    echo "   - Port: $DB_PORT"
    echo "   - Database: $DB_NAME"
    echo "   - Username: $DB_USER"
    echo ""
    echo "📁 Configuration Files Created:"
    echo "   - .env.koyeb.db (connection details)"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Initialize database schema:"
    echo "      psql \"\$DATABASE_URL\" -f database/schema.sql"
    echo "   2. Test the connection:"
    echo "      node test-database-connection.js"
    echo "   3. Update your backend service with the new database connection"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View database: koyeb databases get $DB_SERVICE_NAME --app $APP_NAME"
    echo "   View logs: koyeb databases get $DB_SERVICE_NAME --app $APP_NAME"
    echo "   Delete database: koyeb databases delete $DB_SERVICE_NAME --app $APP_NAME"
}

# Main execution
main() {
    echo_info "Starting Koyeb PostgreSQL database deployment..."
    
    check_authentication
    create_application
    create_database
    wait_for_database_ready
    get_connection_info
    initialize_database
    display_final_status
    
    echo_info "Deployment completed successfully! 🎉"
}

# Handle script termination
cleanup() {
    echo_info "Cleaning up..."
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
        echo "This script deploys a PostgreSQL database service on Koyeb"
        echo "for the Octavia Interview Buddy application."
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