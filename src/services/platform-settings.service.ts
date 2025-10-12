import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlatformPricingSettings {
  vapiCostPerMinute: number;
  markupPercentage: number;
  annualLicenseCost: number;
  updatedAt: Date;
}

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
}