import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InstitutionInterest {
  id?: string;
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  studentCapacity: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'contacted' | 'processed';
  processedAt?: Date;
  processedBy?: string;
  approvedBy?: string;
  customSignupToken?: string;
  customSignupLink?: string;
}

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
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate()
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

  static async updateInterestStatus(id: string, status: InstitutionInterest['status'], processedBy?: string): Promise<void> {
    try {
      const interestRef = doc(db, this.COLLECTION_NAME, id);
      const updateData: any = { status };
      
      if (status === 'processed' && processedBy) {
        updateData.processedAt = serverTimestamp();
        updateData.processedBy = processedBy;
        updateData.approvedBy = processedBy;
      }
      
      await updateDoc(interestRef, updateData);
    } catch (error) {
      console.error('Error updating institution interest status:', error);
      throw new Error('Failed to update institution interest status');
    }
  }
}