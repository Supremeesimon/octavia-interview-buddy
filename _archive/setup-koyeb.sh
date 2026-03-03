#!/bin/bash

# Koyeb Setup Script for Octavia Interview Buddy
# This script helps set up your Koyeb infrastructure for the application

echo "==========================================="
echo "Koyeb Setup for Octavia Interview Buddy"
echo "==========================================="

echo
echo "Prerequisites:"
echo "1. Koyeb CLI installed (version 5.9.0 or higher)"
echo "2. Koyeb account with API token"
echo "3. Current working directory: $(pwd)"
echo

# Check if koyeb CLI is available
if command -v koyeb &> /dev/null; then
    echo "✓ Koyeb CLI found"
    KOYEB_VERSION=$(koyeb version 2>/dev/null)
    echo "  Version: $KOYEB_VERSION"
else
    echo "⚠ Koyeb CLI not found in PATH"
    echo "  Trying direct path..."
    if [ -f "/usr/local/bin/koyeb" ]; then
        echo "✓ Koyeb CLI found at /usr/local/bin/koyeb"
        alias koyeb="/usr/local/bin/koyeb"
    else
        echo "✗ Koyeb CLI not found. Please install it first."
        exit 1
    fi
fi

echo
echo "Next steps to set up your PostgreSQL database on Koyeb:"
echo
echo "1. Get your Koyeb API token from: https://app.koyeb.com/user/settings/api"
echo "2. Run: koyeb login"
echo "3. Create a PostgreSQL database with:"
echo "   koyeb service create octavia-db --type database --database-engine postgresql"
echo "4. Get the connection details with:"
echo "   koyeb service inspect octavia-db"
echo "5. Update your .env.local file with the database credentials"
echo
echo "Once the database is created, you can use the migration script:"
echo "   node scripts/migrate-database-to-koyeb.cjs"
echo

echo "==========================================="
echo "Setup Complete - Ready to proceed with Koyeb"
echo "==========================================="