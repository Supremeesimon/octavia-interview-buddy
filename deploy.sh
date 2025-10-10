#!/bin/bash

# Octavia Interview Buddy - Firebase Deployment Script
# This script deploys the application to Firebase hosting with all services

set -e

echo "🔥 Starting Firebase deployment for Octavia Interview Buddy..."

# Check if Firebase service account exists
if [ ! -f "firebase-service-account.json" ]; then
    echo "❌ Firebase service account file not found!"
    echo "Please ensure firebase-service-account.json exists in the project root."
    exit 1
fi

# Set environment variable for service account
export GOOGLE_APPLICATION_CREDENTIALS="firebase-service-account.json"
echo "🔐 Using Firebase service account for authentication..."

# Set the correct Firebase project
echo "📊 Setting Firebase project..."
npx firebase use octavia-practice-interviewer

# Build the application
echo "🏗️ Building the application..."
npm run build

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
GOOGLE_APPLICATION_CREDENTIALS="firebase-service-account.json" npx firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "🚀 Your application is now live at: https://octavia-practice-interviewer.web.app"
echo "📊 Firebase Console: https://console.firebase.google.com/project/octavia-practice-interviewer"