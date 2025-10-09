import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const FirebaseTest: React.FC = () => {
  const [authState, setAuthState] = useState<string>('Checking...');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthState('Authenticated');
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        setAuthState('Not Authenticated');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h2 className="text-lg font-bold mb-2">Firebase Test Component</h2>
      <p><strong>Auth State:</strong> {authState}</p>
      {user && (
        <div>
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.displayName}</p>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;