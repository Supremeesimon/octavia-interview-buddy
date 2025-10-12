import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

const TestAuthPage = () => {
  const [user, setUser] = useState<any>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const idTokenResult = await getIdTokenResult(user);
          setClaims(idTokenResult.claims);
        } catch (error) {
          console.error('Error getting ID token:', error);
        }
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">User Information</h2>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Display Name:</strong> {user.displayName}</p>
          </div>
          
          {claims && (
            <div>
              <h2 className="text-xl font-semibold">Custom Claims</h2>
              <p><strong>Role:</strong> {claims.role || 'Not set'}</p>
              <p><strong>Admin:</strong> {claims.admin ? 'Yes' : 'No'}</p>
            </div>
          )}
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({ user, claims }, null, 2));
              alert('User info copied to clipboard');
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Copy User Info
          </button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
        </div>
      )}
    </div>
  );
};

export default TestAuthPage;