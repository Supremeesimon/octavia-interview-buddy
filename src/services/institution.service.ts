import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Institution, InstitutionPricingOverride } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class InstitutionService {
  private static readonly COLLECTION_NAME = 'institutions';

  static async createInstitution(data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      // Generate custom signup token and link for new institutions
      const customSignupToken = uuidv4();
      const customSignupLink = `${window.location.origin}/signup-institution/${customSignupToken}`;
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        customSignupToken,
        customSignupLink,
        pricingOverride: null, // Initialize with null pricing override
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAllInstitutions(): Promise<Institution[]> {
    try {
      // Check if db is initialized
      if (!db) {
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
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async getInstitutionById(id: string): Promise<Institution | null> {
    try {
      // Check if db is initialized
      if (!db) {
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
          }
        }
      }
    } catch (error) {
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
      throw new Error(`Failed to approve institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New method to regenerate signup token and link for a specific institution
  static async regenerateSignupToken(institutionId: string): Promise<{ token: string; link: string }> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      // Generate new token and link
      const newToken = uuidv4();
      // Use a more robust approach for generating the link
      const origin = typeof window !== 'undefined' && window.location?.origin 
        ? window.location.origin 
        : 'http://localhost:8080';
      const newLink = `${origin}/signup-institution/${newToken}`;
      
      // Update the institution document
      const institutionRef = doc(db, this.COLLECTION_NAME, institutionId);
      await updateDoc(institutionRef, {
        customSignupToken: newToken,
        customSignupLink: newLink,
        updatedAt: Timestamp.now()
      });
      
      return { token: newToken, link: newLink };
    } catch (error) {
      throw new Error(`Failed to regenerate signup token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New method to regenerate signup tokens for all institutions
  static async regenerateAllSignupTokens(): Promise<number> {
    try {
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      // Get all institutions
      const institutions = await this.getAllInstitutions();
      let updatedCount = 0;
      
      // Update each institution with new token and link
      for (const institution of institutions) {
        try {
          await this.regenerateSignupToken(institution.id);
          updatedCount++;
        } catch (error) {
          // Continue with other institutions even if one fails
        }
      }
      
      return updatedCount;
    } catch (error) {
      throw new Error(`Failed to regenerate all signup tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default InstitutionService;