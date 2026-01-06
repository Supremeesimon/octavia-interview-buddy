# Deploying Backend to Koyeb (Alternative Account)

## Overview
This document provides instructions for deploying your Octavia Interview Buddy backend to an alternative Koyeb account that has not been used previously. This will allow you to take advantage of the free tier on the new account.

## Prerequisites
- An alternative Koyeb account (not currently in use)
- Access to your GitHub repository with the Octavia Interview Buddy code
- The Koyeb CLI installed (already done on your system)

## Step-by-Step Deployment Process

### 1. Configure the Alternative Koyeb Account
First, you'll need to authenticate with the alternative account:

```bash
# Create a new config file for the alternative account
mkdir -p ~/.koyeb-alt
echo "token: [YOUR_ALT_ACCOUNT_TOKEN]" > ~/.koyeb-alt.yaml
```

Alternatively, you can temporarily update your existing config file with the new account token:
```bash
# Update the config file with your alternative account token
echo "token: [YOUR_ALT_ACCOUNT_TOKEN]" > ~/.koyeb.yaml
```

### 2. Prepare Your Repository
Make sure your GitHub repository is up to date with the latest changes:
- Updated backend configuration for environment detection
- Database configuration supporting both local and Koyeb environments
- Proper SSL configuration for Koyeb PostgreSQL

### 3. Deploy the Backend Service
Once authenticated with the alternative account, deploy your backend:

```bash
# Navigate to the backend directory
cd /Users/simon/AI\ interview\ Buddy\ /octavia-interview-buddy/backend

# Deploy the backend service
koyeb deploy . octavia-interview-buddy-backend \
  --env NODE_ENV=production \
  --env PORT=8080 \
  --env KOYEB_DATABASE_URL="postgres://koyeb-adm:npg_ZC5b6weVJEzG@ep-snowy-mountain-a4hq7qmm.us-east-1.pg.koyeb.app:5432/koyebdb?sslmode=require" \
  --env DATABASE_URL="postgres://koyeb-adm:npg_ZC5b6weVJEzG@ep-snowy-mountain-a4hq7qmm.us-east-1.pg.koyeb.app:5432/koyebdb?sslmode=require" \
  --ports 8080:http \
  --routes /:8080 \
  --wait
```

### 4. Configure Environment Variables
For security, you should store sensitive information like API keys as secrets:

```bash
# Create secrets for sensitive information
koyeb secret create firebase-private-key --value "[YOUR_FIREBASE_PRIVATE_KEY]"
koyeb secret create firebase-client-email --value "[YOUR_FIREBASE_CLIENT_EMAIL]"
koyeb secret create stripe-secret-key --value "[YOUR_STRIPE_SECRET_KEY]"
koyeb secret create brevo-api-key --value "[YOUR_BREVO_API_KEY]"

# Then reference these secrets in your deployment
koyeb service update octavia-interview-buddy-backend \
  --env FIREBASE_PRIVATE_KEY="{{secret.firebase-private-key}}" \
  --env FIREBASE_CLIENT_EMAIL="{{secret.firebase-client-email}}" \
  --env STRIPE_SECRET_KEY="{{secret.stripe-secret-key}}" \
  --env BREVO_API_KEY="{{secret.brevo-api-key}}"
```

### 5. Verify the Deployment
After deployment, check that your service is running:

```bash
# Check service status
koyeb service list

# Check deployment status
koyeb deployment list --app octavia-interview-buddy-backend

# Check logs
koyeb log stream --app octavia-interview-buddy-backend
```

### 6. Update Frontend Configuration
If your frontend needs to communicate with the backend, update the API endpoint to point to your new backend URL.

### 7. Database Migration (if needed)
If you have existing data in your local database that needs to be migrated:

```bash
# Use the migration script we created
node /Users/simon/AI\ interview\ Buddy\ /octavia-interview-buddy/scripts/migrate-database-to-koyeb.cjs
```

## Architecture Summary

With this setup:
- **Frontend**: Continues to run on Firebase Hosting (excellent CDN performance)
- **Backend**: Runs on Koyeb (colocated with Koyeb PostgreSQL for low latency)
- **Database**: Koyeb PostgreSQL (for structured data)
- **Authentication & Real-time Data**: Firebase (for authentication and real-time features)

## Benefits of This Architecture
1. **Low Latency**: Backend and database are colocated on Koyeb
2. **Cost Effective**: Uses free tiers of both platforms
3. **Performance**: Firebase Hosting provides excellent global CDN
4. **Scalability**: Both platforms offer auto-scaling capabilities
5. **Reliability**: Redundant infrastructure across platforms

## Troubleshooting

### Common Issues:
1. **Port Binding**: Ensure your backend listens on PORT environment variable (default 8080)
2. **Database Connection**: Verify SSL mode is enabled for Koyeb PostgreSQL
3. **Environment Variables**: Ensure all required environment variables are set

### Health Check Endpoint:
Your backend includes a health check endpoint at `/api/health` to verify the service is running properly.

## Next Steps
1. Deploy the backend to your alternative Koyeb account
2. Test the connection between frontend and backend
3. Monitor performance and logs
4. Update your frontend to use the new backend URL