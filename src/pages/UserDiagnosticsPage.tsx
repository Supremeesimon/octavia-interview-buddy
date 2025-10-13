import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { firebaseAuthService } from '@/services/firebase-auth.service';

const UserDiagnosticsPage = () => {
  const { user, isLoading } = useFirebaseAuth();
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if user is platform admin
  const isPlatformAdmin = user?.role === 'platform_admin';

  const fetchDiagnostics = async () => {
    if (!isPlatformAdmin) {
      toast.error('Only platform admins can access this page');
      return;
    }

    setLoading(true);
    try {
      // Fetch all users from Firestore
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const firestoreUsersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFirestoreUsers(firestoreUsersData);
      
      // Fetch all institutions from Firestore
      const institutionsQuery = query(collection(db, 'institutions'));
      const institutionsSnapshot = await getDocs(institutionsQuery);
      const institutionsData = institutionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setInstitutions(institutionsData);
      toast.success(`Found ${firestoreUsersData.length} users and ${institutionsData.length} institutions`);
    } catch (error: any) {
      console.error('Error fetching diagnostics:', error);
      toast.error(`Failed to fetch diagnostics data: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDiagnostics = () => {
    setFirestoreUsers([]);
    setInstitutions([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Please log in to access this page</div>
      </div>
    );
  }

  if (user.role !== 'platform_admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              Only platform administrators can access the user diagnostics page.
            </p>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">User Diagnostics</h1>
          
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Diagnostic Tools</h2>
                <p className="text-muted-foreground">
                  Check Firebase Authentication and Firestore data
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={fetchDiagnostics} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Loading...' : 'Fetch User Data'}
                </Button>
                <Button 
                  onClick={clearDiagnostics}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {firestoreUsers.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Firestore Users ({firestoreUsers.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">ID</th>
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Email</th>
                      <th className="text-left py-2 px-2">Role</th>
                      <th className="text-left py-2 px-2">Department</th>
                      <th className="text-left py-2 px-2">Institution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firestoreUsers.map((firestoreUser) => (
                      <tr key={firestoreUser.id} className="border-b">
                        <td className="py-2 px-2 text-sm max-w-xs truncate" title={firestoreUser.id}>
                          {firestoreUser.id?.substring(0, 8)}...
                        </td>
                        <td className="py-2 px-2">{firestoreUser.name || 'N/A'}</td>
                        <td className="py-2 px-2">{firestoreUser.email || 'N/A'}</td>
                        <td className="py-2 px-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                            {firestoreUser.role || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2 px-2">{firestoreUser.department || 'N/A'}</td>
                        <td className="py-2 px-2 text-sm max-w-xs truncate" title={firestoreUser.institutionDomain}>
                          {firestoreUser.institutionDomain ? `${firestoreUser.institutionDomain.substring(0, 15)}...` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Users by Role Summary */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Users by Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(
                    firestoreUsers.reduce((acc: Record<string, number>, user) => {
                      const role = user.role || 'unknown';
                      acc[role] = (acc[role] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([role, count]) => (
                    <div key={role} className="bg-secondary p-3 rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm capitalize">{role.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Users by Institution Summary */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Users by Institution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(
                    firestoreUsers.reduce((acc: Record<string, number>, user) => {
                      const institution = user.institutionDomain || 'No Institution';
                      acc[institution] = (acc[institution] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([institution, count]) => (
                    <div key={institution} className="bg-secondary p-3 rounded-lg">
                      <div className="text-xl font-bold">{count}</div>
                      <div className="text-sm truncate" title={institution}>{institution}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Users by Department Summary */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Users by Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(
                    firestoreUsers.reduce((acc: Record<string, number>, user) => {
                      const department = user.department || 'No Department';
                      acc[department] = (acc[department] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([department, count]) => (
                    <div key={department} className="bg-secondary p-3 rounded-lg">
                      <div className="text-xl font-bold">{count}</div>
                      <div className="text-sm truncate" title={department}>{department}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {institutions.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Institutions ({institutions.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">ID</th>
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Domain</th>
                      <th className="text-left py-2 px-2">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map((institution) => (
                      <tr key={institution.id} className="border-b">
                        <td className="py-2 px-2 text-sm max-w-xs truncate" title={institution.id}>
                          {institution.id?.substring(0, 8)}...
                        </td>
                        <td className="py-2 px-2">{institution.name || 'N/A'}</td>
                        <td className="py-2 px-2">{institution.domain || 'N/A'}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${institution.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {institution.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {firestoreUsers.length === 0 && institutions.length === 0 && !loading && (
            <Card className="p-6 mb-6 text-center">
              <p className="text-muted-foreground">
                No data loaded. Click "Fetch User Data" to retrieve information from Firestore.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDiagnosticsPage;