#!/bin/bash

# Koyeb PostgreSQL Database Initialization Script
# This script initializes the database schema and data on Koyeb PostgreSQL

set -e

# Configuration - these will be set by Koyeb environment
DB_NAME="${POSTGRES_DB:-octavia_interview_buddy}"
DB_USER="${POSTGRES_USER:-koyeb-adm}"
DB_PASSWORD="${POSTGRES_PASSWORD}"
DB_HOST="${KOYEB_DATABASE_HOST:-localhost}"
DB_PORT="${KOYEB_DATABASE_PORT:-5432}"

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

# Wait for PostgreSQL to be ready
wait_for_postgres() {
    echo_info "Waiting for PostgreSQL to be ready..."
    local retries=30
    local wait_time=2
    
    while [ $retries -gt 0 ]; do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
            echo_info "PostgreSQL is ready!"
            return 0
        fi
        
        echo_info "PostgreSQL not ready yet, waiting ${wait_time}s... ($retries attempts remaining)"
        sleep $wait_time
        retries=$((retries - 1))
    done
    
    echo_error "PostgreSQL failed to become ready in time"
    exit 1
}

# Create database extensions
create_extensions() {
    echo_step "Creating PostgreSQL extensions..."
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF
-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Verify extensions
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pg_trgm', 'citext');
EOF

    echo_info "Extensions created successfully"
}

# Run schema migration
run_schema_migration() {
    echo_step "Running schema migration..."
    
    if [ ! -f "/app/database/schema.sql" ]; then
        echo_error "schema.sql file not found at /app/database/schema.sql"
        exit 1
    fi
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/database/schema.sql
    
    echo_info "Schema migration completed successfully"
}

# Create initial data
create_initial_data() {
    echo_step "Creating initial data..."
    
    # Create platform admin user with proper password hash
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF
-- Create platform admin with proper bcrypt hash for "admin123"
INSERT INTO users (email, password_hash, name, role, is_email_verified) VALUES
    ('admin@octavia-interview.com', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmyRgvBThUBgLvu', 'Platform Administrator', 'platform_admin', TRUE)
ON CONFLICT (email) DO NOTHING;
EOF

    echo_info "Initial data created successfully"
}

# Create development data (optional)
create_development_data() {
    if [ "$CREATE_DEV_DATA" = "true" ]; then
        echo_step "Creating development data..."
        
        if [ -f "/app/database/dev-data.sql" ]; then
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /app/database/dev-data.sql
            echo_info "Development data created successfully"
        else
            echo_warning "dev-data.sql not found, skipping development data creation"
        fi
    else
        echo_info "Skipping development data creation (CREATE_DEV_DATA not set to true)"
    fi
}

# Verify database setup
verify_setup() {
    echo_step "Verifying database setup..."
    
    # Check table count
    TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    " | tr -d ' ')
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo_info "Database setup verified successfully!"
        echo_info "Tables created: $TABLE_COUNT"
        
        # Show created tables
        echo_info "Created tables:"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename;
        "
    else
        echo_error "No tables found. Setup may have failed."
        exit 1
    fi
}

# Create database connection info file
create_connection_info() {
    echo_step "Creating connection information..."
    
    cat > /app/database-connection-info.txt << EOF
# Octavia Interview Buddy Database Connection Information

## Connection Details
Host: $DB_HOST
Port: $DB_PORT
Database: $DB_NAME
Username: $DB_USER

## Connection String
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require

## Environment Variables to Set
KOYEB_DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require

## Notes
- Connection uses SSL encryption (sslmode=require)
- Connection pooling is handled by the application
- PgBouncer connection pooler is enabled for better performance
EOF

    echo_info "Connection information saved to /app/database-connection-info.txt"
}

# Main execution
main() {
    echo_info "Starting Octavia Interview Buddy database initialization on Koyeb..."
    
    wait_for_postgres
    create_extensions
    run_schema_migration
    create_initial_data
    create_development_data
    verify_setup
    create_connection_info
    
    echo_info "Database initialization completed successfully!"
    echo_info "Database is ready for use with Octavia Interview Buddy application"
}

# Handle script termination
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
        echo "  --dev-data     Also create development data"
        echo ""
        echo "Environment variables:"
        echo "  CREATE_DEV_DATA    Set to 'true' to create development data"
        echo "  POSTGRES_DB        Database name (default: octavia_interview_buddy)"
        echo "  POSTGRES_USER      Database user (default: koyeb-adm)"
        echo "  POSTGRES_PASSWORD  Database password"
        echo "  KOYEB_DATABASE_HOST Database host"
        echo "  KOYEB_DATABASE_PORT Database port (default: 5432)"
        exit 0
        ;;
    --dev-data)
        export CREATE_DEV_DATA=true
        main
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