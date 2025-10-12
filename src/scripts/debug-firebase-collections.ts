#!/usr/bin/env tsx
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local or .env
config({ path: resolve(__dirname, '../../.env.local') });
config({ path: resolve(__dirname, '../../.env') });

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

async function debugFirebaseCollections() {
  try {
    console.log('=== Debugging Firebase Collections ===');
    
    // Check if we can access the database
    console.log('Firestore instance available:', !!db);
    
    // List all collections
    console.log('Attempting to list collections...');
    
    // Check interviews collection
    try {
      console.log('\n--- Checking Interviews Collection ---');
      const interviewsRef = collection(db, 'interviews');
      const interviewsQuery = query(interviewsRef, orderBy('createdAt', 'desc'), limit(5));
      const interviewsSnapshot = await getDocs(interviewsQuery);
      console.log('Interviews count:', interviewsSnapshot.size);
      
      interviewsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Interview ${index + 1} (ID: ${doc.id}):`, {
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          userId: data.userId,
          status: data.status
        });
      });
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
    
    // Check end-of-call-analysis collection
    try {
      console.log('\n--- Checking End-of-Call Analysis Collection ---');
      const analysisRef = collection(db, 'end-of-call-analysis');
      const analysisQuery = query(analysisRef, orderBy('timestamp', 'desc'), limit(5));
      const analysisSnapshot = await getDocs(analysisQuery);
      console.log('End-of-call analysis count:', analysisSnapshot.size);
      
      analysisSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Analysis ${index + 1} (ID: ${doc.id}):`, {
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
          interviewId: data.interviewId,
          overallScore: data.overallScore
        });
      });
    } catch (error) {
      console.error('Error fetching end-of-call analysis:', error);
    }
    
    // Check users collection
    try {
      console.log('\n--- Checking Users Collection ---');
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(5));
      const usersSnapshot = await getDocs(usersQuery);
      console.log('Users count:', usersSnapshot.size);
      
      usersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`User ${index + 1} (ID: ${doc.id}):`, {
          email: data.email,
          displayName: data.displayName,
          role: data.role
        });
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    
    // Check sessions collection
    try {
      console.log('\n--- Checking Sessions Collection ---');
      const sessionsRef = collection(db, 'sessions');
      const sessionsQuery = query(sessionsRef, orderBy('createdAt', 'desc'), limit(5));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      console.log('Sessions count:', sessionsSnapshot.size);
      
      sessionsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Session ${index + 1} (ID: ${doc.id}):`, {
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          userId: data.userId,
          status: data.status
        });
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
    
    console.log('\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run the debug function
debugFirebaseCollections();