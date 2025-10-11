import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InstitutionInterest } from '@/types';

export class InstitutionInterestService {
  private static readonly COLLECTION_NAME = 'institution_interests';

  static async submitInterest(data: Omit<InstitutionInterest, 'id' | 'createdAt' | 'status'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        createdAt: Timestamp.now(),
        status: 'pending'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting institution interest:', error);
      throw new Error('Failed to submit institution interest');
    }
  }

  static async getAllInterests(): Promise<InstitutionInterest[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as InstitutionInterest));
    } catch (error) {
      console.error('Error fetching institution interests:', error);
      throw new Error('Failed to fetch institution interests');
    }
  }

  static async deleteInterest(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting institution interest:', error);
      throw new Error('Failed to delete institution interest');
    }
  }

  static async updateInterestStatus(id: string, status: InstitutionInterest['status']): Promise<void> {
    try {
      const interestRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(interestRef, { status });
    } catch (error) {
      console.error('Error updating institution interest status:', error);
      throw new Error('Failed to update institution interest status');
    }
  }
}