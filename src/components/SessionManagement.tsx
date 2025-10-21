import React, { useState, useEffect } from 'react';
import SessionPoolStatus from './session/SessionPoolStatus';
import SessionDuration from './session/SessionDuration';
import SessionPurchase from './session/SessionPurchase';
import SessionAllocation from './session/SessionAllocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { InstitutionService } from '@/services/institution.service';
import { SessionService } from '@/services/session.service';
import { PricingSyncService } from '@/services/pricing-sync.service';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { canAccessFinancialData } from '@/utils/role-utils';

interface SessionManagementProps {
  onSessionPurchase?: (sessions: number, cost: number) => void;
  institutionId?: string;
  totalSessions?: number;
  usedSessions?: number;
}

const SessionManagement = ({ 
  onSessionPurchase, 
  institutionId,
  totalSessions: propTotalSessions,
  usedSessions: propUsedSessions
}: SessionManagementProps) => {
  const [sessionLength, setSessionLength] = useState(20); // Default 20 minutes
  const [totalSessions, setTotalSessions] = useState(propTotalSessions || 0);
  const [usedSessions, setUsedSessions] = useState(propUsedSessions || 0);
  const [loading, setLoading] = useState(false);
  const [pricePerMinute, setPricePerMinute] = useState<number | null>(null); // Use null to indicate "Not Available"
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useFirebaseAuth();
  
  // Fetch platform pricing settings and institution-specific overrides
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        // First get platform default settings
        const platformSettings = await PlatformSettingsService.getAllSettings();
        let calculatedPrice: number | null = null; // Use null to indicate "Not Available"
        
        if (platformSettings) {
          // Only validate and calculate pricing for users with appropriate access
          if (canAccessFinancialData(user)) {
            // CRITICAL: Validate platform pricing before using
            const pricingToValidate = {
              vapiCost: platformSettings.vapiCostPerMinute,
              markupPercentage: platformSettings.markupPercentage,
              licenseCost: platformSettings.annualLicenseCost
            };
            
            if (PricingSyncService.validatePricing(pricingToValidate)) {
              // Calculate price per minute based on VAPI cost and markup
              calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
            } else {
              // Even with validation issues, use the actual values from Firebase if they exist
              if (platformSettings.vapiCostPerMinute && platformSettings.markupPercentage) {
                calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
              } else {
                calculatedPrice = null; // Not available
              }
            }
          } else {
            // For non-financial users, use a simplified approach without exposing details
            calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
          }
        } else {
          // Data not available
          calculatedPrice = null; // Not available
        }
        
        // If we have an institution ID, check for institution-specific pricing override
        if (institutionId) {
          try {
            const institution = await InstitutionService.getInstitutionById(institutionId);
            if (institution?.pricingOverride?.isEnabled) {
              // Only validate for users with appropriate access
              if (canAccessFinancialData(user)) {
                // CRITICAL: Validate institution pricing override before using
                if (PricingSyncService.validateInstitutionPricing(institution)) {
                  // Use institution-specific pricing
                  calculatedPrice = institution.pricingOverride.customVapiCost * 
                                   (1 + institution.pricingOverride.customMarkupPercentage / 100);
                } else {
                  // Even with validation issues, use the actual values if they exist
                  if (institution.pricingOverride.customVapiCost && institution.pricingOverride.customMarkupPercentage) {
                    calculatedPrice = institution.pricingOverride.customVapiCost * 
                                     (1 + institution.pricingOverride.customMarkupPercentage / 100);
                  }
                  // If institution pricing is invalid, fall back to null (Not Available)
                }
              } else {
                // For non-financial users, use the values without validation details
                calculatedPrice = institution.pricingOverride.customVapiCost * 
                                 (1 + institution.pricingOverride.customMarkupPercentage / 100);
              }
            }
            
            // Also fetch the institution's session length setting
            if (institution?.settings?.sessionLength) {
              setSessionLength(institution.settings.sessionLength);
            }
          } catch (error) {
            // Silently handle errors for institution-specific pricing
          }
        }
        
        setPricePerMinute(calculatedPrice);
      } catch (error) {
        // Data not available due to error
        setPricePerMinute(null);
      }
    };
    
    fetchPricingSettings();
  }, [institutionId, user]);
  
  // Fetch interview session data from the backend
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!institutionId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Get interview session data from the SessionService
        const sessionPool = await SessionService.getSessionPool();
        if (sessionPool) {
          setTotalSessions(sessionPool.totalSessions);
          setUsedSessions(sessionPool.usedSessions);
        } else {
          // If no session pool exists, set defaults
          setTotalSessions(0);
          setUsedSessions(0);
        }
      } catch (error: any) {
        // Handle different types of errors appropriately
        // Only show error toast for actual network errors or server errors
        if (error.status === undefined) {
          // Network error
          toast({
            title: "Network Error",
            description: "Failed to load interview session data due to network issues. Using default values.",
            variant: "destructive"
          });
        } else if (error.status >= 500) {
          // Server error
          toast({
            title: "Server Error",
            description: "Failed to load interview session data due to server issues. Using default values.",
            variant: "destructive"
          });
        }
        // For 404, 400, 401, 403 and other client errors, don't show toast as they're normal states
        // Set default values
        setTotalSessions(0);
        setUsedSessions(0);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we don't have props or if props are undefined
    if (institutionId && (propTotalSessions === undefined || propUsedSessions === undefined)) {
      fetchSessionData();
    } else {
      // If we have props, set the state immediately
      if (propTotalSessions !== undefined) {
        setTotalSessions(propTotalSessions);
      }
      if (propUsedSessions !== undefined) {
        setUsedSessions(propUsedSessions);
      }
      setLoading(false);
    }
  }, [institutionId, propTotalSessions, propUsedSessions, toast]);
  
  // If we receive new props, update state
  useEffect(() => {
    if (propTotalSessions !== undefined) {
      setTotalSessions(propTotalSessions);
    }
    if (propUsedSessions !== undefined) {
      setUsedSessions(propUsedSessions);
    }
  }, [propTotalSessions, propUsedSessions]);
  
  const sessionCost = pricePerMinute !== null ? pricePerMinute.toFixed(2) : '0.00';
  
  const handleSessionPurchase = async (sessions: number, cost: number) => {
    // Notify parent component about session purchase for billing update
    if (onSessionPurchase) {
      onSessionPurchase(sessions, cost);
    }
    
    // Also save to backend if we have an institution ID
    if (institutionId) {
      try {
        await SessionService.createSessionPurchase({
          sessionCount: sessions,
          pricePerSession: pricePerMinute !== null ? parseFloat(pricePerMinute.toFixed(2)) : 0
        });
        // Don't show any toasts here - let the SessionPurchase component handle all toasts
        // This prevents overlapping notifications
      } catch (error) {
        // Don't show any toasts here either - let SessionPurchase component handle all toasts
        // This prevents overlapping notifications
        console.warn('Session purchase initiation failed:', error);
      }
    }
  };
  
  // Add a function to refresh session data
  const refreshSessionData = async () => {
    if (!institutionId) return;
    
    try {
      const sessionPool = await SessionService.getSessionPool();
      if (sessionPool) {
        setTotalSessions(sessionPool.totalSessions || 0);
        setUsedSessions(sessionPool.usedSessions || 0);
      }
    } catch (error) {
      console.warn('Failed to refresh session data:', error);
    }
  };
  
  // Update the handleSessionPurchase callback to refresh data after purchase
  const handleSessionPurchaseWithRefresh = async (sessions: number, cost: number) => {
    await handleSessionPurchase(sessions, cost);
    // Refresh session data after a short delay to allow for database updates
    setTimeout(refreshSessionData, 1000);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 overflow-hidden w-full">
      {/* Session Pool Status and Duration in a responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SessionPoolStatus 
          totalSessions={totalSessions} 
          usedSessions={usedSessions} 
        />
        <SessionDuration 
          sessionLength={sessionLength} 
          setSessionLength={setSessionLength} 
          pricePerMinute={pricePerMinute} 
        />
      </div>
      
      {/* Session Purchase and Allocation in a responsive layout */}
      <div className="grid grid-cols-1 gap-6">
        <SessionPurchase 
          sessionLength={sessionLength} 
          sessionCost={sessionCost} 
          onSessionPurchase={handleSessionPurchaseWithRefresh} 
        />
        
        {institutionId && (
          <SessionAllocation institutionId={institutionId} />
        )}
      </div>
    </div>
  );
};

export default SessionManagement;