import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DepartmentStats } from '@/types';

export interface Department {
  id: string;
  name: string;
  institutionId: string;
  teacherId?: string;
  studentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DepartmentService {
  private static readonly COLLECTION_NAME = 'departments';

  static async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        studentCount: data.studentCount || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error(`Failed to create department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAllDepartments(): Promise<Department[]> {
    try {
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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Department;
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  static async getDepartmentsByInstitution(institutionId: string): Promise<Department[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('institutionId', '==', institutionId),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Department;
      });
    } catch (error) {
      console.error('Error fetching departments by institution:', error);
      return [];
    }
  }

  static async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Department;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching department:', error);
      return null;
    }
  }

  static async updateDepartment(id: string, data: Partial<Department>): Promise<void> {
    try {
      const departmentRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating department:', error);
      throw new Error(`Failed to update department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteDepartment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting department:', error);
      throw new Error(`Failed to delete department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async assignTeacherToDepartment(departmentId: string, teacherId: string): Promise<void> {
    try {
      await this.updateDepartment(departmentId, {
        teacherId
      });
    } catch (error) {
      console.error('Error assigning teacher to department:', error);
      throw new Error(`Failed to assign teacher to department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async incrementStudentCount(departmentId: string): Promise<void> {
    try {
      const department = await this.getDepartmentById(departmentId);
      if (department) {
        await this.updateDepartment(departmentId, {
          studentCount: department.studentCount + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing student count:', error);
      throw new Error(`Failed to increment student count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async decrementStudentCount(departmentId: string): Promise<void> {
    try {
      const department = await this.getDepartmentById(departmentId);
      if (department && department.studentCount > 0) {
        await this.updateDepartment(departmentId, {
          studentCount: department.studentCount - 1
        });
      }
    } catch (error) {
      console.error('Error decrementing student count:', error);
      throw new Error(`Failed to decrement student count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}