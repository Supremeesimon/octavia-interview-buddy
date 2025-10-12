import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  Calendar, 
  MessageSquare, 
  Filter,
  Clock,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { useStudentMessages } from '@/hooks/use-messaging';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { MessagingService } from '@/services/messaging.service';
import { format } from 'date-fns';

const StudentMessageInbox = () => {
  const { user } = useFirebaseAuth();
  const { messages, loading, error } = useStudentMessages(
    user?.id || '', 
    user?.institutionId || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [openedMessages, setOpenedMessages] = useState<Set<string>>(new Set());
  const viewedMessagesRef = useRef<Set<string>>(new Set());

  // Filter messages based on search and type
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || message.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Track message open
  const trackMessageOpen = async (messageId: string) => {
    if (user?.id && !openedMessages.has(messageId)) {
      try {
        await MessagingService.trackMessageOpen(messageId, user.id);
        setOpenedMessages(prev => new Set(prev).add(messageId));
      } catch (error) {
        console.error('Error tracking message open:', error);
      }
    }
  };
  
  // Track message views (when messages are displayed)
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      // Track all currently displayed messages
      filteredMessages.forEach(message => {
        if (!viewedMessagesRef.current.has(message.id)) {
          viewedMessagesRef.current.add(message.id);
          trackMessageOpen(message.id);
        }
      });
    }
  }, [filteredMessages, user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading messages: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-muted-foreground">View announcements and updates from your institution</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search messages..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filterType === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button 
            variant={filterType === 'Announcement' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('Announcement')}
          >
            Announcements
          </Button>
          <Button 
            variant={filterType === 'Event' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('Event')}
          >
            Events
          </Button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'No messages match your search.' : 'You have no messages at this time.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{message.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={message.type === 'Announcement' ? 'default' : 
                                message.type === 'Event' ? 'secondary' : 
                                'outline'}
                      >
                        {message.type}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(message.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">{message.content}</p>
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
                  <span>From: {message.target}</span>
                  {message.openRate !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {message.openRate}% opened
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMessageInbox;