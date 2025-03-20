
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Book, 
  Lightbulb, 
  Edit, 
  Trash2,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for resources
const mockResources = [
  { 
    id: 1, 
    title: 'Behavioral Interview Questions Set', 
    type: 'Questions',
    description: 'Standard behavioral questions for general interviews',
    institutions: ['All'],
    dateCreated: '2023-04-15'
  },
  { 
    id: 2, 
    title: 'Technical Interview Guide - Software Engineering', 
    type: 'Guide',
    description: 'Comprehensive guide for software engineering technical interviews',
    institutions: ['MIT', 'Stanford University'],
    dateCreated: '2023-04-18'
  },
  { 
    id: 3, 
    title: 'How to Answer Difficult Questions', 
    type: 'Video',
    description: 'Tutorial video on handling challenging interview questions',
    institutions: ['All'],
    dateCreated: '2023-04-22'
  },
  { 
    id: 4, 
    title: 'Healthcare Professional Interview Questions', 
    type: 'Questions',
    description: 'Specialized questions for medical and healthcare roles',
    institutions: ['Harvard University'],
    dateCreated: '2023-04-25'
  },
  { 
    id: 5, 
    title: 'Resume Building Workshop Materials', 
    type: 'Guide',
    description: 'Resources for helping students create effective resumes',
    institutions: ['Yale University', 'Princeton University'],
    dateCreated: '2023-04-28'
  },
];

// Mock data for institutions
const mockInstitutions = [
  'Harvard University',
  'Stanford University',
  'MIT',
  'Yale University',
  'Princeton University'
];

const ResourceManagement = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [resourceType, setResourceType] = useState('Questions');
  
  const filteredResources = mockResources.filter(
    resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddResource = () => {
    setShowAddDialog(false);
    // Handle add resource logic
  };
  
  const handleAssignResource = () => {
    setShowAssignDialog(false);
    // Handle assign resource logic
  };
  
  const handleEditResource = (resource: any) => {
    setSelectedResource(resource);
    setResourceType(resource.type);
    setShowAddDialog(true);
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
                          <Button size="sm" variant="outline">
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
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  placeholder="Enter resource description"
                  defaultValue={selectedResource?.description || ''}
                  rows={3}
                />
              </div>
              
              <TabsContent value="Questions" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <label htmlFor="questions" className="text-sm font-medium">Questions</label>
                  <Textarea
                    id="questions"
                    placeholder="Enter questions (one per line)"
                    rows={5}
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
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="video-transcript" className="text-sm font-medium">Transcript (Optional)</label>
                  <Textarea
                    id="video-transcript"
                    placeholder="Enter video transcript"
                    rows={5}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResource}>
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
              {mockInstitutions.map((institution, index) => (
                <div key={index} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`institution-${index}`}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                    defaultChecked={selectedResource?.institutions.includes(institution)}
                  />
                  <label htmlFor={`institution-${index}`} className="ml-2 text-sm">
                    {institution}
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
    </div>
  );
};

export default ResourceManagement;
