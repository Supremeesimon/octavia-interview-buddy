import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Book, 
  Lightbulb, 
  Edit, 
  Trash2,
  Building,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { ResourceService } from '@/services/resource.service';
import { Resource } from '@/types';

const ResourceManagement = ({ 
  institutionCount = 0, 
  totalResources = 0,
  institutions = []
}: { 
  institutionCount?: number; 
  totalResources?: number;
  institutions?: { id: string; name: string }[];
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceType, setResourceType] = useState('Questions');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Refs for form elements
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const questionsRef = useRef<HTMLTextAreaElement>(null);
  const guideContentRef = useRef<HTMLTextAreaElement>(null);
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const videoTranscriptRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch resources from the database
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const resourcesData = await ResourceService.getAllResources();
        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error",
          description: "Failed to load resources.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, []);
  
  const filteredResources = resources.filter(
    resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddResource = async () => {
    console.log('=== handleAddResource START ===');
    try {
      // Get form data from refs
      const title = titleRef.current?.value || '';
      const description = descriptionRef.current?.value || '';
      
      console.log('Form data retrieved:', { title, description, resourceType });
      
      if (!title.trim()) {
        console.log('Title is empty, showing error toast');
        toast({
          title: "Error",
          description: "Please enter a title for the resource.",
          variant: "destructive",
        });
        return;
      }
      
      // Get content based on resource type
      let content = '';
      let url = '';
      let transcript = '';
      
      console.log('Getting content for resource type:', resourceType);
      
      switch (resourceType) {
        case 'Questions':
          content = questionsRef.current?.value || '';
          console.log('Questions content:', content);
          break;
        case 'Guide':
          content = guideContentRef.current?.value || '';
          console.log('Guide content:', content);
          break;
        case 'Video':
          url = videoUrlRef.current?.value || '';
          transcript = videoTranscriptRef.current?.value || '';
          console.log('Video content:', { url, transcript });
          break;
        default:
          console.log('Unknown resource type:', resourceType);
      }
      
      // Create resource object
      const newResource: Omit<Resource, 'id'> = {
        title,
        description,
        type: resourceType as 'Questions' | 'Guide' | 'Video',
        institutions: ['All'], // Default to all institutions
        dateCreated: new Date().toISOString().split('T')[0],
        content,
        url,
        transcript
      };
      
      console.log('Creating resource object:', newResource);
      
      // Save to database
      console.log('Calling ResourceService.createResource...');
      const resourceId = await ResourceService.createResource(newResource);
      console.log('Resource created with ID:', resourceId);
      
      toast({
        title: "Resource Added",
        description: "The new resource has been successfully added.",
      });
      
      // Refresh resources
      console.log('Refreshing resources...');
      const updatedResources = await ResourceService.getAllResources();
      console.log('Updated resources count:', updatedResources.length);
      setResources(updatedResources);
      
      // Reset form
      console.log('Resetting form fields...');
      if (titleRef.current) titleRef.current.value = '';
      if (descriptionRef.current) descriptionRef.current.value = '';
      if (questionsRef.current) questionsRef.current.value = '';
      if (guideContentRef.current) guideContentRef.current.value = '';
      if (videoUrlRef.current) videoUrlRef.current.value = '';
      if (videoTranscriptRef.current) videoTranscriptRef.current.value = '';
      
      setShowAddDialog(false);
      console.log('=== handleAddResource END ===');
    } catch (error) {
      console.error('=== ERROR in handleAddResource ===', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      toast({
        title: "Error",
        description: `Failed to add resource: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateResource = async () => {
    try {
      if (!selectedResource) return;
      
      // Get form data from refs
      const title = titleRef.current?.value || '';
      const description = descriptionRef.current?.value || '';
      
      if (!title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title for the resource.",
          variant: "destructive",
        });
        return;
      }
      
      // Get content based on resource type
      let content = '';
      let url = '';
      let transcript = '';
      
      switch (resourceType) {
        case 'Questions':
          content = questionsRef.current?.value || '';
          break;
        case 'Guide':
          content = guideContentRef.current?.value || '';
          break;
        case 'Video':
          url = videoUrlRef.current?.value || '';
          transcript = videoTranscriptRef.current?.value || '';
          break;
      }
      
      // Update resource object
      const updatedResource: Partial<Resource> = {
        title,
        description,
        type: resourceType as 'Questions' | 'Guide' | 'Video',
        content,
        url,
        transcript
      };
      
      // Update in database
      await ResourceService.updateResource(selectedResource.id, updatedResource);
      
      toast({
        title: "Resource Updated",
        description: "The resource has been successfully updated.",
      });
      
      // Refresh resources
      const updatedResources = await ResourceService.getAllResources();
      setResources(updatedResources);
      
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAssignResource = async () => {
    try {
      if (!selectedResource) return;
      
      // Get selected institutions from checkboxes
      const selectedInstitutionIds: string[] = [];
      institutions.forEach(institution => {
        const checkbox = document.getElementById(`institution-${institution.id}`) as HTMLInputElement;
        if (checkbox && checkbox.checked) {
          selectedInstitutionIds.push(institution.id);
        }
      });
      
      // Check if "All Institutions" checkbox is selected
      const allInstitutionsCheckbox = document.getElementById('all-institutions') as HTMLInputElement;
      if (allInstitutionsCheckbox && allInstitutionsCheckbox.checked) {
        // Assign to all institutions
        await ResourceService.assignResourceToInstitutions(selectedResource.id, ['All']);
      } else {
        // Assign to selected institutions
        await ResourceService.assignResourceToInstitutions(selectedResource.id, selectedInstitutionIds);
      }
      
      toast({
        title: "Resource Assigned",
        description: "The resource has been successfully assigned to institutions.",
      });
      
      // Refresh resources
      const updatedResources = await ResourceService.getAllResources();
      setResources(updatedResources);
      
      setShowAssignDialog(false);
    } catch (error) {
      console.error('Error assigning resource:', error);
      toast({
        title: "Error",
        description: "Failed to assign resource. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteResource = async () => {
    try {
      if (!resourceToDelete) return;
      
      // Delete from database
      await ResourceService.deleteResource(resourceToDelete.id);
      
      toast({
        title: "Resource Deleted",
        description: "The resource has been successfully deleted.",
      });
      
      // Refresh resources
      const updatedResources = await ResourceService.getAllResources();
      setResources(updatedResources);
      
      setShowDeleteDialog(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setResourceType(resource.type);
    setShowAddDialog(true);
  };
  
  const confirmDeleteResource = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteDialog(true);
  };
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Questions':
        return <FileText className="h-4 w-4" />;
      case 'Video':
        return <Video className="h-4 w-4" />;
      case 'Guide':
        return <Book className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Contextual Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Institutions</p>
                <p className="text-2xl font-bold">{institutionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <Book className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform Status</p>
                <p className="text-lg font-bold">
                  {institutionCount === 0 ? 'Setup Required' : 'Active'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform Status Guidance */}
      {institutionCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800">Platform Setup Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Add institutions to the platform before assigning resources. 
                  Navigate to Institution Management to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Resource Management</h2>
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'flex-row gap-4'}`}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              className={`pl-8 ${isMobile ? 'w-full' : 'w-[250px]'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => {
            setSelectedResource(null);
            setShowAddDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Institutions</TableHead>
                    <TableHead className="hidden md:table-cell">Date Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No resources found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <span>{resource.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {resource.description}
                        </TableCell>
                        <TableCell>
                          {resource.institutions[0] === 'All' ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">All Institutions</span>
                          ) : (
                            <span>{resource.institutions.length} institutions</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{resource.dateCreated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedResource(resource);
                                setShowAssignDialog(true);
                              }}
                            >
                              <Building className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditResource(resource)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => confirmDeleteResource(resource)}
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
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Resource Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
            <DialogDescription>
              {selectedResource ? 'Update the details for this resource.' : 'Create a new resource to share with institutions.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs 
            defaultValue={selectedResource ? selectedResource.type : "Questions"}
            value={resourceType}
            onValueChange={setResourceType}
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="Questions">
                <FileText className="mr-2 h-4 w-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="Guide">
                <Book className="mr-2 h-4 w-4" />
                Guide
              </TabsTrigger>
              <TabsTrigger value="Video">
                <Video className="mr-2 h-4 w-4" />
                Video
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  placeholder="Enter resource title"
                  defaultValue={selectedResource?.title || ''}
                  ref={titleRef}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  placeholder="Enter resource description"
                  defaultValue={selectedResource?.description || ''}
                  rows={3}
                  ref={descriptionRef}
                />
              </div>
              
              <TabsContent value="Questions" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <label htmlFor="questions" className="text-sm font-medium">Questions</label>
                  <Textarea
                    id="questions"
                    placeholder="Enter questions (one per line)"
                    rows={5}
                    defaultValue={selectedResource?.content || ''}
                    ref={questionsRef}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="Guide" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <label htmlFor="guide-content" className="text-sm font-medium">Guide Content</label>
                  <Textarea
                    id="guide-content"
                    placeholder="Enter guide content"
                    rows={5}
                    defaultValue={selectedResource?.content || ''}
                    ref={guideContentRef}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="guide-attachment" className="text-sm font-medium">Attachment (Optional)</label>
                  <Input
                    id="guide-attachment"
                    type="file"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="Video" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <label htmlFor="video-url" className="text-sm font-medium">Video URL</label>
                  <Input
                    id="video-url"
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    defaultValue={selectedResource?.url || ''}
                    ref={videoUrlRef}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="video-transcript" className="text-sm font-medium">Transcript (Optional)</label>
                  <Textarea
                    id="video-transcript"
                    placeholder="Enter video transcript"
                    rows={5}
                    defaultValue={selectedResource?.transcript || ''}
                    ref={videoTranscriptRef}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={(e) => {
              console.log('Add Resource button clicked', { selectedResource, resourceType });
              e.preventDefault();
              if (selectedResource) {
                handleUpdateResource();
              } else {
                handleAddResource();
              }
            }}>
              {selectedResource ? 'Save Changes' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Resource Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Resource to Institutions</DialogTitle>
            <DialogDescription>
              {selectedResource ? 
                `Choose which institutions can access "${selectedResource.title}".` : 
                'Select institutions for this resource.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="all-institutions"
                className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="all-institutions" className="ml-2 text-sm font-medium">
                All Institutions
              </label>
            </div>
            
            <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
              {institutions.map((institution) => (
                <div key={institution.id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`institution-${institution.id}`}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                    defaultChecked={selectedResource?.institutions.includes(institution.name)}
                  />
                  <label htmlFor={`institution-${institution.id}`} className="ml-2 text-sm">
                    {institution.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignResource}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the resource "{resourceToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteResource}>
              Delete Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceManagement;
