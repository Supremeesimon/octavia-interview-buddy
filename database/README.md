# Koyeb PostgreSQL Database Service for Octavia Interview Buddy

This directory contains all the configuration and scripts needed to deploy a fully managed, serverless PostgreSQL database service on Koyeb for the Octavia Interview Buddy application.

## Overview

The database service provides:
- **Serverless PostgreSQL 15** with automatic scaling
- **High availability** with automatic failover
- **Built-in backups** and point-in-time recovery
- **Connection pooling** with PgBouncer
- **SSL encryption** for all connections
- **Performance monitoring** and metrics

## Directory Structure

```
database/
├── koyeb-database-service.yaml    # Koyeb service configuration
├── init-koyeb-database.sh         # Database initialization script
├── schema.sql                     # Database schema definition
├── dev-data.sql                   # Development sample data
└── setup.sh                       # Local database setup script
```

## Prerequisites

1. **Koyeb Account**: Sign up at [koyeb.com](https://koyeb.com)
2. **Koyeb CLI**: Install the command-line interface
   ```bash
   # Using npm
   npm install -g @koyeb/cli
   
   # Using Homebrew (macOS)
   brew tap koyeb/tap
   brew install koyeb
   
   # Using curl
   curl -L https://koyeb-cli.netlify.app/install.sh | sh
   ```

3. **Authentication**: Log in to your Koyeb account
   ```bash
   koyeb login
   ```

## Quick Deployment

### 1. Deploy the Database Service

Run the deployment script from the project root:

```bash
chmod +x deploy-database-service.sh
./deploy-database-service.sh
```

This will:
- Create the Koyeb application if it doesn't exist
- Set up database secrets (username/password)
- Deploy the PostgreSQL database service
- Initialize the database schema and sample data
- Generate connection information

### 2. Update Your Application

The deployment script creates a `.env.koyeb.db` file with your database connection details. Update your application's environment variables:

```bash
# Load the database connection variables
source .env.koyeb.db

# Set these in your backend service
koyeb service update octavia-backend \
  --app octavia-interview-buddy \
  --env KOYEB_DATABASE_URL="$KOYEB_DATABASE_URL" \
  --env DATABASE_URL="$DATABASE_URL"
```

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Create Application and Secrets

```bash
# Create application
koyeb app create octavia-interview-buddy

# Create database secrets
koyeb secret create postgres-user --value "octavia_db_user" --app octavia-interview-buddy
koyeb secret create postgres-password --value "$(openssl rand -base64 32)" --app octavia-interview-buddy
```

### 2. Deploy Database Service

```bash
koyeb service create octavia-postgres \
  --app octavia-interview-buddy \
  --type database \
  --database-engine postgresql \
  --database-version 15 \
  --instance-type standard-2x \
  --disk-size 20 \
  --region us-east-1 \
  --env POSTGRES_DB=octavia_interview_buddy \
  --secret POSTGRES_USER=ref:secret:postgres-user \
  --secret POSTGRES_PASSWORD=ref:secret:postgres-password
```

### 3. Get Connection Information

```bash
# Get service details
SERVICE_DETAILS=$(koyeb service describe octavia-postgres --app octavia-interview-buddy --output json)

# Extract connection details
DB_HOST=$(echo "$SERVICE_DETAILS" | jq -r '.connections[0].host')
DB_PORT=$(echo "$SERVICE_DETAILS" | jq -r '.connections[0].port')

# Get secrets
DB_USER=$(koyeb secret get postgres-user --app octavia-interview-buddy --output json | jq -r '.value')
DB_PASSWORD=$(koyeb secret get postgres-password --app octavia-interview-buddy --output json | jq -r '.value')

# Create connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/octavia_interview_buddy?sslmode=require"
```

### 4. Initialize Database

Connect to your database and run the schema:

```bash
# Connect and run schema
psql "$DATABASE_URL" -f database/schema.sql

# Optionally load development data
psql "$DATABASE_URL" -f database/dev-data.sql
```

## Database Schema

The database includes the following key tables:

### Core Tables
- **users**: User accounts (students, teachers, admins)
- **institutions**: Educational institutions
- **resumes**: Student resumes in various formats
- **interviews**: AI-powered interview sessions
- **session_purchases**: Institution session purchases
- **session_pools**: Available interview sessions

### Supporting Tables
- **interview_feedback**: AI-generated feedback
- **student_stats**: Performance statistics
- **activity_logs**: Audit trail
- **notifications**: In-app notifications

### Features
- **Multi-tenancy**: Institutions are isolated from each other
- **Row Level Security**: Built-in data protection
- **Connection Pooling**: Optimized for high-concurrency
- **Indexing**: Performance-optimized queries
- **Triggers**: Automatic timestamp updates

## Management Commands

### View Service Status
```bash
koyeb service describe octavia-postgres --app octavia-interview-buddy
```

### View Logs
```bash
koyeb service logs octavia-postgres --app octavia-interview-buddy
```

### Scale Database
```bash
# Scale to multiple instances for high availability
koyeb service update octavia-postgres --app octavia-interview-buddy --instances 3
```

### Backup and Restore
```bash
# Create backup
pg_dump "$DATABASE_URL" > backup.sql

# Restore backup
psql "$DATABASE_URL" < backup.sql
```

### Monitor Performance
```bash
# View service metrics
koyeb service metrics octavia-postgres --app octavia-interview-buddy
```

## Security Features

### Connection Security
- **SSL/TLS**: All connections encrypted by default
- **Authentication**: Strong password requirements
- **Network Isolation**: Private network access

### Data Protection
- **Row Level Security**: Users can only access their data
- **Encrypted Storage**: Data at rest encryption
- **Access Controls**: Role-based permissions

### Compliance
- **Backups**: Automated daily backups
- **Recovery**: Point-in-time recovery available
- **Audit Logs**: Comprehensive activity logging

## Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check service status and logs
koyeb service describe octavia-postgres --app octavia-interview-buddy
koyeb service logs octavia-postgres --app octavia-interview-buddy
```

**Connection refused:**
```bash
# Verify service is running
koyeb service list --app octavia-interview-buddy

# Check connection details
koyeb service describe octavia-postgres --app octavia-interview-buddy --output json | jq '.connections'
```

**Authentication errors:**
```bash
# Verify secrets
koyeb secret list --app octavia-interview-buddy

# Recreate secrets if needed
koyeb secret delete postgres-password --app octavia-interview-buddy
koyeb secret create postgres-password --value "new_secure_password" --app octavia-interview-buddy
```

### Testing Connection

```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Test schema
psql "$DATABASE_URL" -c "\dt"  # List tables
```

## Cost Considerations

### Pricing Factors
- **Instance Type**: standard-2x ($0.12/hour) vs premium options
- **Storage**: $0.10/GB/month for persistent storage
- **Backup Storage**: Additional cost for backup retention
- **Network**: Outbound data transfer costs

### Optimization Tips
- **Right-size instances** based on actual usage
- **Enable auto-scaling** to handle traffic spikes efficiently
- **Monitor usage** and adjust resources accordingly
- **Use connection pooling** to minimize connection overhead

## Migration from Existing Database

If you're migrating from another database:

1. **Export current data:**
   ```bash
   pg_dump "your-current-database-url" > migration-backup.sql
   ```

2. **Modify export for Koyeb:**
   - Remove any database/user creation statements
   - Adjust any Koyeb-specific configurations

3. **Import to Koyeb database:**
   ```bash
   psql "$DATABASE_URL" < migration-backup.sql
   ```

## Support

For issues with the Koyeb database service:
- Check [Koyeb Documentation](https://www.koyeb.com/docs)
- Contact Koyeb support through your dashboard
- Review service logs and metrics

For issues with the Octavia Interview Buddy application:
- Check application logs
- Verify database connection settings
- Test database connectivity independently