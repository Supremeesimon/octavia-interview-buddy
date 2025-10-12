import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/types';

export class ResourceService {
  private static readonly COLLECTION_NAME = 'resources';

  static async getAllResources(): Promise<Resource[]> {
    try {
      console.log('Fetching all resources from Firebase...');
      
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('dateCreated', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log('Found', querySnapshot.size, 'resources');
      
      const resources = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Resource data:', data);
        return {
          id: doc.id,
          ...data
        } as Resource;
      });
      
      console.log('Returning', resources.length, 'resources');
      return resources;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  }

  static async createResource(resource: Omit<Resource, 'id'>): Promise<string> {
    try {
      console.log('Creating resource in Firebase:', resource);
      
      if (!db) {
        console.error('Firebase not initialized');
        throw new Error('Firebase not initialized');
      }

      console.log('Adding document to collection:', this.COLLECTION_NAME);
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...resource,
        dateCreated: new Date().toISOString().split('T')[0]
      });
      
      console.log('Resource created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating resource:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw new Error(`Failed to create resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        institutions: institutionIds
      });
    } catch (error) {
      console.error('Error assigning resource:', error);
      throw new Error('Failed to assign resource');
    }
  }
}