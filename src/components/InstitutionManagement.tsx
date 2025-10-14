import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  UserPlus, 
  ChevronDown, 
  Filter,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { InstitutionService } from '@/services/institution.service';
import { Institution } from '@/types';

const InstitutionManagement = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch real institution data
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await InstitutionService.getAllInstitutions();
        setInstitutions(data);
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutions();
  }, []);
  
  // Convert institutions to the format expected by the component
  const formattedInstitutions = institutions.map(inst => ({
    id: inst.id,
    name: inst.name,
    adminName: inst.platform_admin_id || 'Not assigned', // Placeholder
    adminEmail: inst.platform_admin_id ? `${inst.platform_admin_id}@example.com` : 'Not assigned', // Placeholder
    studentsCount: inst.stats?.totalStudents || 0,
    plan: inst.settings?.allowedBookingsPerMonth ? 
      inst.settings.allowedBookingsPerMonth > 1000 ? 'Enterprise' : 
      inst.settings.allowedBookingsPerMonth > 500 ? 'Scale' : 
      inst.settings.allowedBookingsPerMonth > 100 ? 'Ship' : 'Build' : 'Build',
    status: inst.isActive ? 'Active' : 'Inactive'
  }));
  
  const filteredInstitutions = formattedInstitutions.filter(
    institution => institution.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddInstitution = () => {
    setShowAddDialog(false);
    // Handle add institution logic
  };
  
  const handleAssignAdmin = () => {
    setShowAssignDialog(false);
    // Handle assign admin logic
  };
  
  const handleGenerateLink = (institution: any) => {
    setSelectedInstitution(institution);
    // Generate a custom signup link for the institution with a secure token
    const token = institution.customSignupToken || institution.id;
    const link = `${window.location.origin}/signup-institution/${token}`;
    setGeneratedLink(link);
    setShowLinkDialog(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleEditInstitution = (institution: any) => {
    setSelectedInstitution(institution);
    setShowAddDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Institution Management</h2>
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'flex-row gap-4'}`}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search institutions..."
              className={`pl-8 ${isMobile ? 'w-full' : 'w-[250px]'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => setShowAddDialog(true)}
            tooltip="Add a new institution"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Institution
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading institutions...
                    </TableCell>
                  </TableRow>
                ) : filteredInstitutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No institutions found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstitutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell className="font-medium">{institution.name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{institution.adminName}</div>
                          <div className="text-xs text-muted-foreground">{institution.adminEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{institution.studentsCount}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${institution.plan === 'Enterprise' ? 'bg-blue-100 text-blue-800' : 
                            institution.plan === 'Scale' ? 'bg-purple-100 text-purple-800' : 
                            institution.plan === 'Ship' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`
                        }>
                          {institution.plan}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${institution.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
                        }>
                          {institution.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            tooltip={`Generate signup link for ${institution.name}`}
                            onClick={() => handleGenerateLink(institution)}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            tooltip={`Assign admin to ${institution.name}`}
                            onClick={() => {
                              setSelectedInstitution(institution);
                              setShowAssignDialog(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            tooltip={`Edit ${institution.name}`}
                            onClick={() => handleEditInstitution(institution)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            tooltip={`Delete ${institution.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Institution Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedInstitution ? 'Edit Institution' : 'Add New Institution'}</DialogTitle>
            <DialogDescription>
              {selectedInstitution ? 'Update the details for this institution.' : 'Fill in the details to add a new institution to the platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
              <Input
                id="name"
                defaultValue={selectedInstitution?.name || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminName" className="text-right text-sm font-medium">Admin Name</label>
              <Input
                id="adminName"
                defaultValue={selectedInstitution?.adminName || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminEmail" className="text-right text-sm font-medium">Admin Email</label>
              <Input
                id="adminEmail"
                defaultValue={selectedInstitution?.adminEmail || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="plan" className="text-right text-sm font-medium">Plan</label>
              <select 
                id="plan" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={selectedInstitution?.plan || 'Build'}
              >
                <option value="Build">Build</option>
                <option value="Ship">Ship</option>
                <option value="Scale">Scale</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">Status</label>
              <select 
                id="status" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={selectedInstitution?.status || 'Active'}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              tooltip="Discard changes"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              tooltip={selectedInstitution ? "Save institution changes" : "Add new institution"}
              onClick={handleAddInstitution}
            >
              {selectedInstitution ? 'Save Changes' : 'Add Institution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Admin Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Institution Administrator</DialogTitle>
            <DialogDescription>
              {selectedInstitution ? 
                `Assign or change the administrator for ${selectedInstitution.name}.` : 
                'Assign an administrator to this institution.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminName" className="text-right text-sm font-medium">Name</label>
              <Input
                id="adminName"
                defaultValue={selectedInstitution?.adminName || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminEmail" className="text-right text-sm font-medium">Email</label>
              <Input
                id="adminEmail"
                defaultValue={selectedInstitution?.adminEmail || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="permission" className="text-right text-sm font-medium">Permissions</label>
              <select 
                id="permission" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="Full"
              >
                <option value="Full">Full Admin Access</option>
                <option value="ReadOnly">Read Only</option>
                <option value="Limited">Limited Access</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              tooltip="Discard changes"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              tooltip="Assign administrator to institution"
              onClick={handleAssignAdmin}
            >
              Assign Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Custom Signup Link</DialogTitle>
            <DialogDescription>
              {selectedInstitution ? 
                `Share this link with ${selectedInstitution.name} for easy signup.` : 
                'Share this link for easy signup.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="flex-1"
              />
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                tooltip="Copy link to clipboard"
              >
                {copied ? <span className="text-green-500">Copied!</span> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This link will automatically assign users to {selectedInstitution?.name} when they sign up.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              tooltip="Close dialog"
              onClick={() => setShowLinkDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionManagement;