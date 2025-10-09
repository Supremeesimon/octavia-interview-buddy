#!/bin/bash

# Octavia Interview Buddy - Firebase Deployment Script
# This script deploys the application to Firebase hosting with all services

set -e

echo "🔥 Starting Firebase deployment for Octavia Interview Buddy..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in to Firebase
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please log in to Firebase..."
    firebase login
fi

# Set the correct Firebase project
echo "📊 Setting Firebase project..."
firebase use octavia-practice-interviewer

# Build the application
echo "🏗️ Building the application..."
npm run build

# Deploy Firestore rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "📁 Deploying Storage security rules..."
firebase deploy --only storage:rules

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Deploy Functions (if they exist)
if [ -d "functions" ]; then
    echo "⚡ Deploying Cloud Functions..."
    firebase deploy --only functions
fi

echo "✅ Deployment completed successfully!"
echo "🚀 Your application is now live at: https://octavia-practice-interviewer.web.app"
echo "📊 Firebase Console: https://console.firebase.google.com/project/octavia-practice-interviewer"