import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScheduledPriceChange } from '@/types';

export class PriceChangeService {
  private static readonly COLLECTION_NAME = 'scheduled_price_changes';

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
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('changeDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          changeDate: data.changeDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ScheduledPriceChange;
      });
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

  // Method to initialize the collection with sample data if empty
  static async initializeSampleData(): Promise<void> {
    try {
      const existingChanges = await this.getAllPriceChanges();
      
      if (existingChanges.length === 0) {
        console.log('No existing price changes found. Creating sample data...');
        
        // Create sample price changes
        const sampleChanges = [
          {
            changeDate: new Date('2025-06-01'),
            changeType: 'vapiCost' as const,
            affected: 'all',
            currentValue: 0.11,
            newValue: 0.12,
            status: 'scheduled' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            changeDate: new Date('2025-07-01'),
            changeType: 'markupPercentage' as const,
            affected: 'all',
            currentValue: 36.36,
            newValue: 40.0,
            status: 'scheduled' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        // Only try to create sample data if Firebase is initialized
        if (db) {
          for (const change of sampleChanges) {
            await this.createPriceChange(change);
          }
          
          console.log('Sample price changes created successfully!');
        }
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      // Don't throw error to prevent UI crashes
    }
  }
}