'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, Plus, Search, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Static translations
const t = {
  'messages.title': 'Direct Messages',
  'messages.subtitle': 'Send and receive private messages with your colleagues',
  'messages.newMessage': 'New Message',
  'messages.searchUsers': 'Search users...',
  'messages.noConversations': 'No Messages Yet',
  'messages.noConversationsDesc': 'Start a conversation by clicking "New Message"',
  'messages.selectUser': 'Select a User',
  'messages.selectUserDesc': 'Choose someone to start a conversation with',
  'messages.startConversation': 'Start Conversation',
  'messages.lastMessage': 'Last message',
  'messages.online': 'Online',
  'messages.away': 'Away',
  'messages.offline': 'Offline',
  'common.loading': 'Loading...',
  'common.cancel': 'Cancel',
};

export default function MessagesPage() {
  const router = useRouter();
  const { conversations, loading } = useDirectMessages();
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const supabase = createClient();

  // Fetch all active users for potential conversations
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, full_name_ar, avatar_url, department, position, email')
        .eq('is_active', true);
      
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = allUsers.filter(user => 
    user && (
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleStartConversation = (userId: string) => {
    setIsNewMessageOpen(false);
    router.push(`/ar/messages/${userId}`);
  };

  const handleConversationClick = (userId: string) => {
    router.push(`/ar/messages/${userId}`);
  };

  const getLastMessagePreview = (message: any) => {
    if (!message) return '';
    
    if (message.content_type === 'image') {
      return '📷 Image';
    } else if (message.content_type === 'file') {
      return '📎 File';
    }
    
    return message.content.length > 50 
      ? message.content.substring(0, 50) + '...'
      : message.content;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">{t['common.loading']}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t['messages.title']}
          </h2>
          <p className="text-gray-600">
            {t['messages.subtitle']}
          </p>
        </div>
        
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="bg-hyhom-primary hover:bg-hyhom-dark">
              <Plus className="h-4 w-4 mr-2" />
              {t['messages.newMessage']}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t['messages.selectUser']}</DialogTitle>
              <DialogDescription>
                {t['messages.selectUserDesc']}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t['messages.searchUsers']}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user!.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStartConversation(user!.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user!.avatar_url || ''} />
                        <AvatarFallback>
                          {user!.full_name?.[0] || user!.full_name_ar?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {user!.full_name || user!.full_name_ar}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user!.position || user!.department}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t['messages.offline']}
                      </Badge>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                  {t['common.cancel']}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <MessageCircle className="h-6 w-6 text-hyhom-primary" />
              <span>{t['messages.noConversations']}</span>
            </CardTitle>
            <CardDescription>
              {t['messages.noConversationsDesc']}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Your messages will appear here</p>
              <Button 
                onClick={() => setIsNewMessageOpen(true)}
                className="bg-hyhom-primary hover:bg-hyhom-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t['messages.newMessage']}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.user.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleConversationClick(conversation.user.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.user.avatar_url || ''} />
                      <AvatarFallback>
                        {conversation.user.full_name?.[0] || conversation.user.full_name_ar?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gray-400 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.user.full_name || conversation.user.full_name_ar}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-hyhom-primary">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.lastMessage ? (
                          getLastMessagePreview(conversation.lastMessage)
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                      {conversation.user.position && (
                        <Badge variant="outline" className="text-xs">
                          {conversation.user.position}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}