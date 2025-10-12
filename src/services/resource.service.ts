import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/types';

export class ResourceService {
  private static readonly COLLECTION_NAME = 'resources';

  static async getAllResources(): Promise<Resource[]> {
    try {
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('dateCreated', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Resource;
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  }

  static async createResource(resource: Omit<Resource, 'id'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...resource,
        dateCreated: new Date().toISOString().split('T')[0]
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  }

  static async updateResource(id: string, resource: Partial<Resource>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const resourceRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(resourceRef, resource);
    } catch (error) {
      console.error('Error updating resource:', error);
      throw new Error('Failed to update resource');
    }
  }

  static async deleteResource(id: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const resourceRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(resourceRef);
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw new Error('Failed to delete resource');
    }
  }

  static async assignResourceToInstitutions(resourceId: string, institutionIds: string[]): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const resourceRef = doc(db, this.COLLECTION_NAME, resourceId);
      await updateDoc(resourceRef, {
        assignedInstitutions: institutionIds
      });
    } catch (error) {
      console.error('Error assigning resource:', error);
      throw new Error('Failed to assign resource');
    }
  }
}