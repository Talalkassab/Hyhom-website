'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Database } from '@/types/database';

type DirectMessage = Database['public']['Tables']['direct_messages']['Row'] & {
  from_user?: Database['public']['Tables']['profiles']['Row'];
  to_user?: Database['public']['Tables']['profiles']['Row'];
  file_uploads?: Database['public']['Tables']['file_uploads']['Row'][];
};

type Conversation = {
  user: Database['public']['Tables']['profiles']['Row'];
  lastMessage: DirectMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
};

export function useDirectMessages(otherUserId?: string) {
  const { user } = useAuthContext();
  const { subscribe, unsubscribe } = useRealtime();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const supabase = createClient();

  // Fetch conversations list
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all unique users that the current user has messaged with
        const { data: dmData, error: dmError } = await supabase
          .from('direct_messages')
          .select(`
            *,
            from_user:from_user_id (
              id,
              full_name,
              full_name_ar,
              avatar_url,
              department,
              position,
              is_active
            ),
            to_user:to_user_id (
              id,
              full_name,
              full_name_ar,
              avatar_url,
              department,
              position,
              is_active
            )
          `)
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (dmError) {
          throw dmError;
        }

        // Group messages by conversation partner
        const conversationMap = new Map<string, {
          user: any;
          messages: DirectMessage[];
        }>();

        dmData?.forEach((message) => {
          const isFromCurrentUser = message.from_user_id === user.id;
          const otherUser = isFromCurrentUser ? message.to_user : message.from_user;
          
          if (!otherUser || !otherUser.is_active) return; // Skip inactive users

          const key = otherUser.id;
          
          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              user: otherUser,
              messages: [],
            });
          }
          
          conversationMap.get(key)!.messages.push(message);
        });

        // Convert to conversations format
        const conversationsList: Conversation[] = Array.from(conversationMap.values()).map(({ user: otherUser, messages }) => {
          const sortedMessages = messages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          const lastMessage = sortedMessages[0] || null;
          const unreadCount = messages.filter(msg => 
            msg.to_user_id === user.id && !msg.is_read
          ).length;

          return {
            user: otherUser,
            lastMessage,
            unreadCount,
            lastMessageAt: lastMessage?.created_at || null,
          };
        });

        // Sort by last message time
        conversationsList.sort((a, b) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });

        setConversations(conversationsList);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  // Fetch messages for specific conversation
  useEffect(() => {
    if (!user || !otherUserId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);

        const { data, error: messagesError } = await supabase
          .from('direct_messages')
          .select(`
            *,
            from_user:from_user_id (
              id,
              full_name,
              full_name_ar,
              avatar_url,
              department,
              position
            ),
            to_user:to_user_id (
              id,
              full_name,
              full_name_ar,
              avatar_url,
              department,
              position
            ),
            file_uploads (
              id,
              file_name,
              file_size,
              file_type,
              storage_path
            )
          `)
          .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) {
          throw messagesError;
        }

        setMessages(data || []);
        setHasMore((data?.length || 0) === 50);

        // Mark messages as read
        if (data && data.length > 0) {
          await supabase
            .from('direct_messages')
            .update({ 
              is_read: true, 
              read_at: new Date().toISOString() 
            })
            .eq('to_user_id', user.id)
            .eq('from_user_id', otherUserId)
            .eq('is_read', false);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages for this conversation
    const messageSubscription = subscribe(`dm:${user.id}-${otherUserId}`, (payload) => {
      console.log('DM change:', payload);
      
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as DirectMessage;
        setMessages(prev => [...prev, newMessage]);
        
        // Mark as read if it's for current user
        if (newMessage.to_user_id === user.id) {
          supabase
            .from('direct_messages')
            .update({ 
              is_read: true, 
              read_at: new Date().toISOString() 
            })
            .eq('id', newMessage.id);
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new as DirectMessage;
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
      }
    });

    return () => {
      if (messageSubscription) {
        unsubscribe(messageSubscription);
      }
    };
  }, [user?.id, otherUserId]);

  const sendMessage = async (
    toUserId: string, 
    content: string, 
    contentType: 'text' | 'image' | 'file' = 'text', 
    metadata?: any
  ) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          content,
          content_type: contentType,
          metadata: metadata || {},
        })
        .select(`
          *,
          from_user:from_user_id (
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position
          ),
          to_user:to_user_id (
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position
          )
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to send message' };
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('from_user_id', user.id); // Only allow editing own messages

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to edit message' };
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('from_user_id', user.id); // Only allow deleting own messages

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete message' };
    }
  };

  const loadMoreMessages = async () => {
    if (!user || !otherUserId || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          from_user:from_user_id (
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position
          ),
          to_user:to_user_id (
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position
          ),
          file_uploads (
            id,
            file_name,
            file_size,
            file_type,
            storage_path
          )
        `)
        .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`)
        .eq('is_deleted', false)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: true })
        .limit(25);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMessages(prev => [...data, ...prev]);
        setHasMore(data.length === 25);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getTotalUnreadCount = (): number => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  return {
    conversations,
    messages,
    loading,
    loadingMessages,
    error,
    hasMore,
    loadingMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    getTotalUnreadCount,
    refetch: () => {
      if (user) {
        setLoading(true);
        if (otherUserId) {
          setLoadingMessages(true);
        }
      }
    }
  };
}