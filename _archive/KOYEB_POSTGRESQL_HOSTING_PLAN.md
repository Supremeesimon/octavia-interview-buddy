# Koyeb PostgreSQL Database Hosting for Octavia Interview Buddy

## Current Database Configuration

### Current Setup
- **Database**: PostgreSQL
- **Connection Method**: Connection pooling via `pg` library
- **Environment Variables** (from `.env.local`):
  - `DATABASE_URL`: postgresql://simon@localhost:5432/octavia_interview_buddy
  - `DB_USER`: simon
  - `DB_HOST`: localhost
  - `DB_NAME`: octavia_interview_buddy
  - `DB_PASSWORD`: (empty)
  - `DB_PORT`: 5432

### Database Configuration Files
The application uses PostgreSQL connection pooling through the `pg` library in multiple files:

1. **backend/config/database.js** - Main database configuration
2. **functions/src/institution-management/validation-alerts.js** - PostgreSQL connection in validation system
3. **functions/src/institution-management/index.js** - PostgreSQL connection in institution management
4. **functions/src/institution-management/automated-institution-setup.js** - PostgreSQL connection in setup automation
5. **functions/src/institution-management/sync-monitor.js** - PostgreSQL connection in sync monitor

### Connection Pooling Configuration
```javascript
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL, // Use connection string if available
});
```

## Koyeb CLI: Command-Line Interface for Managing Applications

### What is the Koyeb CLI?
The Koyeb CLI (Command Line Interface) is a tool that allows you to manage your Koyeb applications, services, and infrastructure directly from your terminal. It provides a convenient way to deploy, configure, and monitor your applications without needing to use the web dashboard.

### Installing Koyeb CLI
```bash
# Install via npm
npm install -g @koyeb/cli

# Or install via Homebrew (macOS)
brew tap koyeb/tap
brew install koyeb

# Or install via script
curl -L https://koyeb-cli.netlify.app/install.sh | sh
```

### How Koyeb CLI Can Help with Your Application

#### 1. **Application Deployment**
```bash
# Deploy your application from Git
koyeb deploy create --name octavia-interview-buddy --git github.com/username/octavia-interview-buddy --git-branch main

# Deploy from Docker image
koyeb service create octavia-interview-buddy --image your-docker-image
```

#### 2. **Database Management**
```bash
# Create a PostgreSQL database instance
koyeb service create my-postgres --type database --database-engine postgresql --database-version 15

# Get database connection details
koyeb service inspect my-postgres

# Scale database resources
koyeb service update my-postgres --definition.instances 2
```

#### 3. **Environment Configuration**
```bash
# Set environment variables for your application
koyeb service update octavia-interview-buddy \
  --env DATABASE_URL="postgresql://..." \
  --env NODE_ENV="production" \
  --env JWT_SECRET="your-secret"

# Update secrets securely
koyeb secret create jwt-secret --value "your-jwt-secret"
koyeb service update octavia-interview-buddy --secret JWT_SECRET=ref:secret:jwt-secret
```

#### 4. **Monitoring and Logs**
```bash
# View application logs
koyeb log stream --app octavia-interview-buddy

# Check service status
koyeb service list
koyeb service ps octavia-interview-buddy

# Monitor health
koyeb deployment list --app octavia-interview-buddy
```

#### 5. **Scaling and Performance**
```bash
# Scale your application
koyeb service update octavia-interview-buddy --definition.instances 3

# Set auto-scaling rules
koyeb service update octavia-interview-buddy \
  --definition.scaling.min 1 \
  --definition.scaling.max 10 \
  --definition.scaling.cpu-target 80
```

#### 6. **Rollbacks and Version Management**
```bash
# Rollback to previous deployment
koyeb deployment rollback --app octavia-interview-buddy --deployment-id [deployment-id]

# List deployments
koyeb deployment list --app octavia-interview-buddy
```

#### 7. **Domain Management**
```bash
# Add custom domain
koyeb app domain create octavia-interview-buddy --domain interview.yourcompany.com

# Manage TLS certificates
koyeb app domain update octavia-interview-buddy --domain interview.yourcompany.com --tls-enabled
```

### Benefits of Using Koyeb CLI for Your Application

1. **Infrastructure as Code**: Define and manage your infrastructure through CLI commands
2. **Automation-Friendly**: Easily integrate deployment steps into CI/CD pipelines
3. **Consistency**: Ensure consistent deployments across environments
4. **Speed**: Faster deployment and management compared to GUI interactions
5. **Scripting**: Create deployment scripts for complex multi-service applications
6. **Team Collaboration**: Share commands and configurations with team members

### Sample Deployment Workflow for Octavia Interview Buddy
```bash
# 1. Authenticate
koyeb login

# 2. Create the application
koyeb app create octavia-interview-buddy

# 3. Create PostgreSQL database
koyeb service create octavia-db --type database --database-engine postgresql

# 4. Deploy backend
koyeb service create octavia-backend \
  --app octavia-interview-buddy \
  --git https://github.com/your-org/octavia-interview-buddy.git \
  --git-branch main \
  --git-buildpack nodejs \
  --port 3006 \
  --env-file .env.production

# 5. Deploy frontend
koyeb service create octavia-frontend \
  --app octavia-interview-buddy \
  --git https://github.com/your-org/octavia-interview-buddy.git \
  --git-branch main \
  --git-buildpack static \
  --port 80

# 6. Configure domain
koyeb app domain create octavia-interview-buddy --domain app.octavia-interview.com
```

