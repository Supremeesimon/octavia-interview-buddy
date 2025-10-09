/**
 * Configuration hook for React components
 * Provides typed access to application configuration
 */

import { useMemo } from 'react';
import config, { type Config } from '@/lib/config';

export const useConfig = (): Config => {
  return useMemo(() => config, []);
};

export const useApiConfig = () => {
  const { api } = useConfig();
  return useMemo(() => api, [api]);
};

export const useVapiConfig = () => {
  const { vapi } = useConfig();
  return useMemo(() => vapi, [vapi]);
};

export const useFeatureFlags = () => {
  const { features } = useConfig();
  return useMemo(() => features, [features]);
};

export default useConfig;