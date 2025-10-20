import React, { useState, useEffect } from 'react';
import SessionPoolStatus from './session/SessionPoolStatus';
import SessionDuration from './session/SessionDuration';
import SessionPurchase from './session/SessionPurchase';
import SessionAllocation from './session/SessionAllocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { InstitutionService } from '@/services/institution.service';
import { SessionService } from '@/services/session.service';
import { useToast } from '@/hooks/use-toast';

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
  const [pricePerMinute, setPricePerMinute] = useState(0.17); // Default $0.17 per minute (based on current platform settings)
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Fetch platform pricing settings and institution-specific overrides
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        // First get platform default settings
        const platformSettings = await PlatformSettingsService.getAllSettings();
        let calculatedPrice = 0.17; // Default fallback based on current platform settings
        
        if (platformSettings) {
          // Calculate price per minute based on VAPI cost and markup
          calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
        }
        
        // If we have an institution ID, check for institution-specific pricing override
        if (institutionId) {
          const institution = await InstitutionService.getInstitutionById(institutionId);
          if (institution?.pricingOverride?.isEnabled) {
            // Use institution-specific pricing
            calculatedPrice = institution.pricingOverride.customVapiCost * 
                             (1 + institution.pricingOverride.customMarkupPercentage / 100);
          }
        }
        
        setPricePerMinute(calculatedPrice);
      } catch (error) {
        console.error('Error fetching pricing settings:', error);
        // Keep default value of 0.17 if there's an error
      }
    };
    
    fetchPricingSettings();
  }, [institutionId]);
  
  // Fetch interview session data from the backend
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!institutionId) return;
      
      setLoading(true);
      try {
        // Try to get interview session data from the new SessionService first
        const sessionPool = await SessionService.getSessionPool();
        if (sessionPool) {
          setTotalSessions(sessionPool.totalSessions);
          setUsedSessions(sessionPool.usedSessions);
        } else {
          // Fallback to the old method
          const licenseInfo = await InstitutionDashboardService.getLicenseInfo(institutionId);
          setTotalSessions(licenseInfo.totalLicenses);
          setUsedSessions(licenseInfo.usedLicenses);
        }
      } catch (error: any) {
        console.error('Error fetching interview session data:', error);
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
        // Try fallback method even if there was an error with SessionService
        if (institutionId) {
          try {
            const licenseInfo = await InstitutionDashboardService.getLicenseInfo(institutionId);
            setTotalSessions(licenseInfo.totalLicenses);
            setUsedSessions(licenseInfo.usedLicenses);
          } catch (fallbackError) {
            console.error('Error with fallback method:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we don't have props or if props are undefined
    if (institutionId && (propTotalSessions === undefined || propUsedSessions === undefined)) {
      fetchSessionData();
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
  
  const sessionCost = (sessionLength * pricePerMinute).toFixed(2);
  
  const handleSessionPurchase = async (sessions: number, cost: number) => {
    setTotalSessions(prev => prev + sessions);
    
    // Notify parent component about session purchase for billing update
    if (onSessionPurchase) {
      onSessionPurchase(sessions, cost);
    }
    
    // Also save to backend if we have an institution ID
    if (institutionId) {
      try {
        await SessionService.createSessionPurchase({
          institutionId,
          sessionId: '',
          quantity: sessions,
          pricePerSession: parseFloat(sessionCost),
          totalPrice: cost
        });
        toast({
          title: "Purchase successful",
          description: `${sessions} interview sessions have been added to your pool.`,
        });
      } catch (error) {
        console.error('Error saving interview session purchase:', error);
        toast({
          title: "Error",
          description: "Interview session purchase was successful but failed to save to backend.",
          variant: "destructive"
        });
      }
    }
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
      
      <SessionPurchase 
        sessionLength={sessionLength} 
        sessionCost={sessionCost} 
        onSessionPurchase={handleSessionPurchase} 
      />
      
      <SessionAllocation institutionId={institutionId} />
    </div>
  );
};

export default SessionManagement;