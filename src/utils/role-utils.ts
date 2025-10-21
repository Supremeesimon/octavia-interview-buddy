/**
 * Role Utilities
 * Helper functions for role-based access control
 */

import { useFirebaseAuth } from '@/hooks/use-firebase-auth';

/**
 * Check if user has platform admin role
 */
export const isPlatformAdmin = (user: any): boolean => {
  return user?.role === 'platform_admin';
};

/**
 * Check if user has institution admin role
 */
export const isInstitutionAdmin = (user: any): boolean => {
  return user?.role === 'institution_admin';
};

/**
 * Check if user has teacher role
 */
export const isTeacher = (user: any): boolean => {
  return user?.role === 'teacher';
};

/**
 * Check if user has student role
 */
export const isStudent = (user: any): boolean => {
  return user?.role === 'student';
};

/**
 * Check if user can access sensitive pricing information
 * Only platform admins should see detailed pricing data
 */
export const canAccessPricingDetails = (user: any): boolean => {
  return isPlatformAdmin(user);
};

/**
 * Check if user can access institution financial data
 * Only platform admins and institution admins should see financial data
 */
export const canAccessFinancialData = (user: any): boolean => {
  return isPlatformAdmin(user) || isInstitutionAdmin(user);
};

export default {
  isPlatformAdmin,
  isInstitutionAdmin,
  isTeacher,
  isStudent,
  canAccessPricingDetails,
  canAccessFinancialData
};