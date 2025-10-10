#!/bin/bash

# Deployment script for Firebase Functions

echo "🚀 Starting Firebase Functions deployment..."

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
  echo "❌ Error: firebase.json not found. Please run this script from the project root directory."
  exit 1
fi

# Check if functions directory exists
if [ ! -d "functions" ]; then
  echo "❌ Error: functions directory not found."
  exit 1
fi

# Navigate to functions directory
cd functions

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to install dependencies."
  exit 1
fi

# Navigate back to project root
cd ..

# Deploy functions
echo "📤 Deploying Firebase Functions..."
firebase deploy --only functions

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Firebase Functions deployed successfully!"
  echo "📝 Next steps:"
  echo "   1. Get your webhook URL from the Firebase Console"
  echo "   2. Add it to your VAPI Dashboard under Webhooks"
  echo "   3. Select 'End of Call Report' events"
else
  echo "❌ Error: Firebase Functions deployment failed."
  exit 1
fi