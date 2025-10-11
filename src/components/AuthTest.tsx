import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { Button } from '@/components/ui/button';

const AuthTest: React.FC = () => {
  const { user: customUser, isAuthenticated: isCustomAuthenticated } = useAuth();
  const { user: firebaseUser, isAuthenticated: isFirebaseAuthenticated } = useFirebaseAuth();
  
  console.log('Auth Test Component:', {
    customUser,
    isCustomAuthenticated,
    firebaseUser,
    isFirebaseAuthenticated
  });
  
  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h2 className="text-lg font-bold mb-2">Authentication Test</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Custom Auth</h3>
          <p>User: {customUser ? customUser.name : 'Not logged in'}</p>
          <p>Authenticated: {isCustomAuthenticated ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <h3 className="font-medium">Firebase Auth</h3>
          <p>User: {firebaseUser ? firebaseUser.name : 'Not logged in'}</p>
          <p>Authenticated: {isFirebaseAuthenticated ? 'Yes' : 'No'}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          This component helps debug authentication state issues.
        </p>
      </div>
    </div>
  );
};

export default AuthTest;