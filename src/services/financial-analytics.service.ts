import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FinancialMarginData } from '@/types';

export class FinancialAnalyticsService {
  private static readonly COLLECTION_NAME = 'financial_analytics';

  static async getRecentMarginData(limitCount: number = 30): Promise<FinancialMarginData[]> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning empty array');
        return [];
      }
      
      // Query for the most recent margin data
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date?.toDate ? data.date.toDate() : data.date || new Date(),
          period: data.period,
          vapiCostPerMinute: data.vapiCostPerMinute,
          markupPercentage: data.markupPercentage,
          averageSessionLength: data.averageSessionLength,
          totalSessions: data.totalSessions,
          totalRevenue: data.totalRevenue,
          totalCost: data.totalCost,
          totalProfit: data.totalProfit,
          marginPercentage: data.marginPercentage,
          licenseRevenue: data.licenseRevenue,
          sessionRevenue: data.sessionRevenue,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date()
        } as FinancialMarginData;
      });
    } catch (error) {
      console.error('Error fetching recent margin data:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async getMarginDataByDateRange(startDate: Date, endDate: Date): Promise<FinancialMarginData[]> {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firebase not initialized, returning empty array');
        return [];
      }
      
      // Query for margin data within the date range
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date?.toDate ? data.date.toDate() : data.date || new Date(),
          period: data.period,
          vapiCostPerMinute: data.vapiCostPerMinute,
          markupPercentage: data.markupPercentage,
          averageSessionLength: data.averageSessionLength,
          totalSessions: data.totalSessions,
          totalRevenue: data.totalRevenue,
          totalCost: data.totalCost,
          totalProfit: data.totalProfit,
          marginPercentage: data.marginPercentage,
          licenseRevenue: data.licenseRevenue,
          sessionRevenue: data.sessionRevenue,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date()
        } as FinancialMarginData;
      });
    } catch (error) {
      console.error('Error fetching margin data by date range:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async getLatestMarginData(): Promise<FinancialMarginData | null> {
    try {
      const recentData = await this.getRecentMarginData(1);
      return recentData.length > 0 ? recentData[0] : null;
    } catch (error) {
      console.error('Error fetching latest margin data:', error);
      return null;
    }
  }
}