'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Database } from '@/types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];

type NotificationType = 'message' | 'mention' | 'announcement' | 'system';

export function useNotifications() {
  const { user } = useAuthContext();
  const { subscribe, unsubscribe } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const notificationSubscription = subscribe('notifications', (payload) => {
      console.log('Notification change:', payload);
      
      if (payload.eventType === 'INSERT') {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if supported
        showBrowserNotification(newNotification);
      } else if (payload.eventType === 'UPDATE') {
        const updatedNotification = payload.new as Notification;
        setNotifications(prev => prev.map(n => 
          n.id === updatedNotification.id ? updatedNotification : n
        ));
        
        // Update unread count
        if (updatedNotification.is_read && !notifications.find(n => n.id === updatedNotification.id)?.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    });

    return () => {
      if (notificationSubscription) {
        unsubscribe(notificationSubscription);
      }
    };
  }, [user?.id]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const createNotification = async (
    userId: string,
    type: NotificationType,
    title: string,
    titleAr: string,
    content: string,
    contentAr: string,
    metadata?: any
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          title_ar: titleAr,
          content,
          content_ar: contentAr,
          metadata: metadata || {},
        });

      if (error) {
        console.error('Error creating notification:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { error: 'Failed to create notification' };
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        is_read: true, 
        read_at: new Date().toISOString() 
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.content,
        icon: '/icon-192x192.png', // Make sure this exists
        badge: '/icon-192x192.png',
        tag: notification.id,
      });

      browserNotification.onclick = () => {
        window.focus();
        markAsRead(notification.id);
        browserNotification.close();
        
        // Navigate based on notification type
        const metadata = notification.metadata as any;
        if (notification.type === 'message' && metadata?.channelId) {
          window.location.href = `/ar/channels/${metadata.channelId}`;
        } else if (notification.type === 'message' && metadata?.fromUserId) {
          window.location.href = `/ar/messages/${metadata.fromUserId}`;
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  };

  // Helper functions for creating common notifications
  const notifyNewMessage = async (
    recipientId: string, 
    senderName: string, 
    channelName: string, 
    channelId: string,
    messagePreview: string
  ) => {
    return createNotification(
      recipientId,
      'message',
      `New message in #${channelName}`,
      `رسالة جديدة في #${channelName}`,
      `${senderName}: ${messagePreview}`,
      `${senderName}: ${messagePreview}`,
      { channelId, senderName }
    );
  };

  const notifyNewDirectMessage = async (
    recipientId: string,
    senderName: string,
    fromUserId: string,
    messagePreview: string
  ) => {
    return createNotification(
      recipientId,
      'message',
      `New message from ${senderName}`,
      `رسالة جديدة من ${senderName}`,
      messagePreview,
      messagePreview,
      { fromUserId, senderName }
    );
  };

  const notifyMention = async (
    recipientId: string,
    senderName: string,
    channelName: string,
    channelId: string,
    messageContent: string
  ) => {
    return createNotification(
      recipientId,
      'mention',
      `${senderName} mentioned you in #${channelName}`,
      `${senderName} قام بالإشارة إليك في #${channelName}`,
      messageContent,
      messageContent,
      { channelId, senderName }
    );
  };

  const notifyAnnouncement = async (
    recipientId: string,
    title: string,
    titleAr: string,
    content: string,
    contentAr: string
  ) => {
    return createNotification(
      recipientId,
      'announcement',
      title,
      titleAr,
      content,
      contentAr
    );
  };

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    notifyNewMessage,
    notifyNewDirectMessage,
    notifyMention,
    notifyAnnouncement,
  };
}