### Authentication and Security
```bash
# Login to Koyeb
koyeb login

# Use API tokens for CI/CD
export KOYEB_TOKEN="your-api-token"

# Store configuration locally
# Config is stored in ~/.koyeb.yaml
```

## Koyeb PostgreSQL Hosting Setup

### What is Koyeb?
Koyeb is a developer-friendly serverless platform that provides:
- Global deployment with 50+ locations
- Automatic scaling (from zero to hundreds of instances)
- Built-in HTTPS and global CDN
- Native support for containers and Git deployment
- Serverless PostgreSQL with pgvector support

### Benefits of Using Koyeb for PostgreSQL
1. **Fully Managed**: No database administration required
2. **High Performance**: NVME storage and optimized PostgreSQL instances
3. **Scalability**: Automatic scaling based on demand
4. **Global Access**: Sub-100ms latency worldwide
5. **Security**: Built-in security at all layers
6. **Integration**: Easy integration with your existing application

### Migration Steps to Koyeb PostgreSQL

#### Step 1: Create a Koyeb Account
1. Visit https://koyeb.com and sign up for an account
2. Install the Koyeb CLI: `npm install -g @koyeb/cli`
3. Authenticate: `koyeb login`

#### Step 2: Create PostgreSQL Database on Koyeb
1. In the Koyeb dashboard, navigate to "Databases"
2. Click "Create Database"
3. Select PostgreSQL
4. Choose your preferred region
5. Configure your database instance (size, performance, etc.)
6. Create the database instance

Alternatively, using CLI:
```bash
koyeb service create my-postgres --type database --database-engine postgresql
```

#### Step 3: Update Environment Variables
Once your Koyeb PostgreSQL database is created, you'll receive connection details. Update your `.env.local` file:

```env
# Replace these values with your Koyeb PostgreSQL connection details
DATABASE_URL="postgresql://[username]:[password]@[koyeb-db-host]:[port]/[database-name]"
DB_USER="[username]"
DB_HOST="[koyeb-db-host]"
DB_NAME="[database-name]"
DB_PASSWORD="[password]"
DB_PORT="[port]"
```

#### Step 4: Database Migration
To migrate your existing data to Koyeb PostgreSQL:

1. **Export current database**:
   ```bash
   pg_dump "postgresql://simon@localhost:5432/octavia_interview_buddy" > backup.sql
   ```

2. **Import to Koyeb PostgreSQL**:
   ```bash
   psql [Koyeb_DATABASE_URL] < backup.sql
   ```

#### Step 5: Update Application Configuration
The existing connection pooling configuration in your application should work without changes, as it already uses environment variables and connection strings.

### Alternative: Using Koyeb CLI for Database Management
You can also manage your database using the Koyeb CLI:

```bash
# Create a PostgreSQL service
koyeb service create my-postgres --type database --database-engine postgresql

# Get connection details
koyeb service inspect my-postgres
```

### Configuration for Different Environments
You can maintain different database configurations for development, staging, and production:

1. **Development**: Local PostgreSQL (current setup)
2. **Staging**: Koyeb PostgreSQL with smaller instance
3. **Production**: Koyeb PostgreSQL with larger instance

### Security Considerations
1. **Connection Encryption**: Koyeb provides encrypted connections by default
2. **Environment Variables**: Keep database credentials in environment variables, not code
3. **Connection Pooling**: The current pooling configuration is appropriate for production use
4. **Network Security**: Koyeb provides secure network isolation

### Performance Optimization
1. **Connection Pooling**: Your current configuration is well-optimized
2. **Query Optimization**: Consider adding indexes based on query patterns
3. **Monitoring**: Koyeb provides built-in monitoring and logging
4. **Scaling**: Automatic scaling handles traffic increases

### Backup and Recovery
1. **Automatic Backups**: Koyeb provides automated backups
2. **Point-in-time Recovery**: Available for production instances
3. **Manual Backups**: Can be created via psql commands

### Cost Considerations
1. **Free Tier**: Koyeb offers a free tier for development
2. **Pay-as-you-scale**: Costs increase with usage, not fixed capacity
3. **Resource Efficiency**: Serverless nature optimizes resource usage

### Implementation Checklist
- [ ] Create Koyeb account and set up CLI
- [ ] Create PostgreSQL instance on Koyeb
- [ ] Update environment variables in your application
- [ ] Test database connection in development
- [ ] Migrate existing data to Koyeb PostgreSQL
- [ ] Update deployment configurations
- [ ] Test application functionality with new database
- [ ] Monitor performance and connection pooling
- [ ] Set up backup and monitoring configurations

## Integration with Current Application

The current application is already well-structured for external database hosting:
- Uses environment variables for configuration
- Implements connection pooling
- Handles database errors gracefully
- Works with both local and remote PostgreSQL instances

The transition to Koyeb PostgreSQL should be seamless, requiring only environment variable updates and data migration.