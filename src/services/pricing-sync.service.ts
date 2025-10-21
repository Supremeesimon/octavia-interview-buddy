import { PlatformSettingsService } from './platform-settings.service';
import { InstitutionService } from './institution.service';

export class PricingSyncService {
  /**
   * Synchronizes platform pricing settings between UI state and database
   * Ensures that what's displayed in the UI matches what's in the database
   */
  static async syncPlatformPricing(currentUiState: {
    vapiCost: number;
    markupPercentage: number;
    licenseCost: number;
  }): Promise<{
    vapiCost: number;
    markupPercentage: number;
    licenseCost: number;
    isSynced: boolean;
  }> {
    try {
      // Get the actual database values
      const dbSettings = await PlatformSettingsService.getPricingSettings();
      
      if (!dbSettings) {
        // If no database settings, return UI state but mark as not synced
        return {
          ...currentUiState,
          isSynced: false
        };
      }
      
      // Check if UI state matches database
      const isSynced = 
        currentUiState.vapiCost === dbSettings.vapiCostPerMinute &&
        currentUiState.markupPercentage === dbSettings.markupPercentage &&
        currentUiState.licenseCost === dbSettings.annualLicenseCost;
      
      // Return database values if they exist
      return {
        vapiCost: dbSettings.vapiCostPerMinute,
        markupPercentage: dbSettings.markupPercentage,
        licenseCost: dbSettings.annualLicenseCost,
        isSynced
      };
    } catch (error) {
      // Return UI state if there's an error
      return {
        ...currentUiState,
        isSynced: false
      };
    }
  }
  
  /**
   * Forces synchronization by updating the database with UI values
   * Use this when the user explicitly saves changes
   */
  static async forceSyncPlatformPricing(uiState: {
    vapiCost: number;
    markupPercentage: number;
    licenseCost: number;
  }): Promise<boolean> {
    try {
      // Validate pricing before saving
      if (!this.validatePricing(uiState)) {
        return false;
      }
      
      await PlatformSettingsService.updatePricingSettings({
        vapiCostPerMinute: uiState.vapiCost,
        markupPercentage: uiState.markupPercentage,
        annualLicenseCost: uiState.licenseCost
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validates platform pricing values
   */
  static validatePricing(pricing: {
    vapiCost: number;
    markupPercentage: number;
    licenseCost: number;
  }): boolean {
    // VAPI cost validation (reasonable range)
    if (pricing.vapiCost < 0.05 || pricing.vapiCost > 0.25) {
      return false;
    }
    
    // Markup percentage validation (reasonable range)
    if (pricing.markupPercentage < 10 || pricing.markupPercentage > 100) {
      return false;
    }
    
    // License cost validation (non-negative)
    if (pricing.licenseCost < 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates that institution pricing overrides are consistent
   * Ensures that enabled overrides have valid values
   */
  static validateInstitutionPricing(institution: any): boolean {
    if (!institution.pricingOverride || !institution.pricingOverride.isEnabled) {
      return true; // No override or not enabled, so it's valid
    }
    
    const override = institution.pricingOverride;
    
    // Check that all required values are present and valid
    const isValid = (
      typeof override.customVapiCost === 'number' && 
      override.customVapiCost >= 0.05 && 
      override.customVapiCost <= 0.25 &&
      typeof override.customMarkupPercentage === 'number' && 
      override.customMarkupPercentage >= 10 && 
      override.customMarkupPercentage <= 100 &&
      typeof override.customLicenseCost === 'number' && 
      override.customLicenseCost >= 0
    );
    
    return isValid;
  }
  
  /**
   * Cleans up invalid pricing overrides
   * Disables overrides that have invalid values
   */
  static async cleanupInvalidOverrides(institutions: any[]): Promise<number> {
    let fixedCount = 0;
    
    for (const institution of institutions) {
      if (institution.pricingOverride && institution.pricingOverride.isEnabled) {
        if (!this.validateInstitutionPricing(institution)) {
          try {
            // Disable the invalid override
            const updatedOverride = { 
              ...institution.pricingOverride, 
              isEnabled: false 
            };
            
            await InstitutionService.updatePricingOverride(
              institution.id, 
              updatedOverride
            );
            
            fixedCount++;
          } catch (error) {
            // Silently handle errors
          }
        }
      }
    }
    
    return fixedCount;
  }
}

export default PricingSyncService;