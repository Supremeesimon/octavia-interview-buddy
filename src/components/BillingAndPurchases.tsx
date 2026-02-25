import React, { useState, useEffect } from 'react';
import BillingControls from './BillingControls';
import SessionPurchase from './session/SessionPurchase';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { InstitutionService } from '@/services/institution.service';
import { SessionService } from '@/services/session.service';
import { PricingSyncService } from '@/services/pricing-sync.service';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { canAccessFinancialData } from '@/utils/role-utils';

interface BillingAndPurchasesProps {
  institutionId?: string;
}

const BillingAndPurchases = ({ institutionId }: BillingAndPurchasesProps) => {
  const [sessionLength, setSessionLength] = useState(30); // Default 30 minutes
  const [pricePerMinute, setPricePerMinute] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  
  // Fetch pricing settings
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        // First get platform default settings
        const platformSettings = await PlatformSettingsService.getAllSettings();
        let calculatedPrice: number | null = null;
        
        if (platformSettings) {
          // Only validate and calculate pricing for users with appropriate access
          if (canAccessFinancialData(user)) {
            const pricingToValidate = {
              vapiCost: platformSettings.vapiCostPerMinute,
              markupPercentage: platformSettings.markupPercentage,
              licenseCost: platformSettings.annualLicenseCost
            };
            
            if (PricingSyncService.validatePricing(pricingToValidate)) {
              calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
            } else {
              if (platformSettings.vapiCostPerMinute && platformSettings.markupPercentage) {
                calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
              } else {
                calculatedPrice = null;
              }
            }
          } else {
            calculatedPrice = platformSettings.vapiCostPerMinute * (1 + platformSettings.markupPercentage / 100);
          }
        } else {
          calculatedPrice = null;
        }
        
        // If we have an institution ID, check for institution-specific pricing override
        if (institutionId) {
          try {
            const institution = await InstitutionService.getInstitutionById(institutionId);
            if (institution?.pricingOverride?.isEnabled) {
              if (canAccessFinancialData(user)) {
                if (PricingSyncService.validateInstitutionPricing(institution)) {
                  calculatedPrice = institution.pricingOverride.customVapiCost * 
                                   (1 + institution.pricingOverride.customMarkupPercentage / 100);
                } else {
                  if (institution.pricingOverride.customVapiCost && institution.pricingOverride.customMarkupPercentage) {
                    calculatedPrice = institution.pricingOverride.customVapiCost * 
                                     (1 + institution.pricingOverride.customMarkupPercentage / 100);
                  }
                }
              } else {
                calculatedPrice = institution.pricingOverride.customVapiCost * 
                                 (1 + institution.pricingOverride.customMarkupPercentage / 100);
              }
            }
            
            // Also fetch the institution's session length setting
            if (institution?.settings?.sessionLength) {
              setSessionLength(institution.settings.sessionLength);
            }
          } catch (error) {
            // Silently handle errors
          }
        }
        
        setPricePerMinute(calculatedPrice);
      } catch (error) {
        setPricePerMinute(null);
      }
    };
    
    fetchPricingSettings();
  }, [institutionId, user]);
  
  const sessionCost = pricePerMinute !== null ? pricePerMinute.toFixed(2) : '0.00';
  
  const handleSessionPurchase = async (sessions: number, cost: number) => {
    // Save to backend if we have an institution ID
    if (institutionId) {
      try {
        await SessionService.createSessionPurchase({
          sessionCount: sessions,
          pricePerSession: pricePerMinute !== null ? parseFloat(pricePerMinute.toFixed(2)) : 0
        });
        // Let the SessionPurchase component handle all toasts
      } catch (error) {
        console.warn('Session purchase initiation failed:', error);
      }
    }
  };
  
  // Add a function to refresh session data
  const refreshSessionData = async () => {
    if (!institutionId) return;
    
    try {
      const sessionPool = await SessionService.getSessionPool();
      console.log('Session pool data refreshed:', sessionPool);
      // The BillingControls component should listen for this event to update its display
      window.dispatchEvent(new CustomEvent('sessionPurchaseCompleted'));
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
  
  return (
    <div className="space-y-6">
      {/* Session Purchase Section */}
      <SessionPurchase 
        sessionLength={sessionLength} 
        sessionCost={sessionCost} 
        onSessionPurchase={handleSessionPurchaseWithRefresh} 
      />
      
      {/* Billing Controls Section */}
      <BillingControls />
    </div>
  );
};

export default BillingAndPurchases;