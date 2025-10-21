import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { canAccessPricingDetails } from '@/utils/role-utils';

export interface PlatformPricingSettings {
  vapiCostPerMinute: number;
  markupPercentage: number;
  annualLicenseCost: number;
  updatedAt: Date;
}

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
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          vapiCostPerMinute: data.vapiCostPerMinute,
          markupPercentage: data.markupPercentage,
          annualLicenseCost: data.annualLicenseCost,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      // Return null if document doesn't exist
      return null;
    } catch (error: any) {
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        // Return null to indicate "Not Available" rather than using defaults
        return null;
      }
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
      throw new Error(`Failed to update platform pricing settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add methods for margin alert settings
  static async getMarginAlertSettings(): Promise<PlatformMarginAlertSettings | null> {
    try {
      // Check if db is initialized
      if (!db) {
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          lowMarginThreshold: data.lowMarginThreshold,
          highVapiCostThreshold: data.highVapiCostThreshold,
          autoPriceAdjustment: data.autoPriceAdjustment,
          emailNotifications: data.emailNotifications,
          lowMarginAlertEnabled: data.lowMarginAlertEnabled,
          highVapiCostAlertEnabled: data.highVapiCostAlertEnabled,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      // Return null if document doesn't exist
      return null;
    } catch (error: any) {
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        // Return null to indicate "Not Available" rather than using defaults
        return null;
      }
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
      throw new Error(`Failed to update platform margin alert settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add method to get all settings at once
  static async getAllSettings(): Promise<PlatformSettings | null> {
    try {
      // Check if db is initialized
      if (!db) {
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          vapiCostPerMinute: data.vapiCostPerMinute,
          markupPercentage: data.markupPercentage,
          annualLicenseCost: data.annualLicenseCost,
          lowMarginThreshold: data.lowMarginThreshold,
          highVapiCostThreshold: data.highVapiCostThreshold,
          autoPriceAdjustment: data.autoPriceAdjustment,
          emailNotifications: data.emailNotifications,
          lowMarginAlertEnabled: data.lowMarginAlertEnabled,
          highVapiCostAlertEnabled: data.highVapiCostAlertEnabled,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      // Return null if document doesn't exist
      return null;
    } catch (error: any) {
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        // Return null to indicate "Not Available" rather than using defaults
        return null;
      }
      // Return null for any other error to indicate "Not Available"
      return null;
    }
  }
}