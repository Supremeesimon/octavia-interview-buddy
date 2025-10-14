import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Institution, InstitutionPricingOverride } from '@/types';

export class InstitutionService {
  private static readonly COLLECTION_NAME = 'institutions';

  static async createInstitution(data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        pricingOverride: null, // Initialize with null pricing override
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating institution:', error);
      throw new Error(`Failed to create institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAllInstitutions(): Promise<Institution[]> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning empty array');
        return [];
      }
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          pricingOverride: data.pricingOverride || null, // Ensure pricingOverride is properly handled
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Institution;
      });
    } catch (error) {
      console.error('Error fetching institutions:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async getInstitutionById(id: string): Promise<Institution | null> {
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
          pricingOverride: data.pricingOverride || null, // Ensure pricingOverride is properly handled
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Institution;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching institution:', error);
      return null;
    }
  }

  static async deleteInstitution(id: string): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw new Error(`Failed to delete institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateInstitution(id: string, data: Partial<Institution>): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const institutionRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(institutionRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      throw new Error(`Failed to update institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New method to update pricing override for an institution
  static async updatePricingOverride(institutionId: string, pricingOverride: InstitutionPricingOverride): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const institutionRef = doc(db, this.COLLECTION_NAME, institutionId);
      await updateDoc(institutionRef, {
        pricingOverride,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating institution pricing override:', error);
      throw new Error(`Failed to update institution pricing override: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New method to remove pricing override for an institution
  static async removePricingOverride(institutionId: string): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const institutionRef = doc(db, this.COLLECTION_NAME, institutionId);
      await updateDoc(institutionRef, {
        pricingOverride: null,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error removing institution pricing override:', error);
      throw new Error(`Failed to remove institution pricing override: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Migration method to ensure all institutions have the pricingOverride field
  static async ensurePricingOverrideField(): Promise<void> {
    try {
      const institutions = await this.getAllInstitutions();
      
      // Only proceed if we have institutions and Firebase is initialized
      if (institutions.length > 0 && db) {
        for (const institution of institutions) {
          // If the institution doesn't have pricingOverride field, add it
          if (institution.pricingOverride === undefined) {
            await this.updateInstitution(institution.id, {
              pricingOverride: null
            });
            console.log(`Added pricingOverride field to institution: ${institution.name}`);
          }
        }
      }
      
      console.log('Pricing override field ensured for all institutions');
    } catch (error) {
      console.error('Error ensuring pricing override field:', error);
      // Don't throw error to prevent UI crashes
    }
  }

  // New method to approve an institution
  static async approveInstitution(id: string, platformAdminId: string): Promise<void> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      const institutionRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(institutionRef, {
        approvalStatus: 'approved',
        platform_admin_id: platformAdminId,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error approving institution:', error);
      throw new Error(`Failed to approve institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default InstitutionService;
