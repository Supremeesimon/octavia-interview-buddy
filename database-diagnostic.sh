#!/bin/bash

echo "=== Database Diagnostic Report ==="
echo ""

# Check if PostgreSQL client exists
echo "1. Checking for PostgreSQL client..."
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL client (psql) found"
    PSQL_PATH=$(which psql)
    echo "   Location: $PSQL_PATH"
else
    echo "❌ PostgreSQL client not found"
    echo "   This suggests PostgreSQL may not be installed locally"
fi

echo ""

# Check if PostgreSQL service is running
echo "2. Checking PostgreSQL service status..."
if pg_isready >/dev/null 2>&1; then
    echo "✅ PostgreSQL service is running"
    PG_STATUS="running"
else
    echo "❌ PostgreSQL service is not running or not accessible"
    PG_STATUS="not_running"
fi

echo ""

# Check for our specific database
echo "3. Checking for octavia_interview_buddy database..."
if [ "$PG_STATUS" = "running" ]; then
    DB_EXISTS=$(psql postgres -t -c "SELECT 1 FROM pg_database WHERE datname = 'octavia_interview_buddy';" 2>/dev/null | tr -d ' ')
    if [ "$DB_EXISTS" = "1" ]; then
        echo "✅ Database 'octavia_interview_buddy' exists"
        DB_FOUND="yes"
        
        # Check table count
        TABLE_COUNT=$(psql octavia_interview_buddy -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ') || TABLE_COUNT=0
        echo "   Tables found: $TABLE_COUNT"
        
        # Check for data in key tables
        echo "   Data check:"
        for table in users institutions interviews resumes session_purchases; do
            COUNT=$(psql octavia_interview_buddy -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ') || COUNT=0
            if [ "$COUNT" -gt 0 ]; then
                echo "     $table: $COUNT records"
            fi
        done
    else
        echo "❌ Database 'octavia_interview_buddy' not found"
        DB_FOUND="no"
    fi
else
    echo "⚠️  Cannot check database - PostgreSQL not running"
    DB_FOUND="unknown"
fi

echo ""

# Check Koyeb database
echo "4. Checking Koyeb database connection..."
if [ -f ".env.koyeb.db" ]; then
    source .env.koyeb.db
    echo "✅ Koyeb database configuration found"
    
    # Try to connect
    if command -v psql >/dev/null 2>&1; then
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ Successfully connected to Koyeb database"
            KOYEB_CONNECTED="yes"
            
            # Check Koyeb database structure
            KOYEB_TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ') || KOYEB_TABLES=0
            echo "   Koyeb tables: $KOYEB_TABLES"
        else
            echo "❌ Cannot connect to Koyeb database"
            KOYEB_CONNECTED="no"
        fi
    else
        echo "⚠️  Cannot test Koyeb connection - psql not available"
        KOYEB_CONNECTED="unknown"
    fi
else
    echo "❌ Koyeb database configuration not found"
    echo "   Run the deployment script first"
    KOYEB_CONNECTED="no"
fi

echo ""
echo "=== Summary ==="

if [ "$DB_FOUND" = "yes" ] && [ "$KOYEB_CONNECTED" = "yes" ]; then
    echo "📋 Migration opportunity detected:"
    echo "   - Local data found that can be migrated to Koyeb"
    echo "   - Koyeb database is ready for migration"
    echo "   Run: ./migrate-database.sh"
elif [ "$DB_FOUND" = "no" ] && [ "$KOYEB_CONNECTED" = "yes" ]; then
    echo "📋 Fresh start scenario:"
    echo "   - No local data found"
    echo "   - Koyeb database is ready for new data"
    echo "   You can start using the Koyeb database directly"
elif [ "$KOYEB_CONNECTED" = "no" ]; then
    echo "📋 Setup required:"
    echo "   - Koyeb database connection not established"
    echo "   - Run the deployment script first"
else
    echo "📋 Current status unclear - please check the details above"
fi

echo ""
echo "=== Next Steps ==="
echo "1. If you have local data: ./migrate-database.sh"
echo "2. If starting fresh: Use Koyeb database directly"
echo "3. Test connection: source .env.koyeb.db && psql \"\$DATABASE_URL\" -c \"SELECT version();\""