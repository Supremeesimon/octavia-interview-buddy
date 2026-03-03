# Current Platform Configuration: Firebase vs Koyeb PostgreSQL

## Overview
Your Octavia Interview Buddy application currently uses both Firebase and Koyeb PostgreSQL, each serving different purposes in your architecture. Here's a comprehensive breakdown:

## Firebase Usage

### Services Currently in Use:
1. **Firebase Authentication** - User authentication and authorization
2. **Cloud Firestore** - NoSQL database for real-time data
3. **Firebase Storage** - File storage for resumes, recordings, and assets
4. **Cloud Functions** - Serverless backend functions
5. **Firebase Hosting** - Production hosting for the web app

### Firestore Collections and Data:
- **institutions** - Institution profiles, settings, and statistics
  - Subcollections: `admins`, `departments`, `teachers`, `students`
- **externalUsers** - Users not affiliated with institutions
- **platformAdmins** - Platform-level administrators
- **interviews** - Interview session records linked to students
- **interview-feedback** - Feedback and evaluation data
- **end-of-call-analysis** - VAPI-generated analysis data with performance metrics
- **student-stats** - Aggregated statistics for individual students
- **institution-stats** - Aggregated statistics for institutions
- **department-stats** - Aggregated statistics for departments
- **financial_analytics** - Financial margin and revenue data
- **institution_interests** - Signup requests from interested institutions
- **system_config** - System-wide configuration settings
- **users** - User profiles and metadata
- **resources** - Educational resources and materials

### Institution Settings Storage:
As per project specifications, institution settings including sessionLength are stored in Firebase Firestore, not in PostgreSQL database.

### Firebase Hosting:
Your frontend application is deployed on Firebase Hosting, accessible via the domain configured in firebase.json.

## Koyeb PostgreSQL Usage

### Current Setup:
- **Database Name**: koyebdb
- **Connection**: `postgres://koyeb-adm:npg_ZC5b6weVJEzG@ep-snowy-mountain-a4hq7qmm.us-east-1.pg.koyeb.app:5432/koyebdb?sslmode=require`
- **Status**: Created and schema applied successfully

### PostgreSQL Tables (13 tables created):
1. **users** - Core user accounts for students, institution admins, and platform admins
2. **institutions** - Educational institutions using the platform
3. **resumes** - Student resumes in various formats (PDF, LinkedIn, voice)
4. **interviews** - AI-powered interview sessions with VAPI integration
5. **interview_feedback** - AI-generated feedback for completed interviews
6. **session_purchases** - Session purchases by institutions
7. **session_pools** - Available interview sessions per institution
8. **session_allocations** - Department/group-specific session allocations
9. **student_stats** - Aggregated statistics for student performance
10. **institution_stats** - Aggregated statistics for institution performance
11. **activity_logs** - Audit trail of user actions
12. **notifications** - In-app notifications for users
13. **student_session_requests** - Student session requests for teacher approval

## Current Architecture Summary

### Frontend (Hosted on Firebase):
- Deployed on Firebase Hosting
- Connects to Firebase for real-time data and authentication
- Connects to PostgreSQL for structured data (when configured)

### Backend (Node.js/Express):
- Currently runs locally on port 3006
- Connects to PostgreSQL database (both local and Koyeb)
- Uses Firebase Admin SDK for authentication verification

### Data Distribution:
- **Firebase Firestore**: Real-time data, institution settings, user profiles, analytics, VAPI integration data
- **PostgreSQL (Koyeb)**: Structured data for users, sessions, purchases, and business logic

## Current State:
- ✅ **Firebase**: Fully operational with deployed frontend and configured services
- ✅ **Koyeb PostgreSQL**: Successfully created and schema applied, ready for use
- 🔄 **Integration**: PostgreSQL database is configured but may not yet be actively used by the frontend/backend
- 🔄 **Application Deployment**: Currently running locally, not deployed on Koyeb

## Benefits of This Hybrid Approach:
1. **Real-time Capabilities**: Firebase provides real-time updates for interviews and analytics
2. **Structured Data**: PostgreSQL provides ACID compliance for financial transactions and session management
3. **Scalability**: Both platforms provide auto-scaling capabilities
4. **Reliability**: Redundant data storage across platforms
5. **Specialized Storage**: Each platform used for its strengths (NoSQL for flexible data, SQL for structured data)

## Next Steps:
1. Update your backend to connect to Koyeb PostgreSQL in production
2. Configure environment variables to use the Koyeb database URL
3. Deploy your backend application to Koyeb to reduce network latency
4. Consider deploying the frontend to Koyeb as well for complete infrastructure consolidation