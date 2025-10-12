import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

// Mock data for institutions
const mockInstitutions = [
  { id: '1', name: 'Harvard University' },
  { id: '2', name: 'Stanford University' },
  { id: '3', name: 'MIT' },
  { id: '4', name: 'Yale University' },
  { id: '5', name: 'Princeton University' }
];

// Mock data for templates
const mockTemplates = [
  { 
    id: 1, 
    title: 'Welcome Message', 
    description: 'Sent to new users upon registration',
    content: 'Welcome to Octavia AI! We\'re excited to have you join our platform. Let\'s get started with your first interview...'
  },
  { 
    id: 2, 
    title: 'Interview Reminder', 
    description: 'Sent 24 hours before scheduled interview',
    content: 'Your interview is scheduled for tomorrow. Here are some tips to help you prepare and make the most of your session...'
  }
];

const BroadcastSystem = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('messages');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>(mockTemplates);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messageToDelete, setMessageToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Form refs
  const messageTitleRef = React.useRef<HTMLInputElement>(null);
  const messageTypeRef = React.useRef<HTMLSelectElement>(null);
  const messageContentRef = React.useRef<HTMLTextAreaElement>(null);
  const scheduleDateRef = React.useRef<HTMLInputElement>(null);
  const scheduleTimeRef = React.useRef<HTMLInputElement>(time);
  
  // Fetch messages (simulating API call)
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        
        setMessages(mockMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);
  
  const handleComposeMessage = async () => {
    setSending(true);
    try {
      // Get form data
      const title = messageTitleRef.current?.value || '';
      const type = messageTypeRef.current?.value || 'Announcement';
      const content = messageContentRef.current?.value || '';
      const scheduleDate = scheduleDateRef.current?.value || '';
      const scheduleTime = scheduleTimeRef.current?.value || '';
      
      if (!title.trim() || !content.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setSending(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new message to state
      const newMessage = {
        id: messages.length + 1,
        title,
        type,
        target: 'All Institutions', // This would be dynamic in a real app
        status: scheduleDate ? 'Scheduled' : 'Sent',
        date: scheduleDate || new Date().toISOString().split('T')[0],
        deliveryRate: scheduleDate ? null : 100
      };
      
      setMessages([newMessage, ...messages]);
      
      toast({
        title: "Message Sent",
        description: "Your message has been successfully sent.",
      });
      
      setShowComposeDialog(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleEditMessage = (message: any) => {
    setSelectedMessage(message);
    setShowEditDialog(true);
  };
  
  const handleSaveEditedMessage = async () => {
    setSaving(true);
    try {
      // Get form data
      const title = document.getElementById('edit-message-title') as HTMLInputElement;
      const type = document.getElementById('edit-message-type') as HTMLSelectElement;
      const content = document.getElementById('edit-message-content') as HTMLTextAreaElement;
      
      if (!title?.value.trim() || !content?.value.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update message in state
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { 
              ...msg, 
              title: title.value,
              type: type.value,
              // In a real app, you would update other fields as well
            } 
          : msg
      );
      
      setMessages(updatedMessages);
      setSelectedMessage(null);
      
      toast({
        title: "Message Updated",
        description: "Your message has been successfully updated.",
      });
      
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const confirmDeleteMessage = (message: any) => {
    setMessageToDelete(message);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteMessage = async () => {
    setDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove message from state
      const updatedMessages = messages.filter(msg => msg.id !== messageToDelete.id);
      setMessages(updatedMessages);
      setMessageToDelete(null);
      
      toast({
        title: "Message Deleted",
        description: "The message has been successfully deleted.",
      });
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  const handleCreateTemplate = () => {
    setShowTemplateDialog(true);
  };
  
  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      // Get form data
      const title = document.getElementById('template-title') as HTMLInputElement;
      const description = document.getElementById('template-description') as HTMLInputElement;
      const content = document.getElementById('template-content') as HTMLTextAreaElement;
      
      if (!title?.value.trim() || !content?.value.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new template to state
      const newTemplate = {
        id: templates.length + 1,
        title: title.value,
        description: description?.value || '',
        content: content.value
      };
      
      setTemplates([...templates, newTemplate]);
      
      toast({
        title: "Template Saved",
        description: "Your template has been successfully saved.",
      });
      
      setShowTemplateDialog(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleEditTemplate = (template: any) => {
    // In a real implementation, this would open an edit dialog for the template
    toast({
      title: "Edit Template",
      description: "Template editing functionality would be implemented here.",
    });
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
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
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
                      {messages.map((message) => (
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
                                message.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                'bg-blue-100 text-blue-800'}`
                            }>
                              {message.status === 'Sent' && <CheckCircle2 className="h-3 w-3" />}
                              {message.status === 'Scheduled' && <Clock className="h-3 w-3" />}
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => confirmDeleteMessage(message)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <CardTitle>{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                </CardContent>
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            
            <Card 
              className="relative border-dashed border-2 flex items-center justify-center h-[200px] cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleCreateTemplate}
            >
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
                {messages
                  .filter(msg => msg.status === 'Scheduled')
                  .map((message) => (
                    <div key={message.id} className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <h3 className="font-medium">{message.title}</h3>
                        <p className="text-sm text-muted-foreground">To: {message.target}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{message.date}</div>
                        <div className="text-xs text-muted-foreground">9:00 AM PST</div>
                      </div>
                    </div>
                  ))}
                
                {messages.filter(msg => msg.status === 'Scheduled').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No scheduled messages found.
                  </div>
                )}
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
                ref={messageTitleRef}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message-type" className="text-sm font-medium">Message Type</label>
              <select 
                id="message-type" 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                ref={messageTypeRef}
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
                    defaultChecked
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
                ref={messageContentRef}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schedule-message"
                  className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                  onChange={(e) => {
                    const dateInput = scheduleDateRef.current;
                    const timeInput = scheduleTimeRef.current;
                    if (dateInput && timeInput) {
                      dateInput.disabled = !e.target.checked;
                      timeInput.disabled = !e.target.checked;
                    }
                  }}
                />
                <label htmlFor="schedule-message" className="ml-2 text-sm">
                  Schedule for later
                </label>
              </div>
              
              <div className="space-x-2">
                <Input
                  type="date"
                  className="w-auto inline-flex"
                  ref={scheduleDateRef}
                  disabled
                />
                <Input
                  type="time"
                  className="w-auto inline-flex"
                  ref={scheduleTimeRef}
                  disabled
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleComposeMessage} disabled={sending}>
              {sending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Message Dialog */}
      {selectedMessage && (
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setSelectedMessage(null);
        }}>
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
                  defaultValue={selectedMessage.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl."}
                />
              </div>
              
              {selectedMessage.status === 'Scheduled' && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Scheduled for</label>
                  <div className="space-x-2">
                    <Input
                      type="date"
                      className="w-auto inline-flex"
                      defaultValue={selectedMessage.date || ""}
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
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditedMessage} disabled={saving}>
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  selectedMessage.status === 'Draft' || selectedMessage.status === 'Scheduled' ? (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {selectedMessage.status === 'Draft' ? 'Send Message' : 'Update Message'}
                    </>
                  ) : (
                    'Save Changes'
                  )
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) setMessageToDelete(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the message "{messageToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMessage} disabled={deleting}>
              {deleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                'Delete Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable message template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="template-title" className="text-sm font-medium">Template Title</label>
              <Input
                id="template-title"
                placeholder="Enter template title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="template-description" className="text-sm font-medium">Description</label>
              <Input
                id="template-description"
                placeholder="Enter template description"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="template-content" className="text-sm font-medium">Template Content</label>
              <Textarea
                id="template-content"
                placeholder="Enter template content..."
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BroadcastSystem;