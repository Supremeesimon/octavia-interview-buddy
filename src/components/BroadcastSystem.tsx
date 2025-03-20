
import React, { useState } from 'react';
import { 
  Send, 
  Bell, 
  Calendar, 
  MessageSquare, 
  Users, 
  Building, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for messages
const mockMessages = [
  { 
    id: 1, 
    title: 'End of Semester Interviews', 
    type: 'Announcement',
    target: 'All Institutions',
    status: 'Sent',
    date: '2023-05-10',
    deliveryRate: 98
  },
  { 
    id: 2, 
    title: 'New Feature: AI Feedback', 
    type: 'Product Update',
    target: 'Harvard University, MIT',
    status: 'Sent',
    date: '2023-05-08',
    deliveryRate: 97
  },
  { 
    id: 3, 
    title: 'Interview Week Coming Soon', 
    type: 'Event',
    target: 'Stanford University',
    status: 'Scheduled',
    date: '2023-05-15',
    deliveryRate: null
  },
  { 
    id: 4, 
    title: 'System Maintenance Notice', 
    type: 'System',
    target: 'All Institutions',
    status: 'Draft',
    date: null,
    deliveryRate: null
  },
  { 
    id: 5, 
    title: 'Inactive User Reminder', 
    type: 'Engagement',
    target: 'Inactive Users (45)',
    status: 'Sent',
    date: '2023-05-01',
    deliveryRate: 92
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

const BroadcastSystem = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('messages');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  const handleComposeMessage = () => {
    setShowComposeDialog(false);
    // Handle compose message logic
  };
  
  const handleEditMessage = (message: any) => {
    setSelectedMessage(message);
    setShowEditDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Broadcast & Messaging</h2>
        </div>
        
        <Button onClick={() => setShowComposeDialog(true)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Compose Message
        </Button>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} w-full max-w-md`}>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Bell className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="mr-2 h-4 w-4" />
            Scheduled
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">{message.title}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${message.type === 'Announcement' ? 'bg-blue-100 text-blue-800' : 
                              message.type === 'Event' ? 'bg-green-100 text-green-800' : 
                              message.type === 'System' ? 'bg-red-100 text-red-800' : 
                              message.type === 'Product Update' ? 'bg-purple-100 text-purple-800' : 
                              'bg-yellow-100 text-yellow-800'}`
                          }>
                            {message.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={message.target}>
                            {message.target}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${message.status === 'Sent' ? 'bg-green-100 text-green-800' : 
                              message.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`
                          }>
                            {message.status === 'Sent' && <CheckCircle2 className="h-3 w-3" />}
                            {message.status}
                          </div>
                        </TableCell>
                        <TableCell>{message.date || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditMessage(message)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-6`}>
            <Card className="relative">
              <CardHeader>
                <CardTitle>Welcome Message</CardTitle>
                <CardDescription>Sent to new users upon registration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Welcome to Octavia AI! We're excited to have you join our platform. Let's get started with your first interview...
                </p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            
            <Card className="relative">
              <CardHeader>
                <CardTitle>Interview Reminder</CardTitle>
                <CardDescription>Sent 24 hours before scheduled interview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your interview is scheduled for tomorrow. Here are some tips to help you prepare and make the most of your session...
                </p>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            
            <Card className="relative border-dashed border-2 flex items-center justify-center h-[200px] cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Create New Template</p>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Interview Week Reminder</h3>
                    <p className="text-sm text-muted-foreground">To: Stanford University</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">May 15, 2023</div>
                    <div className="text-xs text-muted-foreground">9:00 AM PST</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-medium">System Update Notification</h3>
                    <p className="text-sm text-muted-foreground">To: All Institutions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">May 20, 2023</div>
                    <div className="text-xs text-muted-foreground">11:30 PM PST</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-medium">End of Month Performance Reports</h3>
                    <p className="text-sm text-muted-foreground">To: Institution Admins</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">May 31, 2023</div>
                    <div className="text-xs text-muted-foreground">8:00 AM PST</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Create and send a message to users or institutions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="message-title" className="text-sm font-medium">Message Title</label>
              <Input
                id="message-title"
                placeholder="Enter message title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message-type" className="text-sm font-medium">Message Type</label>
              <select 
                id="message-type" 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Announcement">Announcement</option>
                <option value="Event">Event</option>
                <option value="System">System Update</option>
                <option value="Product Update">Product Update</option>
                <option value="Engagement">Engagement</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipients</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-institutions"
                    name="recipients"
                    className="h-4 w-4 border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="all-institutions" className="ml-2 flex items-center text-sm">
                    <Building className="mr-2 h-4 w-4" />
                    All Institutions
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="specific-institutions"
                    name="recipients"
                    className="h-4 w-4 border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="specific-institutions" className="ml-2 flex items-center text-sm">
                    <Building className="mr-2 h-4 w-4" />
                    Specific Institutions
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-students"
                    name="recipients"
                    className="h-4 w-4 border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="all-students" className="ml-2 flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    All Students
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="inactive-students"
                    name="recipients"
                    className="h-4 w-4 border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="inactive-students" className="ml-2 flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    Inactive Students (30+ days)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message-content" className="text-sm font-medium">Message Content</label>
              <Textarea
                id="message-content"
                placeholder="Enter your message here..."
                rows={6}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schedule-message"
                  className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="schedule-message" className="ml-2 text-sm">
                  Schedule for later
                </label>
              </div>
              
              <div className="space-x-2">
                <Input
                  type="date"
                  className="w-auto inline-flex"
                  disabled
                />
                <Input
                  type="time"
                  className="w-auto inline-flex"
                  disabled
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComposeMessage}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Message Dialog */}
      {selectedMessage && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
              <DialogDescription>
                Update the details of your message.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-message-title" className="text-sm font-medium">Message Title</label>
                <Input
                  id="edit-message-title"
                  defaultValue={selectedMessage.title}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-message-type" className="text-sm font-medium">Message Type</label>
                <select 
                  id="edit-message-type" 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={selectedMessage.type}
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Event">Event</option>
                  <option value="System">System Update</option>
                  <option value="Product Update">Product Update</option>
                  <option value="Engagement">Engagement</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-message-content" className="text-sm font-medium">Message Content</label>
                <Textarea
                  id="edit-message-content"
                  placeholder="Enter your message here..."
                  rows={6}
                  defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl."
                />
              </div>
              
              {selectedMessage.status === 'Scheduled' && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Scheduled for</label>
                  <div className="space-x-2">
                    <Input
                      type="date"
                      className="w-auto inline-flex"
                      defaultValue="2023-05-15"
                    />
                    <Input
                      type="time"
                      className="w-auto inline-flex"
                      defaultValue="09:00"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button>
                {selectedMessage.status === 'Draft' || selectedMessage.status === 'Scheduled' ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {selectedMessage.status === 'Draft' ? 'Send Message' : 'Update Message'}
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BroadcastSystem;
