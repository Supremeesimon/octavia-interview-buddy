import React, { useState, useEffect } from 'react';
import SessionPoolStatus from './session/SessionPoolStatus';
import SessionDuration from './session/SessionDuration';
import SessionPurchase from './session/SessionPurchase';
import SessionAllocation from './session/SessionAllocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { InstitutionService } from '@/services/institution.service';

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
  
  // If we have an institutionId but no session data, fetch it
  useEffect(() => {
    const fetchSessionData = async () => {
      if (institutionId && (propTotalSessions === undefined || propUsedSessions === undefined)) {
        setLoading(true);
        try {
          const licenseInfo = await InstitutionDashboardService.getLicenseInfo(institutionId);
          setTotalSessions(licenseInfo.totalLicenses);
          setUsedSessions(licenseInfo.usedLicenses);
        } catch (error) {
          console.error('Error fetching session data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSessionData();
  }, [institutionId, propTotalSessions, propUsedSessions]);
  
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
  
  const handleSessionPurchase = (sessions: number, cost: number) => {
    setTotalSessions(prev => prev + sessions);
    
    // Notify parent component about session purchase for billing update
    if (onSessionPurchase) {
      onSessionPurchase(sessions, cost);
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