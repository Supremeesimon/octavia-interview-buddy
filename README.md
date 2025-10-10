# Octavia Interview Buddy

Welcome to Octavia Interview Buddy - your AI-powered interview practice platform!

## Features

- **AI-Powered Interviews**: Practice with our advanced voice AI that simulates real interview scenarios
- **Real-time Feedback**: Get instant feedback on your communication skills, technical knowledge, and problem-solving abilities
- **Performance Analytics**: Track your progress over time with detailed analytics and insights
- **Anonymous Access**: Try our platform without creating an account
- **Multi-role Support**: Platform for students, institution admins, and platform administrators

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- VAPI.ai account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your configuration
4. Run the development server: `npm run dev`

### Environment Variables

Create a `.env.local` file with the following variables:

```
# APPLICATION CONFIGURATION
VITE_APP_NAME="Octavia Interview Buddy"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="development"

# API CONFIGURATION
VITE_API_URL="http://localhost:3001/api"
VITE_API_TIMEOUT="30000"

# VAPI INTEGRATION (Voice AI)
VITE_VAPI_URL="https://api.vapi.ai"
VITE_VAPI_PUBLIC_KEY="your_vapi_public_key_here"

# FIREBASE CONFIGURATION
VITE_FIREBASE_API_KEY="your_firebase_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain_here"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id_here"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket_here"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id_here"
VITE_FIREBASE_APP_ID="your_firebase_app_id_here"
VITE_FIREBASE_MEASUREMENT_ID="your_firebase_measurement_id_here"
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run lint` - Run ESLint
- `npm run test-anonymous-data` - Test anonymous user data collection

### Anonymous User Data Collection

The platform collects interview data for both authenticated and anonymous users. For anonymous users, all interview data is collected except for personally identifiable information.

To check anonymous user data:
1. Visit `/analytics/anonymous-data` in the application
2. Or run `npm run test-anonymous-data` to simulate data collection

See [ANONYMOUS_USER_DATA.md](ANONYMOUS_USER_DATA.md) for detailed information.

## Deployment

### Firebase Deployment

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Deploy hosting: `npm run deploy:hosting`
4. Deploy rules: `npm run deploy:rules`

## Project Structure

```
src/
├── components/        # React components
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── pages/            # Page components
├── services/         # Business logic services
├── styles/           # CSS and styling
├── types/            # TypeScript types
└── App.tsx          # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.