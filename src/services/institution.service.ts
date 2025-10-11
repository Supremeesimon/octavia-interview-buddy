import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Institution } from '@/types';

export class InstitutionService {
  private static readonly COLLECTION_NAME = 'institutions';

  static async createInstitution(data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating institution:', error);
      throw new Error('Failed to create institution');
    }
  }

  static async getAllInstitutions(): Promise<Institution[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Institution));
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw new Error('Failed to fetch institutions');
    }
  }

  static async getInstitutionById(id: string): Promise<Institution | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as Institution;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching institution:', error);
      throw new Error('Failed to fetch institution');
    }
  }

  static async deleteInstitution(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw new Error('Failed to delete institution');
    }
  }

  static async updateInstitution(id: string, data: Partial<Institution>): Promise<void> {
    try {
      const institutionRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(institutionRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      throw new Error('Failed to update institution');
    }
  }
}