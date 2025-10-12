import { 
  collection, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message, MessageTemplate, BroadcastHistory } from '@/types';

export class MessagingService {
  private static readonly MESSAGES_COLLECTION = 'messages';
  private static readonly TEMPLATES_COLLECTION = 'message_templates';
  private static readonly BROADCAST_HISTORY_COLLECTION = 'broadcast_history';

  // Message CRUD Operations
  static async getAllMessages(): Promise<Message[]> {
    try {
      console.log('Fetching all messages from Firebase...');
      
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const q = query(
        collection(db, this.MESSAGES_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log('Found', querySnapshot.size, 'messages');
      
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dateCreated: data.dateCreated || new Date().toISOString().split('T')[0]
        } as Message;
      });
      
      console.log('Returning', messages.length, 'messages');
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  static async createMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating message in Firebase:', message);
      
      if (!db) {
        console.error('Firebase not initialized');
        throw new Error('Firebase not initialized');
      }

      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, this.MESSAGES_COLLECTION), {
        ...message,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      console.log('Message created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating message:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw new Error(`Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateMessage(id: string, message: Partial<Message>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const messageRef = doc(db, this.MESSAGES_COLLECTION, id);
      const updatedMessage = {
        ...message,
        updatedAt: Timestamp.now()
      };
      await updateDoc(messageRef, updatedMessage);
      console.log('Message updated successfully with ID:', id);
    } catch (error) {
      console.error('Error updating message:', error);
      throw new Error('Failed to update message');
    }
  }

  static async deleteMessage(id: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const messageRef = doc(db, this.MESSAGES_COLLECTION, id);
      await deleteDoc(messageRef);
      console.log('Message deleted successfully with ID:', id);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  // Template CRUD Operations
  static async getAllTemplates(): Promise<MessageTemplate[]> {
    try {
      console.log('Fetching all templates from Firebase...');
      
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const q = query(
        collection(db, this.TEMPLATES_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log('Found', querySnapshot.size, 'templates');
      
      const templates = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MessageTemplate;
      });
      
      console.log('Returning', templates.length, 'templates');
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  static async createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating template in Firebase:', template);
      
      if (!db) {
        console.error('Firebase not initialized');
        throw new Error('Firebase not initialized');
      }

      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, this.TEMPLATES_COLLECTION), {
        ...template,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      console.log('Template created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateTemplate(id: string, template: Partial<MessageTemplate>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const templateRef = doc(db, this.TEMPLATES_COLLECTION, id);
      const updatedTemplate = {
        ...template,
        updatedAt: Timestamp.now()
      };
      await updateDoc(templateRef, updatedTemplate);
      console.log('Template updated successfully with ID:', id);
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const templateRef = doc(db, this.TEMPLATES_COLLECTION, id);
      await deleteDoc(templateRef);
      console.log('Template deleted successfully with ID:', id);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  // Broadcast History Operations
  static async getAllBroadcastHistory(): Promise<BroadcastHistory[]> {
    try {
      console.log('Fetching all broadcast history from Firebase...');
      
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const q = query(
        collection(db, this.BROADCAST_HISTORY_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log('Found', querySnapshot.size, 'broadcast history records');
      
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || new Date()
        } as BroadcastHistory;
      });
      
      console.log('Returning', history.length, 'broadcast history records');
      return history;
    } catch (error) {
      console.error('Error fetching broadcast history:', error);
      throw new Error('Failed to fetch broadcast history');
    }
  }

  static async createBroadcastHistory(history: Omit<BroadcastHistory, 'id' | 'createdAt' | 'completedAt'>): Promise<string> {
    try {
      console.log('Creating broadcast history in Firebase:', history);
      
      if (!db) {
        console.error('Firebase not initialized');
        throw new Error('Firebase not initialized');
      }

      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, this.BROADCAST_HISTORY_COLLECTION), {
        ...history,
        createdAt: timestamp,
        completedAt: timestamp
      });
      
      console.log('Broadcast history created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating broadcast history:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw new Error(`Failed to create broadcast history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getMessagesByStatus(status: Message['status']): Promise<Message[]> {
    try {
      console.log('Fetching messages by status from Firebase:', status);
      
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const q = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log('Found', querySnapshot.size, 'messages with status:', status);
      
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dateCreated: data.dateCreated || new Date().toISOString().split('T')[0]
        } as Message;
      });
      
      console.log('Returning', messages.length, 'messages with status:', status);
      return messages;
    } catch (error) {
      console.error('Error fetching messages by status:', error);
      throw new Error('Failed to fetch messages by status');
    }
  }

  // Track message open
  static async trackMessageOpen(messageId: string, userId: string): Promise<void> {
    try {
      console.log('Tracking message open in Firebase:', messageId, userId);
      
      if (!db) {
        console.warn('Firebase not initialized');
        return;
      }

      const messageRef = doc(db, this.MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const openedBy = data.openedBy || [];
        
        // Only add user ID if not already in the list
        if (!openedBy.includes(userId)) {
          openedBy.push(userId);
          
          // Calculate open rate (simplified)
          const openRate = Math.min(100, Math.round((openedBy.length / 100) * 100));
          
          await updateDoc(messageRef, {
            openedBy,
            openRate,
            updatedAt: Timestamp.now()
          });
          
          console.log('Message open tracked successfully:', messageId);
        }
      }
    } catch (error) {
      console.error('Error tracking message open:', error);
    }
  }

  // Search messages by title or content
  static async searchMessages(queryText: string): Promise<Message[]> {
    try {
      console.log('Searching messages in Firebase:', queryText);
      
      if (!db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const allMessages = await this.getAllMessages();
      
      const filteredMessages = allMessages.filter(message => 
        message.title.toLowerCase().includes(queryText.toLowerCase()) ||
        message.content.toLowerCase().includes(queryText.toLowerCase())
      );
      
      console.log('Found', filteredMessages.length, 'messages matching query:', queryText);
      return filteredMessages;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  // Get message analytics
  static async getMessageAnalytics(): Promise<any> {
    try {
      console.log('Fetching message analytics from Firebase');
      
      if (!db) {
        console.warn('Firebase not initialized');
        return {};
      }

      const messages = await this.getAllMessages();
      
      // Calculate analytics
      const totalMessages = messages.length;
      const sentMessages = messages.filter(m => m.status === 'Sent').length;
      const scheduledMessages = messages.filter(m => m.status === 'Scheduled').length;
      const draftMessages = messages.filter(m => m.status === 'Draft').length;
      
      // Calculate delivery rates (simplified)
      const deliveryRate = totalMessages > 0 ? (sentMessages / totalMessages) * 100 : 0;
      
      // Message type distribution
      const typeDistribution = {
        Announcement: messages.filter(m => m.type === 'Announcement').length,
        Event: messages.filter(m => m.type === 'Event').length,
        System: messages.filter(m => m.type === 'System').length,
        'Product Update': messages.filter(m => m.type === 'Product Update').length,
        Engagement: messages.filter(m => m.type === 'Engagement').length
      };
      
      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentMessages = messages.filter(m => 
        m.createdAt >= thirtyDaysAgo
      );
      
      const analytics = {
        totalMessages,
        sentMessages,
        scheduledMessages,
        draftMessages,
        deliveryRate,
        typeDistribution,
        recentMessages: recentMessages.length
      };
      
      console.log('Message analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching message analytics:', error);
      throw new Error('Failed to fetch message analytics');
    }
  }
}