#!/bin/bash

# Deployment script for Firebase Functions
# This script deploys all functions including the new institution management functions

echo "🚀 Deploying Firebase Functions..."

# Navigate to functions directory
cd "$(dirname "$0")/functions"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy functions
echo "📤 Deploying functions to Firebase..."
firebase deploy --only functions

echo "✅ Deployment completed!"

# Show deployed functions
echo "📋 Deployed functions:"
firebase functions:list