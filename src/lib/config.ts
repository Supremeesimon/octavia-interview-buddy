/**
 * Octavia Interview Buddy - Configuration Library
 * Application configuration management
 * Centralizes all environment variables and provides type safety
 */

interface Config {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    enableDevtools: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
    mockApi: boolean;
  };
  vapi: {
    url: string;
    publicKey: string;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
  };
  urls: {
    termsOfService: string;
    privacyPolicy: string;
    support: string;
  };
}

const config: Config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Octavia Interview Buddy',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: (import.meta.env.VITE_APP_ENVIRONMENT as Config['app']['environment']) || 'development',
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' 
      ? 'https://us-central1-octavia-practice-interviewer.cloudfunctions.net/api' 
      : 'http://localhost:3006/api'),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
  },
  vapi: {
    url: import.meta.env.VITE_VAPI_URL || 'https://api.vapi.ai',
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
  },
  features: {
    enableAnalytics: false, // Will be set based on environment below
    enableErrorTracking: false, // Will be set based on environment below
    enablePerformanceMonitoring: false, // Will be set based on environment below
  },
  urls: {
    termsOfService: '/terms',
    privacyPolicy: '/privacy',
    support: 'mailto:support@octavia-interview.com',
  },
};

// Set feature flags based on environment
config.features.enableAnalytics = config.app.environment === 'production';
config.features.enableErrorTracking = config.app.environment !== 'development';
config.features.enablePerformanceMonitoring = config.app.environment === 'production';

// Validation
const validateConfig = () => {
  const errors: string[] = [];
  
  console.log('Validating configuration...');
  console.log('Environment:', config.app.environment);
  console.log('VAPI Public Key:', config.vapi.publicKey ? config.vapi.publicKey.substring(0, 8) + '...' : 'MISSING');
  console.log('VAPI Public Key Length:', config.vapi.publicKey ? config.vapi.publicKey.length : 0);
  console.log('Contains "your_" placeholder:', config.vapi.publicKey ? config.vapi.publicKey.includes('your_') : false);
  
  if (!config.vapi.publicKey) {
    errors.push('VITE_VAPI_PUBLIC_KEY is required');
  } else if (config.app.environment === 'production' && 
             (config.vapi.publicKey === 'your_vapi_public_key_here' || 
              config.vapi.publicKey.includes('your_') || 
              config.vapi.publicKey.length < 20)) {
    errors.push('VITE_VAPI_PUBLIC_KEY must be a valid key in production');
  }
  
  if (!config.api.baseUrl) {
    errors.push('VITE_API_URL is required');
  }
  
  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors);
    if (config.app.environment === 'production') {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    } else {
      console.warn('Configuration validation failed in development, continuing with warnings...');
    }
  } else {
    console.log('Configuration validation passed');
  }
};

// Validate configuration on module load
validateConfig();

export default config;

export type { Config };