# Automated Institution Management System

This document explains the automated institution management system that prevents synchronization issues between Firebase and PostgreSQL databases.

## Overview

The automated system consists of three main components:

1. **Real-time Processing**: Automatically processes new institution interest requests when they are submitted
2. **Continuous Monitoring**: Periodically checks for data consistency between Firebase and PostgreSQL
3. **Validation and Alerts**: Performs deep validation and sends alerts for data integrity issues

## Components

### 1. Automated Institution Setup (`automated-institution-setup.js`)

This component is triggered automatically when a new document is created in the `institution_interests` collection in Firebase Firestore.

**Process Flow:**
1. Generates consistent UUIDs for PostgreSQL
2. Creates institution record in PostgreSQL
3. Creates user account in PostgreSQL with temporary password
4. Updates Firebase interest request with processing status
5. Creates institution record in Firebase
6. Sends welcome email with password reset instructions

### 2. Synchronization Monitor (`sync-monitor.js`)

This component runs periodically (every hour) to check for data consistency issues.

**Checks Performed:**
- Orphaned institution interest requests
- Institution ID consistency between databases
- Missing user accounts

### 3. Validation and Alert System (`validation-alerts.js`)

This component runs daily to perform comprehensive validation and send alerts.

**Validation Checks:**
- Orphaned institution requests
- User-institution linking
- Data consistency between databases
- Recent activity anomalies

## Firebase Functions

The system is deployed as Firebase Functions:

1. `processInstitutionInterest` - Triggered on new institution interest requests
2. `scheduledSyncMonitor` - Runs every hour to check data consistency
3. `dailyValidationAlerts` - Runs daily to validate data and send alerts
4. `triggerSync` - HTTP function to manually trigger synchronization
5. `triggerValidation` - HTTP function to manually trigger validation

## Testing

To test the system:
1. Ensure the Firebase Emulator Suite is running
2. Run the test script: `node scripts/test-automated-system.js`
3. Verify that the test request is processed automatically

## Deployment

To deploy the functions:
1. Run: `./deploy-functions.sh`
2. Verify deployment in the Firebase Console

## Benefits

This automated system ensures:
- No manual intervention required for new institution setups
- Data consistency between Firebase and PostgreSQL
- Immediate notification of any issues
- Reduced administrative overhead
- Improved reliability and user experience