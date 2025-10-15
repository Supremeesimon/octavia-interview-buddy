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
  const [pricePerMinute, setPricePerMinute] = useState(0.15); // Default $0.15 per minute
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Fetch platform pricing settings and institution-specific overrides
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        // First get platform default settings
        const platformSettings = await PlatformSettingsService.getAllSettings();
        let calculatedPrice = 0.15; // Default fallback
        
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
        // Keep default value of 0.15 if there's an error
      }
    };
    
    fetchPricingSettings();
  }, [institutionId]);
  
  // Fetch session data from the backend
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!institutionId) return;
      
      setLoading(true);
      try {
        // Try to get session data from the new SessionService first
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
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: "Error",
          description: "Failed to load session data. Using default values.",
          variant: "destructive"
        });
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
        await SessionService.createSessionPurchase(sessions, pricePerMinute);
        toast({
          title: "Purchase successful",
          description: `${sessions} sessions have been added to your pool.`,
        });
      } catch (error) {
        console.error('Error saving session purchase:', error);
        toast({
          title: "Error",
          description: "Session purchase was successful but failed to save to backend.",
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
      
      <SessionAllocation />
    </div>
  );
};

export default SessionManagement;