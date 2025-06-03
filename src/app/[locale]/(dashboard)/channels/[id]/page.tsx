'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useChannels } from '@/hooks/useChannels';
import { useMessages } from '@/hooks/useMessages';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { usePresence } from '@/hooks/usePresence';
import { 
  Hash, 
  Send, 
  Paperclip, 
  Smile, 
  Users, 
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCheck,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Static translations
const t = {
  'chat.typeMessage': 'Type a message...',
  'chat.send': 'Send',
  'chat.members': 'Members',
  'chat.loadMore': 'Load more messages',
  'chat.noMessages': 'No messages yet',
  'chat.noMessagesDesc': 'Be the first to start a conversation!',
  'chat.edited': 'edited',
  'chat.today': 'Today',
  'chat.yesterday': 'Yesterday',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'channels.backToChannels': 'Back to Channels',
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface MessageProps {
  message: any;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onlineUsers: any[];
}

function MessageComponent({ message, isOwn, showAvatar, showTimestamp, onlineUsers }: MessageProps) {
  const profile = message.profiles;
  const isUserOnline = onlineUsers.some(user => user.id === message.user_id);
  
  return (
    <div className={`flex gap-3 p-4 hover:bg-gray-50 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && (
        <div className="relative">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {profile?.full_name?.[0] || profile?.full_name_ar?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          {isUserOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
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
                {t['chat.edited']}
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
            {message.content_type === 'image' && message.metadata?.file_url ? (
              <div>
                <img 
                  src={message.metadata.file_url} 
                  alt={message.metadata.file_name || 'Image'}
                  className="max-w-full h-auto rounded mb-2"
                  style={{ maxHeight: '300px' }}
                />
                {message.content !== message.metadata.file_url && (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}
              </div>
            ) : message.content_type === 'file' && message.metadata?.file_url ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <a 
                    href={message.metadata.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm underline hover:no-underline"
                  >
                    📎 {message.metadata.file_name}
                  </a>
                  {message.metadata.file_size && (
                    <p className="text-xs opacity-70">
                      {formatFileSize(message.metadata.file_size)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.id as string;
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { channels, getChannelMembers } = useChannels();
  const { messages, loading, sendMessage, loadMoreMessages, hasMore, loadingMore } = useMessages(channelId);
  const { uploading, uploadFile, isImageFile } = useFileUpload();
  const { onlineUsers } = usePresence();
  
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find current channel
  const currentChannel = channels.find(c => c.id === channelId);

  // Fetch member count
  useEffect(() => {
    if (channelId) {
      getChannelMembers(channelId).then(({ data, error }) => {
        if (!error && data) {
          setMemberCount(data.length);
        }
      });
    }
  }, [channelId]);

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

    const { error } = await sendMessage(content);
    
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSending(true);
      
      const { data, error, url } = await uploadFile(file);
      
      if (error || !data) {
        toast({
          title: t['common.error'],
          description: error || 'Failed to upload file',
          variant: 'destructive',
        });
        return;
      }

      // Send message with file attachment
      const fileContent = isImageFile(file.type) 
        ? `![${file.name}](${url})` 
        : `[📎 ${file.name} (${formatFileSize(file.size)})](${url})`;

      const { error: sendError } = await sendMessage(
        fileContent, 
        isImageFile(file.type) ? 'image' : 'file',
        { 
          file_id: data.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: url
        }
      );

      if (sendError) {
        toast({
          title: t['common.error'],
          description: sendError,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: t['common.error'],
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const shouldShowAvatar = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    if (currentMessage.user_id !== previousMessage.user_id) return true;
    
    const timeDiff = new Date(currentMessage.created_at).getTime() - new Date(previousMessage.created_at).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const shouldShowTimestamp = (currentMessage: any, previousMessage: any) => {
    return shouldShowAvatar(currentMessage, previousMessage);
  };

  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Channel not found</h3>
          <p className="text-gray-500 mb-4">This channel may not exist or you don't have access to it.</p>
          <Link href="/en/channels">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t['channels.backToChannels']}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Link href="/en/channels">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Hash className="h-5 w-5 text-hyhom-primary" />
            <div>
              <h1 className="font-semibold text-gray-900">{currentChannel.name}</h1>
              {currentChannel.description && (
                <p className="text-sm text-gray-500">{currentChannel.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            </Badge>
            {onlineUsers.length > 0 && (
              <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{onlineUsers.length} online</span>
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-0" ref={scrollAreaRef}>
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
                {loadingMore ? t['common.loading'] : t['chat.loadMore']}
              </Button>
            </div>
          )}

          {/* Messages */}
          {loading && messages.length === 0 ? (
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t['chat.noMessages']}</h3>
                <p className="text-gray-500">{t['chat.noMessagesDesc']}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const isOwn = message.user_id === user?.id;
                const showAvatar = shouldShowAvatar(message, previousMessage);
                const showTimestamp = shouldShowTimestamp(message, previousMessage);

                return (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    showTimestamp={showTimestamp}
                    onlineUsers={onlineUsers}
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
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || sending}
            >
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
              placeholder={t['chat.typeMessage']}
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