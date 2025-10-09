# Firebase Setup Guide for Octavia Interview Buddy

## Overview

This project uses Firebase as the production-ready infrastructure for authentication, database, storage, and hosting. The Firebase project **octavia-practice-interviewer** is already configured and ready to use.

## 🔥 Firebase Services Used

- **Firebase Authentication** - User authentication and authorization
- **Cloud Firestore** - NoSQL database for all application data
- **Cloud Storage** - File storage for resumes, recordings, and assets
- **Cloud Functions** - Backend serverless functions
- **Firebase Hosting** - Production hosting for the web app

## 🚀 Quick Start

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Set Project

```bash
firebase use octavia-practice-interviewer
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Update the Firebase section in `.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="your_firebase_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="octavia-practice-interviewer.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="octavia-practice-interviewer"
VITE_FIREBASE_STORAGE_BUCKET="octavia-practice-interviewer.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
```

**Note**: Get these values from the Firebase Console > Project Settings > General > Your apps > Web app

### 5. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### 6. Quick Deploy

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy everything
./deploy.sh
```

## 🔗 Project URLs

- **Firebase Console**: https://console.firebase.google.com/project/octavia-practice-interviewer
- **Live Application**: https://octavia-practice-interviewer.web.app
- **Authentication**: https://octavia-practice-interviewer.firebaseapp.com
- **Storage Bucket**: gs://octavia-practice-interviewer.appspot.com

## 📝 Project Structure

```
src/
├── lib/
│   └── firebase.ts              # Firebase configuration
├── services/
│   └── firebase-auth.service.ts # Authentication service
├── hooks/
│   └── use-firebase-auth.ts     # Firebase auth hook
└── types/
    └── index.ts                 # Updated with UserProfile type

firebase/
├── firestore.rules              # Firestore security rules
├── storage.rules               # Storage security rules
├── firebase.json               # Firebase configuration
└── .firebaserc                 # Firebase project settings
```

## 🔐 Security Rules

### Firestore Rules

The Firestore security rules implement role-based access control:

- **Students**: Can read/write their own data
- **Teachers**: Can read student data from their institution
- **Institution Admins**: Can manage their institution's data
- **Platform Admins**: Can access all data

### Storage Rules

Storage rules control file access:

- **Resumes**: Users can upload/manage their own files (10MB max)
- **Recordings**: System-generated, read-only for users (100MB max)
- **Profile Pictures**: Users can manage their own (5MB max)
- **Institution Logos**: Institution admins only (2MB max)

## 🧪 Development with Emulators

For local development, use Firebase emulators:

```bash
# Start emulators
firebase emulators:start

# Access emulator UI
open http://localhost:4000
```

Services available:
- Authentication: `localhost:9099`
- Firestore: `localhost:8080`
- Storage: `localhost:9199`
- Functions: `localhost:5001`

## 🔌 Integration Points

### Authentication

The `useFirebaseAuth` hook provides:

```typescript
const {
  user,              // Current user profile
  firebaseUser,      // Firebase user object
  isLoading,         // Loading state
  isAuthenticated,   // Auth status
  login,             // Login function
  register,          // Registration function
  logout,            // Logout function
  requestPasswordReset // Password reset
} = useFirebaseAuth();
```

### Database

All database operations use Firestore:

```typescript
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

// Example: Get user profile
const userDoc = await getDoc(doc(db, 'users', userId));
const userProfile = userDoc.data();
```

### Storage

File uploads use Cloud Storage:

```typescript
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Example: Upload resume
const resumeRef = ref(storage, `resumes/${userId}/${fileName}`);
await uploadBytes(resumeRef, file);
const downloadURL = await getDownloadURL(resumeRef);
```

## 🚀 Deployment

### Development Build

```bash
npm run build:dev
firebase hosting:channel:deploy preview
```

### Production Deployment

```bash
npm run build
firebase deploy
```

### Selective Deployment

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only rules
firebase deploy --only firestore:rules,storage:rules
```

## 📊 Monitoring and Analytics

Firebase provides built-in monitoring:

1. **Authentication**: Track user signups and logins
2. **Firestore**: Monitor reads/writes and performance
3. **Storage**: Track upload/download usage
4. **Hosting**: Monitor traffic and performance
5. **Functions**: Track executions and errors

Access these in the Firebase Console under each service section.

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**: Check Firestore security rules
2. **File Upload Fails**: Verify Storage rules and file size limits
3. **Auth Errors**: Ensure correct Firebase config in environment
4. **Emulator Issues**: Clear emulator data: `firebase emulators:exec --ui "rm -rf .firebase"`

### Debugging

Enable debug mode in development:

```typescript
// Add to firebase.ts for debugging
import { connectFirestoreEmulator, connectAuthEmulator, connectStorageEmulator } from 'firebase/...';

if (import.meta.env.DEV) {
  // Connect to emulators in development
}
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## 🆘 Support

For Firebase-specific issues:
1. Check the [Firebase Status](https://status.firebase.google.com/)
2. Review [Firebase Support](https://firebase.google.com/support)
3. Ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)