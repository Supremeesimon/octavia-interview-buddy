# Authentication Testing Guide

This document provides instructions for testing the authentication functionality of the Octavia Interview Buddy platform.

## Overview

The authentication system has been tested with comprehensive scripts that verify all aspects of user registration, login, and role management. These tests cover:

1. Email/password registration and login
2. OAuth (Google) authentication
3. Role-based access control
4. User profile management
5. Error handling

## Test Scripts

### 1. Authentication Service Tests
Tests the core [FirebaseAuthService](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/services/firebase-auth.service.ts#L12-L539) functionality including registration, login, and logout.

**Run with:**
```bash
npm run test-auth-service
```

### 2. useAuth Hook Tests
Tests the [useAuth](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/hooks/use-auth.ts#L13-L156) hook functionality including integration with the authentication service.

**Run with:**
```bash
npm run test-use-auth
```

### 3. Login Component Tests
Tests the complete login flow including different user roles and authentication methods.

**Run with:**
```bash
npm run test-login-component
```

### 4. Hierarchical User Structure Tests
Tests the hierarchical user structure including platform admins, external users, and institutional users (admins, teachers, students).

**Run with:**
```bash
npm run test-hierarchical-user-structure
```

### 4. Hierarchical User Structure Tests
Tests the hierarchical user structure including platform admins, external users, and institutional users (admins, teachers, students).

**Run with:**
```bash
npm run test-hierarchical-user-structure
```

## Prerequisites

Before running the tests, ensure you have:

1. **Environment Variables**: Create a `.env.local` file with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

2. **Firebase Emulators** (Recommended): For local testing without affecting production data:
   ```bash
   npm run firebase:emulators
   ```

## Test Coverage

### User Roles
The tests verify authentication for all supported user roles:
- **Student**: Default role for educational users
- **Teacher**: Educators within institutions
- **Institution Admin**: Administrators of educational institutions
- **Platform Admin**: System administrators with full access

### Hierarchical Structure
The tests verify the hierarchical user structure:
- **Platform Admins**: Stored in `platformAdmins` collection
- **External Users**: Stored in `externalUsers` collection
- **Institutional Users**: Stored in hierarchical subcollections
  - Institution Admins: `institutions/{institutionId}/admins/{adminId}`
  - Teachers: `institutions/{institutionId}/departments/{departmentId}/teachers/{teacherId}`
  - Students: `institutions/{institutionId}/departments/{departmentId}/students/{studentId}`

### Authentication Methods
- Email/password registration and login
- Google OAuth login
- Role-based navigation after login
- Session management
- Password reset functionality

### Error Handling
- Invalid credentials
- Non-existent users
- Network errors
- Firebase authentication errors

## Running Tests

### Individual Test Scripts
Each test script can be run independently:

```bash
# Test authentication service
npm run test-auth-service

# Test useAuth hook
npm run test-use-auth

# Test login component functionality
npm run test-login-component

# Test hierarchical user structure
npm run test-hierarchical-user-structure
```

### All Authentication Tests
To run all authentication tests sequentially:

```bash
npm run test-auth-service && npm run test-use-auth && npm run test-login-component && npm run test-hierarchical-user-structure
```

## Test Output

Each test script provides detailed console output showing:
- Test execution progress
- Success/failure status for each test case
- Detailed information about created users and their properties
- Error messages and stack traces for failed tests

## Firebase Emulator Setup

For safe testing without affecting production data, use Firebase Emulators:

1. **Start emulators:**
   ```bash
   npm run firebase:emulators
   ```

2. **Configure environment variables** in `.env.local`:
   ```
   # Use emulator settings
   VITE_FIREBASE_API_KEY=fake-api-key
   VITE_FIREBASE_AUTH_DOMAIN=localhost:9099
   VITE_FIREBASE_PROJECT_ID=demo-project-id
   ```

3. **Run tests** - they will automatically connect to emulators in development mode.

## Manual Testing

For manual testing of the authentication UI:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the login page:**
   http://localhost:5173/login

3. **Test scenarios:**
   - Register a new user
   - Login with existing credentials
   - Login with Google OAuth
   - Test password reset flow
   - Verify role-based navigation

## Troubleshooting

### Common Issues

1. **Firebase configuration errors:**
   - Ensure all environment variables are set correctly
   - Verify Firebase project settings

2. **Emulator connection issues:**
   - Check that emulators are running
   - Verify emulator ports (auth: 9099, firestore: 8080)

3. **Permission errors:**
   - Ensure test accounts have appropriate permissions
   - Check Firebase rules

### Debugging

Enable detailed logging by setting environment variables:
```
DEBUG=firebase:*,auth:*
```

## Test Data Management

Test scripts automatically clean up by signing out users at the end of each test run. For persistent test data management, use the Firebase Console or Admin SDK scripts.

## Integration with CI/CD

These test scripts can be integrated into continuous integration pipelines by:

1. Setting up Firebase Emulators in the CI environment
2. Configuring environment variables
3. Running test scripts as part of the build process

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Authentication Service Implementation](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/services/firebase-auth.service.ts)
- [useAuth Hook Implementation](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/hooks/use-auth.ts)
- [Login Component Implementation](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/pages/Login.tsx)