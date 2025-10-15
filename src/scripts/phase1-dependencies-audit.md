# Phase 1: Dependencies Audit

## 1.7 Dependencies Audit - Identify external dependencies and integrations

### External Service Integrations

#### 1. Firebase Services
- **Firebase Authentication**: User authentication and authorization
- **Cloud Firestore**: Primary database for all application data
- **Firebase Storage**: File storage for resumes and recordings
- **Firebase Functions**: Serverless functions for backend processing
- **Firebase Hosting**: Web application hosting

#### 2. VAPI (Voice API) Integration
- **VAPI Webhook**: Receives end-of-call reports and analysis data
- **Voice Processing**: AI-powered interview analysis and feedback
- **Recording Storage**: Audio recording storage and management

#### 3. Financial/Analytics Services
- **Financial Analytics**: Daily margin calculations and reporting
- **Pricing Management**: Dynamic pricing configuration and overrides

#### 4. Communication Services
- **Email Service**: SendGrid integration for email notifications
- **Messaging System**: In-app messaging and announcements

#### 5. Payment Processing
- **Stripe Integration**: License purchases and subscription management

#### 6. Authentication Providers
- **Google OAuth**: Single sign-on with Google accounts
- **Microsoft OAuth**: Single sign-on with Microsoft accounts
- **Email/Password**: Traditional authentication method

#### 7. Monitoring and Logging
- **Sentry**: Error tracking and monitoring
- **Console Logging**: Basic application logging

### Cloud Functions in /functions/ Directory

#### 1. VAPI Webhook Function
- **Purpose**: Process incoming webhook data from VAPI
- **Trigger**: HTTP request from VAPI service
- **Functionality**:
  - Receives end-of-call reports and analysis data
  - Saves data to Firestore collections:
    - `end-of-call-analysis`: Raw analysis data
    - `interviews`: Structured interview records
    - `interview-feedback`: Processed feedback data
  - Handles both `end-of-call-report` and `analysis` message types
  - Supports data isolation with studentId, departmentId, institutionId metadata

#### 2. Token Regeneration Functions
- **Purpose**: Manage institution signup tokens
- **Triggers**:
  - HTTP request for on-demand regeneration
  - Firestore onCreate for new institutions
  - Firestore onUpdate for institution approval
- **Functionality**:
  - Generates unique signup tokens for institutions
  - Creates custom signup links
  - Updates institution documents with new tokens

#### 3. Financial Analytics Function
- **Purpose**: Calculate daily financial margins
- **Trigger**: Scheduled daily (24 hours from 00:00)
- **Functionality**:
  - Calculates revenue from interviews and licenses
  - Computes costs based on VAPI usage
  - Determines profit margins
  - Stores data in `financial_analytics` collection

### Environment Variables Configuration

#### Application Configuration
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_APP_ENVIRONMENT`: Environment (development/production)

#### API Configuration
- `VITE_API_URL`: Backend API URL
- `VITE_API_TIMEOUT`: API request timeout

#### VAPI Integration
- `VITE_VAPI_URL`: VAPI service URL
- `VITE_VAPI_PUBLIC_KEY`: Public key for VAPI integration
- `VAPI_PRIVATE_KEY`: Private key for VAPI integration

#### Authentication & Security
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: Token expiration time
- `BCRYPT_ROUNDS`: Password hashing rounds
- `SESSION_SECRET`: Session management secret

#### Firebase Configuration
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID

#### Database Configuration
- `DATABASE_URL`: PostgreSQL database URL (not currently used)
- `DATABASE_SSL`: Database SSL configuration
- `DATABASE_POOL_MIN`: Minimum database connection pool
- `DATABASE_POOL_MAX`: Maximum database connection pool

#### Redis Configuration
- `REDIS_URL`: Redis server URL
- `REDIS_PASSWORD`: Redis password

#### Email Service
- `SENDGRID_API_KEY`: SendGrid API key
- `FROM_EMAIL`: Default sender email
- `FROM_NAME`: Default sender name

#### Payment Processing
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

#### External Integrations
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `MICROSOFT_CLIENT_ID`: Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth client secret

#### Monitoring & Logging
- `SENTRY_DSN`: Sentry error tracking DSN
- `LOG_LEVEL`: Application log level

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

#### CORS Configuration
- `CORS_ORIGIN`: Allowed CORS origins

#### Development Configuration
- `VITE_ENABLE_DEVTOOLS`: Enable development tools
- `VITE_MOCK_API`: Use mock API data
- `ENABLE_API_DOCS`: Enable API documentation

### Dependencies Summary

#### Production Dependencies
1. **Firebase Libraries**:
   - `firebase`: Core Firebase SDK
   - `firebase-admin`: Firebase Admin SDK for backend functions

2. **UI Libraries**:
   - `react`: Core React library
   - `react-dom`: React DOM rendering
   - `react-router-dom`: Client-side routing
   - `lucide-react`: Icon library
   - `recharts`: Charting library
   - `shadcn/ui`: UI component library

3. **Utility Libraries**:
   - `uuid`: UUID generation
   - `axios`: HTTP client
   - `zod`: Schema validation

4. **Development Libraries**:
   - `typescript`: Type checking
   - `vite`: Build tool
   - `tailwindcss`: CSS framework

#### External Service Dependencies
1. **VAPI**: Voice AI processing service
2. **SendGrid**: Email delivery service
3. **Stripe**: Payment processing service
4. **Google/Microsoft**: OAuth providers
5. **Sentry**: Error monitoring service

### Integration Points and Data Flow

#### 1. Authentication Flow
```
User → Firebase Auth → InstitutionHierarchyService → RBACService → Dashboard
```

#### 2. Interview Processing Flow
```
VAPI → Webhook Function → Firestore (end-of-call-analysis) → 
InterviewService → StudentDashboard/InstitutionDashboard
```

#### 3. Financial Analytics Flow
```
Scheduled Function → Firestore (interviews) → 
Financial Calculations → Firestore (financial_analytics) → 
AdminDashboard/FinancialDashboard
```

#### 4. Data Isolation Flow
```
Platform Admin → All Institutions
Institution Admin → Own Institution Data
Teacher → Own Department Data
Student → Own Data Only
```

### Security Considerations

#### 1. API Keys and Secrets
- Firebase configuration keys stored in environment variables
- VAPI private keys secured in backend functions
- Stripe keys separated between client and server

#### 2. Data Access Control
- Role-Based Access Control (RBAC) implemented
- Firestore security rules enforce data isolation
- User context validation in all services

#### 3. Authentication
- JWT tokens for session management
- Secure password hashing with bcrypt
- OAuth provider integration for SSO

### Performance Considerations

#### 1. Database Optimization
- Firestore indexing for query performance
- Data denormalization for read efficiency
- Pagination for large dataset handling

#### 2. Caching
- Redis integration for session storage
- Client-side caching with React hooks
- Function result caching where appropriate

#### 3. Rate Limiting
- API rate limiting configuration
- VAPI usage monitoring
- Request throttling for protection

### Monitoring and Maintenance

#### 1. Error Tracking
- Sentry integration for error monitoring
- Console logging for debugging
- Function execution logging

#### 2. Performance Monitoring
- Application performance metrics
- Database query performance
- Function execution times

#### 3. Data Integrity
- Regular data validation checks
- Backup and recovery procedures
- Migration scripts for schema changes