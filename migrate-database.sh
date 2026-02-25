#!/bin/bash

# Database Migration Script - Local to Koyeb PostgreSQL
# Checks for local PostgreSQL data and migrates it to Koyeb

set -e

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

# Check for local PostgreSQL
check_local_postgres() {
    echo_step "Checking for local PostgreSQL installation..."
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        echo_warning "PostgreSQL client (psql) not found"
        echo_info "This might mean PostgreSQL is not installed locally"
        return 1
    fi
    
    echo_info "PostgreSQL client found"
    
    # Check if PostgreSQL service is running
    if pg_isready &> /dev/null; then
        echo_info "Local PostgreSQL service is running"
        LOCAL_POSTGRES_RUNNING=true
    else
        echo_warning "Local PostgreSQL service is not running or not accessible"
        LOCAL_POSTGRES_RUNNING=false
    fi
    
    return 0
}

# Check for existing local database
check_existing_database() {
    echo_step "Checking for existing local database..."
    
    if [ "$LOCAL_POSTGRES_RUNNING" = false ]; then
        echo_info "Skipping local database check - PostgreSQL not running"
        return 1
    fi
    
    # Try to connect to default database and check for our database
    DB_EXISTS=$(psql postgres -t -c "SELECT 1 FROM pg_database WHERE datname = 'octavia_interview_buddy';" 2>/dev/null | tr -d ' ')
    
    if [ "$DB_EXISTS" = "1" ]; then
        echo_info "✅ Found existing local database: octavia_interview_buddy"
        EXISTING_LOCAL_DB=true
        
        # Check what tables exist
        echo_info "Checking database structure..."
        TABLE_COUNT=$(psql octavia_interview_buddy -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ') || TABLE_COUNT=0
        
        if [ "$TABLE_COUNT" -gt 0 ]; then
            echo_info "Found $TABLE_COUNT tables in local database"
            
            # Show table names
            echo_info "Tables in local database:"
            psql octavia_interview_buddy -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>/dev/null || echo "Could not list tables"
            
            # Check for data
            echo_info "Checking for existing data..."
            for table in users institutions interviews resumes; do
                COUNT=$(psql octavia_interview_buddy -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ') || COUNT=0
                if [ "$COUNT" -gt 0 ]; then
                    echo_info "  $table: $COUNT records"
                fi
            done
        else
            echo_info "Local database exists but appears to be empty"
        fi
    else
        echo_info "No existing local database found"
        EXISTING_LOCAL_DB=false
    fi
    
    return 0
}

# Create database dump
create_database_dump() {
    echo_step "Creating database dump..."
    
    if [ "$EXISTING_LOCAL_DB" = false ]; then
        echo_info "No local database to dump"
        return 0
    fi
    
    DUMP_FILE="local-db-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    echo_info "Creating dump file: $DUMP_FILE"
    
    # Create dump excluding ownership and permissions
    pg_dump octavia_interview_buddy --no-owner --no-privileges > "$DUMP_FILE"
    
    if [ $? -eq 0 ]; then
        echo_info "✅ Database dump created successfully: $DUMP_FILE"
        echo_info "Size: $(du -h "$DUMP_FILE" | cut -f1)"
        DUMP_CREATED=true
        DUMP_FILENAME="$DUMP_FILE"
    else
        echo_error "Failed to create database dump"
        DUMP_CREATED=false
    fi
}

# Check Koyeb database connection
check_koyeb_connection() {
    echo_step "Checking Koyeb database connection..."
    
    # Source Koyeb database connection
    if [ ! -f ".env.koyeb.db" ]; then
        echo_error "Koyeb database connection file (.env.koyeb.db) not found"
        echo_info "Please run the database deployment first"
        return 1
    fi
    
    source .env.koyeb.db
    
    # Test connection
    if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        echo_info "✅ Successfully connected to Koyeb database"
        KOYEB_CONNECTION_WORKING=true
    else
        echo_error "Cannot connect to Koyeb database"
        echo_info "Please verify the connection details in .env.koyeb.db"
        KOYEB_CONNECTION_WORKING=false
        return 1
    fi
}

# Initialize Koyeb database schema
initialize_koyeb_schema() {
    echo_step "Initializing Koyeb database schema..."
    
    if [ "$KOYEB_CONNECTION_WORKING" = false ]; then
        return 1
    fi
    
    # Check if schema already exists
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ') || TABLE_COUNT=0
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo_warning "Koyeb database already has tables. Skipping schema initialization."
        echo_info "Found $TABLE_COUNT existing tables"
        return 0
    fi
    
    # Apply schema
    echo_info "Applying database schema..."
    psql "$DATABASE_URL" -f database/schema.sql
    
    if [ $? -eq 0 ]; then
        echo_info "✅ Schema applied successfully"
    else
        echo_error "Failed to apply schema"
        return 1
    fi
}

# Migrate data to Koyeb
migrate_data_to_koyeb() {
    echo_step "Migrating data to Koyeb database..."
    
    if [ "$DUMP_CREATED" = false ] || [ "$KOYEB_CONNECTION_WORKING" = false ]; then
        echo_info "Skipping data migration"
        return 0
    fi
    
    echo_info "Restoring data from $DUMP_FILENAME..."
    
    # Restore dump to Koyeb database
    psql "$DATABASE_URL" < "$DUMP_FILENAME"
    
    if [ $? -eq 0 ]; then
        echo_info "✅ Data migration completed successfully"
        
        # Verify migrated data
        echo_info "Verifying migrated data..."
        for table in users institutions interviews resumes; do
            COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ') || COUNT=0
            if [ "$COUNT" -gt 0 ]; then
                echo_info "  $table: $COUNT records migrated"
            fi
        done
    else
        echo_error "Data migration failed"
        return 1
    fi
}

# Display migration summary
display_migration_summary() {
    echo_info "=== Database Migration Summary ==="
    echo ""
    
    if [ "$LOCAL_POSTGRES_RUNNING" = true ]; then
        echo "✅ Local PostgreSQL: Running"
    else
        echo "⚠️  Local PostgreSQL: Not running/not found"
    fi
    
    if [ "$EXISTING_LOCAL_DB" = true ]; then
        echo "✅ Local Database: Found (octavia_interview_buddy)"
    else
        echo "ℹ️  Local Database: Not found or empty"
    fi
    
    if [ "$DUMP_CREATED" = true ]; then
        echo "✅ Local Data Dump: Created ($DUMP_FILENAME)"
    else
        echo "ℹ️  Local Data Dump: Not created"
    fi
    
    if [ "$KOYEB_CONNECTION_WORKING" = true ]; then
        echo "✅ Koyeb Database: Connected"
    else
        echo "❌ Koyeb Database: Connection failed"
    fi
    
    echo ""
    echo "📁 Migration Files:"
    if [ "$DUMP_CREATED" = true ]; then
        echo "   - Backup: $DUMP_FILENAME"
    fi
    echo "   - Connection: .env.koyeb.db"
    echo ""
    
    if [ "$DUMP_CREATED" = true ] && [ "$KOYEB_CONNECTION_WORKING" = true ]; then
        echo "🎉 Migration completed successfully!"
        echo "Your data has been moved from local PostgreSQL to Koyeb PostgreSQL."
    elif [ "$EXISTING_LOCAL_DB" = false ]; then
        echo "ℹ️  No existing local data found. Koyeb database is ready for fresh setup."
    else
        echo "⚠️  Migration incomplete. Please check the steps above."
    fi
}

# Main execution
main() {
    echo_info "Starting database migration process..."
    
    check_local_postgres
    check_existing_database
    create_database_dump
    check_koyeb_connection
    initialize_koyeb_schema
    migrate_data_to_koyeb
    display_migration_summary
    
    echo_info "Migration process completed!"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --check-only   Only check for local database, don't migrate"
        echo "  --dump-only    Only create local database dump"
        echo ""
        echo "This script checks for local PostgreSQL data and migrates it to Koyeb PostgreSQL."
        exit 0
        ;;
    --check-only)
        check_local_postgres
        check_existing_database
        ;;
    --dump-only)
        check_local_postgres
        check_existing_database
        create_database_dump
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