#!/usr/bin/env node

/**
 * Script to count users in Firebase Authentication
 * 
 * Before running this script, you need to:
 * 1. Download your Firebase service account key from the Firebase Console
 * 2. Save it as 'firebase-service-account.json' in the project root
 * 3. Or set the GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Dynamically import firebase-admin
async function initializeFirebase() {
  try {
    const { default: admin } = await import('firebase-admin');
    
    console.log('Initializing Firebase Admin SDK...');
    
    // Check if service account file exists
    const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
    let serviceAccount;
    
    try {
      const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountData);
      console.log('Using service account file for authentication');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    } catch (error) {
      console.log('No service account file found. Trying default credentials...');
      // Try to initialize with default credentials
      if (!admin.apps.length) {
        admin.initializeApp();
      }
    }
    
    return admin;
  } catch (error) {
    console.error('Error importing firebase-admin:', error.message);
    throw error;
  }
}

async function countFirebaseUsers() {
  try {
    const admin = await initializeFirebase();
    const auth = admin.auth();
    
    console.log('Counting users in Firebase Authentication...');
    
    // Count users by listing them (paginated)
    let userCount = 0;
    let nextPageToken;
    let totalUsers = 0;
    const usersList = [];
    
    do {
      const result = await auth.listUsers(1000, nextPageToken);
      userCount = result.users.length;
      totalUsers += userCount;
      
      // Store user information
      result.users.forEach(user => {
        usersList.push({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          disabled: user.disabled,
          lastSignInTime: user.metadata.lastSignInTime,
          creationTime: user.metadata.creationTime,
        });
      });
      
      nextPageToken = result.pageToken;
      console.log(`Processed ${totalUsers} users so far...`);
      
    } while (nextPageToken);
    
    console.log('\n=== Firebase User Count Summary ===');
    console.log(`Total users: ${totalUsers}`);
    
    // Show recent users
    if (usersList.length > 0) {
      console.log('\n=== Recent Users (last 10) ===');
      const recentUsers = usersList
        .sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime))
        .slice(0, 10);
      
      recentUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email || user.uid}`);
        console.log(`   Name: ${user.displayName || 'N/A'}`);
        console.log(`   Created: ${user.creationTime}`);
        console.log(`   Last Sign In: ${user.lastSignInTime || 'Never'}`);
        console.log(`   Status: ${user.disabled ? 'Disabled' : 'Active'}`);
        console.log('');
      });
      
      // Show user statistics
      console.log('=== User Statistics ===');
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const activeLastDay = usersList.filter(user => 
        user.lastSignInTime && new Date(user.lastSignInTime) > oneDayAgo
      ).length;
      
      const activeLastWeek = usersList.filter(user => 
        user.lastSignInTime && new Date(user.lastSignInTime) > oneWeekAgo
      ).length;
      
      const activeLastMonth = usersList.filter(user => 
        user.lastSignInTime && new Date(user.lastSignInTime) > oneMonthAgo
      ).length;
      
      console.log(`Active in last 24 hours: ${activeLastDay}`);
      console.log(`Active in last 7 days: ${activeLastWeek}`);
      console.log(`Active in last 30 days: ${activeLastMonth}`);
      
      // User creation timeline
      console.log('\n=== User Creation Timeline ===');
      const today = usersList.filter(user => 
        new Date(user.creationTime).toDateString() === now.toDateString()
      ).length;
      
      const thisWeek = usersList.filter(user => {
        const creationDate = new Date(user.creationTime);
        return creationDate > oneWeekAgo && creationDate <= now;
      }).length;
      
      console.log(`Created today: ${today}`);
      console.log(`Created this week: ${thisWeek}`);
    } else {
      console.log('No users found in Firebase Authentication.');
    }
    
  } catch (error) {
    console.error('Error counting users:', error.message);
    
    if (error.code === 'auth/insufficient-permission') {
      console.error('\nInsufficient permissions. Please ensure you have:');
      console.error('1. A valid Firebase service account key');
      console.error('2. The "Firebase Authentication Admin" role');
    } else if (error.code === 'ENOENT') {
      console.error('\nService account file not found.');
      console.error('Please download your service account key from the Firebase Console');
      console.error('and save it as "firebase-service-account.json" in the project root.');
    }
  }
}

// Run the function
countFirebaseUsers();