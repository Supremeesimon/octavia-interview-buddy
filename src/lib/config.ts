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
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
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
  
  if (!config.vapi.publicKey && config.app.environment === 'production') {
    errors.push('VITE_VAPI_PUBLIC_KEY is required for production');
  }
  
  if (!config.api.baseUrl) {
    errors.push('VITE_API_URL is required');
  }
  
  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors);
    if (config.app.environment === 'production') {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }
};

// Validate configuration on module load
validateConfig();

export default config;

export type { Config };