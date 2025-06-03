'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Send, 
  Paperclip, 
  Smile, 
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCheck,
  MoreVertical,
  User
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Static translations
const t = {
  'dm.typeMessage': 'Type a message...',
  'dm.send': 'Send',
  'dm.loadMore': 'Load more messages',
  'dm.noMessages': 'No messages yet',
  'dm.noMessagesDesc': 'Start the conversation by sending a message!',
  'dm.edited': 'edited',
  'dm.today': 'Today',
  'dm.yesterday': 'Yesterday',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'messages.backToMessages': 'Back to Messages',
  'dm.online': 'Online',
  'dm.offline': 'Offline',
  'dm.lastSeen': 'Last seen',
};

interface MessageProps {
  message: any;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

function DirectMessageComponent({ message, isOwn, showAvatar, showTimestamp }: MessageProps) {
  const profile = isOwn ? message.from_user : message.to_user;
  
  return (
    <div className={`flex gap-3 p-4 hover:bg-gray-50 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="text-xs">
            {profile?.full_name?.[0] || profile?.full_name_ar?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex-1 ${!showAvatar ? 'ml-11' : ''} ${isOwn ? 'mr-11' : ''}`}>
        {showTimestamp && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-medium text-gray-900">
              {profile?.full_name || profile?.full_name_ar || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {message.is_edited && (
              <Badge variant="secondary" className="text-xs">
                {t['dm.edited']}
              </Badge>
            )}
          </div>
        )}
        
        <div className={`${isOwn ? 'text-right' : 'text-left'}`}>
          <div 
            className={`inline-block max-w-[70%] rounded-lg p-3 ${
              isOwn 
                ? 'bg-hyhom-primary text-white ml-auto' 
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            {isOwn && (
              <div className="flex items-center justify-end mt-1 opacity-70">
                <CheckCheck className="h-3 w-3" />
                {message.is_read && <span className="text-xs ml-1">Read</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DirectMessagePage() {
  const params = useParams();
  const otherUserId = params.id as string;
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { messages, loadingMessages, sendMessage, loadMoreMessages, hasMore, loadingMore } = useDirectMessages(otherUserId);
  
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch the other user's profile
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUserId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, full_name_ar, avatar_url, department, position')
          .eq('id', otherUserId)
          .eq('is_active', true)
          .single();
        
        if (error) throw error;
        setOtherUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    const { error } = await sendMessage(otherUserId, content);
    
    if (error) {
      toast({
        title: t['common.error'],
        description: error,
        variant: 'destructive',
      });
      setMessageInput(content); // Restore message on error
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const shouldShowAvatar = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    if (currentMessage.from_user_id !== previousMessage.from_user_id) return true;
    
    const timeDiff = new Date(currentMessage.created_at).getTime() - new Date(previousMessage.created_at).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    return shouldShowAvatar(currentMessage, previousMessage);
  };

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-500 mb-4">This user may not exist or you don't have access to them.</p>
          <Link href="/ar/messages">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t['messages.backToMessages']}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Link href="/ar/messages">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatar_url || ''} />
                <AvatarFallback>
                  {otherUser.full_name?.[0] || otherUser.full_name_ar?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-gray-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {otherUser.full_name || otherUser.full_name_ar}
              </h1>
              <p className="text-sm text-gray-500">
                {otherUser.position || otherUser.department || 'Employee'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {t['dm.offline']}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-0">
        <div className="min-h-full flex flex-col">
          {/* Load More Button */}
          {hasMore && (
            <div className="p-4 text-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadMoreMessages}
                disabled={loadingMore}
              >
                {loadingMore ? t['common.loading'] : t['dm.loadMore']}
              </Button>
            </div>
          )}

          {/* Messages */}
          {loadingMessages && messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
                <p className="text-gray-600">{t['common.loading']}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t['dm.noMessages']}</h3>
                <p className="text-gray-500">{t['dm.noMessagesDesc']}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const isOwn = message.from_user_id === user?.id;
                const showAvatar = shouldShowAvatar(message, previousMessage);
                const showTimestamp = shouldShowTimestamp(message, previousMessage);

                return (
                  <DirectMessageComponent
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    showTimestamp={showTimestamp}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button type="button" variant="ghost" size="sm" className="p-2">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="p-2">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t['dm.typeMessage']}
              className="pr-12 min-h-[40px] resize-none"
              disabled={sending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!messageInput.trim() || sending}
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-hyhom-primary hover:bg-hyhom-dark"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}