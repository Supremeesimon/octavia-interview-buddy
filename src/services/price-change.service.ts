import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc, getDoc, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScheduledPriceChange } from '@/types';

export class PriceChangeService {
  private static readonly COLLECTION_NAME = 'scheduled_price_changes';
  private static readonly META_COLLECTION_NAME = 'metadata';

  static async createPriceChange(data: Omit<ScheduledPriceChange, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating price change:', error);
      throw new Error(`Failed to create price change: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAllPriceChanges(): Promise<ScheduledPriceChange[]> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning empty array');
        return [];
      }
      
      console.log('Fetching price changes from Firestore...');
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('changeDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      console.log(`Found ${querySnapshot.size} price changes in Firestore`);
      
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw document data:', data);
        return {
          id: doc.id,
          ...data,
          changeDate: data.changeDate?.toDate ? data.changeDate.toDate() : data.changeDate || new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || new Date()
        } as ScheduledPriceChange;
      });
      
      console.log('Processed price changes:', results);
      return results;
    } catch (error) {
      console.error('Error fetching price changes:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async getPriceChangeById(id: string): Promise<ScheduledPriceChange | null> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning null');
        return null;
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          changeDate: data.changeDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ScheduledPriceChange;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching price change:', error);
      return null;
    }
  }

  static async deletePriceChange(id: string): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting price change:', error);
      throw new Error(`Failed to delete price change: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updatePriceChange(id: string, data: Partial<ScheduledPriceChange>): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const priceChangeRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(priceChangeRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating price change:', error);
      throw new Error(`Failed to update price change: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to get upcoming price changes (scheduled status)
  static async getUpcomingPriceChanges(): Promise<ScheduledPriceChange[]> {
    try {
      const allChanges = await this.getAllPriceChanges();
      return allChanges.filter(change => change.status === 'scheduled');
    } catch (error) {
      console.error('Error fetching upcoming price changes:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Method to check if sample data has already been initialized
  private static async isSampleDataInitialized(): Promise<boolean> {
    try {
      if (!db) return true; // If Firebase not initialized, assume initialized to prevent errors
      
      const metaDocRef = doc(db, this.META_COLLECTION_NAME, 'price_changes_initialized');
      const metaDocSnap = await getDoc(metaDocRef);
      
      // Return true if the document exists and initialized is true
      // Also return true if the document exists but doesn't have the initialized field
      // (to prevent re-initialization after user has deleted data)
      if (metaDocSnap.exists()) {
        const data = metaDocSnap.data();
        return data?.initialized === true || data?.initialized === undefined;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if sample data is initialized:', error);
      // If there's an error checking, assume it's initialized to prevent issues
      return true;
    }
  }

  // Method to mark sample data as initialized
  private static async markSampleDataAsInitialized(): Promise<void> {
    try {
      if (!db) return;
      
      const metaDocRef = doc(db, this.META_COLLECTION_NAME, 'price_changes_initialized');
      await setDoc(metaDocRef, {
        initialized: true,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking sample data as initialized:', error);
    }
  }

  // Method to initialize the collection with sample data if empty and not already initialized
  static async initializeSampleData(): Promise<void> {
    try {
      // Check if sample data has already been initialized
      const isInitialized = await this.isSampleDataInitialized();
      
      // In production, we should not automatically create sample data
      // Only initialize if explicitly requested or if this is a completely fresh install
      if (isInitialized) {
        return;
      }

      console.log('Checking for existing price changes...');
      const existingChanges = await this.getAllPriceChanges();
      console.log(`Found ${existingChanges.length} existing price changes`);
      
      // If there are existing changes, mark as initialized to prevent future recreation
      if (existingChanges.length > 0) {
        console.log('Existing price changes found, marking as initialized');
        await this.markSampleDataAsInitialized();
        return;
      }
      
      // For production, we don't automatically create sample data
      // Only mark as initialized to prevent future attempts
      console.log('No existing price changes found. Marking as initialized without creating sample data.');
      await this.markSampleDataAsInitialized();
      
    } catch (error) {
      console.error('Error initializing sample data:', error);
      // Try to mark as initialized even if there was an error to prevent infinite retries
      try {
        await this.markSampleDataAsInitialized();
      } catch (markError) {
        console.error('Error marking sample data as initialized after failure:', markError);
      }
    }
  }
}
