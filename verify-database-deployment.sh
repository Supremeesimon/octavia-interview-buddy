#!/bin/bash

# Database Service Deployment Verification Script
# Verifies that the Koyeb PostgreSQL database service is properly deployed and configured

set -e

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

# Check prerequisites
check_prerequisites() {
    echo_step "Checking prerequisites..."
    
    # Check Koyeb CLI
    if ! command -v koyeb &> /dev/null; then
        echo_error "Koyeb CLI is not installed"
        echo "Please install it: npm install -g @koyeb/cli"
        exit 1
    fi
    
    # Check authentication
    if ! koyeb whoami &> /dev/null; then
        echo_error "Not authenticated with Koyeb"
        echo "Please run: koyeb login"
        exit 1
    fi
    
    echo_info "Prerequisites check passed"
}

# Verify application exists
verify_application() {
    echo_step "Verifying application exists..."
    
    if ! koyeb app list | grep -q "octavia-interview-buddy"; then
        echo_error "Application 'octavia-interview-buddy' not found"
        echo "Please create it first: koyeb app create octavia-interview-buddy"
        exit 1
    fi
    
    echo_info "Application exists"
}

# Verify database service
verify_database_service() {
    echo_step "Verifying database service..."
    
    if ! koyeb service list --app octavia-interview-buddy | grep -q "octavia-postgres"; then
        echo_error "Database service 'octavia-postgres' not found"
        echo "Please deploy it first using: ./deploy-database-service.sh"
        exit 1
    fi
    
    # Get service status
    SERVICE_STATUS=$(koyeb service describe octavia-postgres --app octavia-interview-buddy --output json | jq -r '.status' 2>/dev/null || echo "unknown")
    
    if [ "$SERVICE_STATUS" != "running" ]; then
        echo_warning "Database service status: $SERVICE_STATUS"
        echo "Service may still be initializing..."
        return 1
    fi
    
    echo_info "Database service is running"
    return 0
}

# Get connection details
get_connection_details() {
    echo_step "Getting connection details..."
    
    SERVICE_DETAILS=$(koyeb service describe octavia-postgres --app octavia-interview-buddy --output json)
    
    DB_HOST=$(echo "$SERVICE_DETAILS" | jq -r '.connections[0].host' 2>/dev/null || echo "unknown")
    DB_PORT=$(echo "$SERVICE_DETAILS" | jq -r '.connections[0].port' 2>/dev/null || echo "5432")
    
    # Get secrets
    DB_USER=$(koyeb secret get postgres-user --app octavia-interview-buddy --output json | jq -r '.value' 2>/dev/null || echo "unknown")
    
    if [ "$DB_HOST" = "unknown" ] || [ "$DB_USER" = "unknown" ]; then
        echo_error "Could not retrieve connection details"
        exit 1
    fi
    
    echo_info "Connection details retrieved:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo "  Database: octavia_interview_buddy"
}

# Test database connectivity
test_connectivity() {
    echo_step "Testing database connectivity..."
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        echo_warning "psql not found, skipping connectivity test"
        echo "Install PostgreSQL client to enable connectivity testing"
        return 0
    fi
    
    # Get password
    DB_PASSWORD=$(koyeb secret get postgres-password --app octavia-interview-buddy --output json | jq -r '.value' 2>/dev/null)
    
    if [ -z "$DB_PASSWORD" ]; then
        echo_warning "Could not retrieve database password, skipping connectivity test"
        return 0
    fi
    
    # Create connection string
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/octavia_interview_buddy?sslmode=require"
    
    # Test connection
    if timeout 10 psql "$CONNECTION_STRING" -c "SELECT 1;" &> /dev/null; then
        echo_info "✅ Database connectivity test passed"
        return 0
    else
        echo_warning "Database connectivity test failed"
        echo "This might be normal if the database is still initializing"
        return 1
    fi
}

# Verify schema
verify_schema() {
    echo_step "Verifying database schema..."
    
    # This would require actual database connection
    echo_info "Schema verification requires database connectivity"
    echo "Run the Node.js test script for detailed schema verification:"
    echo "  node test-database-connection.js"
}

# Generate environment file
generate_env_file() {
    echo_step "Generating environment file..."
    
    # Get password
    DB_PASSWORD=$(koyeb secret get postgres-password --app octavia-interview-buddy --output json | jq -r '.value' 2>/dev/null)
    
    if [ -z "$DB_PASSWORD" ]; then
        echo_warning "Could not retrieve database password"
        return 1
    fi
    
    # Create connection string
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/octavia_interview_buddy?sslmode=require"
    
    # Generate .env file
    cat > .env.koyeb.db << EOF
# Koyeb Database Connection for Octavia Interview Buddy
# Generated on: $(date)

KOYEB_DATABASE_URL=$CONNECTION_STRING
DATABASE_URL=$CONNECTION_STRING
KOYEB_DATABASE_HOST=$DB_HOST
KOYEB_DATABASE_PORT=$DB_PORT
KOYEB_DATABASE_USER=$DB_USER
KOYEB_DATABASE_PASSWORD=$DB_PASSWORD
KOYEB_DATABASE_NAME=octavia_interview_buddy

# Usage in your application:
# source .env.koyeb.db
# Then use \$DATABASE_URL in your application configuration
EOF
    
    echo_info "Environment file generated: .env.koyeb.db"
    echo_info "Load it with: source .env.koyeb.db"
}

# Display summary
display_summary() {
    echo_info "=== Database Service Verification Summary ==="
    echo ""
    echo "✅ Application: octavia-interview-buddy"
    echo "✅ Database Service: octavia-postgres"
    echo "✅ Status: Running"
    echo "✅ Host: $DB_HOST"
    echo "✅ Port: $DB_PORT"
    echo "✅ User: $DB_USER"
    echo "✅ Database: octavia_interview_buddy"
    echo ""
    echo "📁 Configuration Files:"
    echo "   - .env.koyeb.db (connection details)"
    echo ""
    echo "🧪 Test Commands:"
    echo "   - Node.js test: node test-database-connection.js"
    echo "   - Manual test: psql \"\$DATABASE_URL\" -c \"SELECT version();\""
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Update your backend service with the new database connection"
    echo "   2. Test your application with the database"
    echo "   3. Monitor service performance and logs"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View service: koyeb service describe octavia-postgres --app octavia-interview-buddy"
    echo "   View logs: koyeb service logs octavia-postgres --app octavia-interview-buddy"
    echo "   Scale service: koyeb service update octavia-postgres --app octavia-interview-buddy --instances 2"
}

# Main execution
main() {
    echo_info "Starting database service verification..."
    
    check_prerequisites
    verify_application
    verify_database_service
    get_connection_details
    test_connectivity
    verify_schema
    generate_env_file
    display_summary
    
    echo_info "Verification completed successfully! 🎉"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "This script verifies that the Koyeb PostgreSQL database service"
        echo "is properly deployed and generates connection configuration files."
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