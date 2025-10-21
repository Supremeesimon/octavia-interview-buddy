/**
 * Logging Configuration
 * Controls which logs are displayed in the console
 */

// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

// Configuration for different log categories
interface LogConfig {
  vapi: LogLevel;
  firebase: LogLevel;
  auth: LogLevel;
  general: LogLevel;
}

// Default configuration - can be overridden by environment variables
const defaultLogConfig: LogConfig = {
  vapi: 'none', // Disable VAPI logs completely as requested
  firebase: 'info',
  auth: 'info',
  general: 'info'
};

// Get configuration from environment variables or use defaults
const getLogConfig = (): LogConfig => {
  const config: LogConfig = { ...defaultLogConfig };
  
  // Override with environment variables if set
  if (process.env.VITE_LOG_LEVEL_VAPI) {
    config.vapi = process.env.VITE_LOG_LEVEL_VAPI as LogLevel;
  }
  
  if (process.env.VITE_LOG_LEVEL_FIREBASE) {
    config.firebase = process.env.VITE_LOG_LEVEL_FIREBASE as LogLevel;
  }
  
  if (process.env.VITE_LOG_LEVEL_AUTH) {
    config.auth = process.env.VITE_LOG_LEVEL_AUTH as LogLevel;
  }
  
  if (process.env.VITE_LOG_LEVEL_GENERAL) {
    config.general = process.env.VITE_LOG_LEVEL_GENERAL as LogLevel;
  }
  
  return config;
};

// Get the current configuration
const logConfig = getLogConfig();

// Helper functions for different log levels
export const logDebug = (category: keyof LogConfig, message: string, ...args: any[]) => {
  if (logConfig[category] === 'debug') {
    console.debug(`[DEBUG][${category.toUpperCase()}] ${message}`, ...args);
  }
};

export const logInfo = (category: keyof LogConfig, message: string, ...args: any[]) => {
  if (logConfig[category] !== 'none' && logConfig[category] !== 'error' && logConfig[category] !== 'warn') {
    console.info(`[INFO][${category.toUpperCase()}] ${message}`, ...args);
  }
};

export const logWarn = (category: keyof LogConfig, message: string, ...args: any[]) => {
  if (logConfig[category] !== 'none' && logConfig[category] !== 'error') {
    console.warn(`[WARN][${category.toUpperCase()}] ${message}`, ...args);
  }
};

export const logError = (category: keyof LogConfig, message: string, ...args: any[]) => {
  if (logConfig[category] !== 'none') {
    console.error(`[ERROR][${category.toUpperCase()}] ${message}`, ...args);
  }
};

// Specialized logging functions for VAPI (disabled by default as requested)
export const logVapiDebug = (message: string, ...args: any[]) => {
  if (logConfig.vapi === 'debug') {
    console.debug(`[VAPI] ${message}`, ...args);
  }
};

export const logVapiInfo = (message: string, ...args: any[]) => {
  if (logConfig.vapi === 'info') {
    console.info(`[VAPI] ${message}`, ...args);
  }
};

export const logVapiWarn = (message: string, ...args: any[]) => {
  if (logConfig.vapi === 'warn' || logConfig.vapi === 'info' || logConfig.vapi === 'debug') {
    console.warn(`[VAPI] ${message}`, ...args);
  }
};

export const logVapiError = (message: string, ...args: any[]) => {
  if (logConfig.vapi !== 'none') {
    console.error(`[VAPI] ${message}`, ...args);
  }
};

export default logConfig;