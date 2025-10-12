// Add interface for margin alert settings
export interface PlatformMarginAlertSettings {
  lowMarginThreshold: number;
  highVapiCostThreshold: number;
  autoPriceAdjustment: boolean;
  emailNotifications: boolean;
  // Add toggle states for the alert switches
  lowMarginAlertEnabled: boolean;
  highVapiCostAlertEnabled: boolean;
  updatedAt: Date;
}

// Extend to include both pricing and margin alert settings
export interface PlatformSettings extends PlatformPricingSettings, PlatformMarginAlertSettings {}

export class PlatformSettingsService {
  private static readonly SETTINGS_DOC_ID = 'pricing';
  private static readonly COLLECTION_NAME = 'system_config';

  static async getPricingSettings(): Promise<PlatformPricingSettings | null> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning null');
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          vapiCostPerMinute: data.vapiCostPerMinute || 0.11,
          markupPercentage: data.markupPercentage || 36.36,
          annualLicenseCost: data.annualLicenseCost || 19.96,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      // Return default values if document doesn't exist
      return {
        vapiCostPerMinute: 0.11,
        markupPercentage: 36.36,
        annualLicenseCost: 19.96,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching platform pricing settings:', error);
      return null;
    }
  }

  static async updatePricingSettings(settings: Omit<PlatformPricingSettings, 'updatedAt'>): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      await setDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating platform pricing settings:', error);
      throw new Error(`Failed to update platform pricing settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add methods for margin alert settings
  static async getMarginAlertSettings(): Promise<PlatformMarginAlertSettings | null> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning null');
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          lowMarginThreshold: data.lowMarginThreshold !== undefined ? data.lowMarginThreshold : 25,
          highVapiCostThreshold: data.highVapiCostThreshold !== undefined ? data.highVapiCostThreshold : 0.15,
          autoPriceAdjustment: data.autoPriceAdjustment !== undefined ? data.autoPriceAdjustment : false,
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
          lowMarginAlertEnabled: data.lowMarginAlertEnabled !== undefined ? data.lowMarginAlertEnabled : true,
          highVapiCostAlertEnabled: data.highVapiCostAlertEnabled !== undefined ? data.highVapiCostAlertEnabled : true,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      // Return default values if document doesn't exist
      return {
        lowMarginThreshold: 25,
        highVapiCostThreshold: 0.15,
        autoPriceAdjustment: false,
        emailNotifications: true,
        lowMarginAlertEnabled: true,
        highVapiCostAlertEnabled: true,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching platform margin alert settings:', error);
      return null;
    }
  }

  static async updateMarginAlertSettings(settings: Omit<PlatformMarginAlertSettings, 'updatedAt'>): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      await setDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating platform margin alert settings:', error);
      throw new Error(`Failed to update platform margin alert settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add method to get all settings at once
  static async getAllSettings(): Promise<PlatformSettings | null> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning null');
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          vapiCostPerMinute: data.vapiCostPerMinute || 0.11,
          markupPercentage: data.markupPercentage || 36.36,
          annualLicenseCost: data.annualLicenseCost || 19.96,
          lowMarginThreshold: data.lowMarginThreshold !== undefined ? data.lowMarginThreshold : 25,
          highVapiCostThreshold: data.highVapiCostThreshold !== undefined ? data.highVapiCostThreshold : 0.15,
          autoPriceAdjustment: data.autoPriceAdjustment !== undefined ? data.autoPriceAdjustment : false,
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
          lowMarginAlertEnabled: data.lowMarginAlertEnabled !== undefined ? data.lowMarginAlertEnabled : true,
          highVapiCostAlertEnabled: data.highVapiCostAlertEnabled !== undefined ? data.highVapiCostAlertEnabled : true,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      // Return default values if document doesn't exist
      return {
        vapiCostPerMinute: 0.11,
        markupPercentage: 36.36,
        annualLicenseCost: 19.96,
        lowMarginThreshold: 25,
        highVapiCostThreshold: 0.15,
        autoPriceAdjustment: false,
        emailNotifications: true,
        lowMarginAlertEnabled: true,
        highVapiCostAlertEnabled: true,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error fetching all platform settings:', error);
      return null;
    }
  }
}