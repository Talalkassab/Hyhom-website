'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
  file_uploads?: Database['public']['Tables']['file_uploads']['Row'][];
  replies?: Message[];
  reply_count?: number;
};

export function useMessages(channelId: string | null) {
  const { user } = useAuthContext();
  const { subscribe, unsubscribe } = useRealtime();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!channelId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:user_id (
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
          .eq('channel_id', channelId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) {
          throw messagesError;
        }

        setMessages(data || []);
        setHasMore((data?.length || 0) === 50);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages for this channel
    const messageSubscription = subscribe(`messages:${channelId}`, async (payload) => {
      console.log('Message change:', payload);
      
      if (payload.eventType === 'INSERT') {
        // Fetch the complete message with profile data
        const { data: messageWithProfile } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:user_id (
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
          .eq('id', payload.new.id)
          .single();

        if (messageWithProfile) {
          setMessages(prev => [...prev, messageWithProfile]);
        }
      } else if (payload.eventType === 'UPDATE') {
        // Update existing message
        const updatedMessage = payload.new as Message;
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        ));
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted message
        const deletedMessage = payload.old as Message;
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
      }
    });

    return () => {
      if (messageSubscription) {
        unsubscribe(messageSubscription);
      }
    };
  }, [channelId, user?.id]);

  const sendMessage = async (content: string, contentType: 'text' | 'image' | 'file' = 'text', metadata?: any) => {
    if (!user || !channelId) return { error: 'Missing user or channel' };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content,
          content_type: contentType,
          metadata: metadata || {},
        })
        .select(`
          *,
          profiles:user_id (
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
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('user_id', user.id); // Only allow editing own messages

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
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('user_id', user.id); // Only allow deleting own messages

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete message' };
    }
  };

  const loadMoreMessages = async () => {
    if (!channelId || !user || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
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
        .eq('channel_id', channelId)
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

  const searchMessages = async (query: string) => {
    if (!channelId || !user || !query.trim()) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position
          )
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Search failed' };
    }
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    loadingMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    searchMessages,
    refetch: () => {
      if (channelId && user) {
        setLoading(true);
        // The useEffect will handle refetching
      }
    }
  };
}