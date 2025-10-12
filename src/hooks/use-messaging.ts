import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message } from '@/types';

export const useStudentMessages = (userId: string, institutionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !institutionId || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Query for messages targeted to this student or their institution
      const messagesQuery = query(
        collection(db, 'messages'),
        where('status', '==', 'Sent'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        try {
          const studentMessages = snapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                dateCreated: data.dateCreated || new Date().toISOString().split('T')[0]
              } as Message;
            })
            .filter(message => {
              // Filter messages targeted to this student's institution or all students
              return message.target === 'All Students' || 
                     message.target === 'All Institutions' ||
                     message.target.includes(institutionId);
            });

          setMessages(studentMessages);
          setLoading(false);
        } catch (err) {
          console.error('Error processing messages:', err);
          setError('Failed to process messages');
          setLoading(false);
        }
      }, (err) => {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError('Failed to set up messages listener');
      setLoading(false);
    }
  }, [userId, institutionId]);

  return { messages, loading, error };
};