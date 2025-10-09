#!/bin/bash

# Database Setup Script for Octavia Interview Buddy
# This script sets up a PostgreSQL database with the required schema

set -e

# Configuration
DB_NAME="octavia_interview_buddy"
DB_USER="octavia_user"
DB_PASSWORD="${DATABASE_PASSWORD:-octavia_password_change_me}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if PostgreSQL is running
check_postgres() {
    echo_info "Checking PostgreSQL connection..."
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
        echo_error "PostgreSQL is not running or not accessible at $DB_HOST:$DB_PORT"
        echo "Please start PostgreSQL and try again."
        exit 1
    fi
    echo_info "PostgreSQL is running"
}

# Create database and user
create_database() {
    echo_info "Creating database and user..."
    
    # Create user if it doesn't exist
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
                CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
            END IF;
        END
        \$\$;
    " || echo_warning "User might already exist"
    
    # Create database if it doesn't exist
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        SELECT 'CREATE DATABASE $DB_NAME'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\\gexec
    " || echo_warning "Database might already exist"
    
    # Grant privileges
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
        ALTER USER $DB_USER CREATEDB;
    "
    
    echo_info "Database and user created successfully"
}

# Run schema migration
run_schema() {
    echo_info "Running schema migration..."
    
    if [ ! -f "schema.sql" ]; then
        echo_error "schema.sql file not found in current directory"
        exit 1
    fi
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f schema.sql
    
    echo_info "Schema migration completed successfully"
}

# Create development data
create_dev_data() {
    echo_info "Creating development data..."
    
    if [ -f "dev-data.sql" ]; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f dev-data.sql
        echo_info "Development data created successfully"
    else
        echo_warning "dev-data.sql not found, skipping development data creation"
    fi
}

# Verify installation
verify_installation() {
    echo_info "Verifying installation..."
    
    # Check if tables exist
    TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    " | tr -d ' ')
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo_info "Database setup completed successfully!"
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

# Display connection info
show_connection_info() {
    echo_info "Database connection information:"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    echo ""
    echo "Connection string:"
    echo "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo ""
    echo_warning "Please update your .env file with these database credentials"
}

# Main execution
main() {
    echo_info "Starting Octavia Interview Buddy database setup..."
    
    check_postgres
    create_database
    run_schema
    create_dev_data
    verify_installation
    show_connection_info
    
    echo_info "Database setup completed successfully!"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --schema-only  Only run schema migration"
        echo "  --dev-data     Only create development data"
        echo ""
        echo "Environment variables:"
        echo "  DATABASE_HOST      PostgreSQL host (default: localhost)"
        echo "  DATABASE_PORT      PostgreSQL port (default: 5432)"
        echo "  DATABASE_PASSWORD  Database password (default: octavia_password_change_me)"
        exit 0
        ;;
    --schema-only)
        check_postgres
        run_schema
        ;;
    --dev-data)
        check_postgres
        create_dev_data
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