'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  isConnected: boolean;
  subscribe: (channelName: string, callback: (payload: any) => void) => RealtimeChannel | null;
  unsubscribe: (channel: RealtimeChannel) => void;
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline') => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    // Set up connection status listeners
    const handleConnect = () => {
      setIsConnected(true);
      console.log('🟢 Realtime connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('🔴 Realtime disconnected');
    };

    // Create a presence channel for the user
    const presenceChannel = supabase.channel('user-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        console.log('👥 Presence synced');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          handleConnect();
          // Track presence
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CHANNEL_ERROR') {
          handleDisconnect();
        }
      });

    // Store the presence channel
    setChannels(prev => new Map(prev.set('user-presence', presenceChannel)));

    // Cleanup function
    return () => {
      presenceChannel.unsubscribe();
      setChannels(prev => {
        prev.delete('user-presence');
        return new Map(prev);
      });
      setIsConnected(false);
    };
  }, [user?.id]);

  const subscribe = (channelName: string, callback: (payload: any) => void): RealtimeChannel | null => {
    if (!user || !isConnected) {
      console.warn('Cannot subscribe: user not authenticated or not connected');
      return null;
    }

    // Check if already subscribed to this channel
    if (channels.has(channelName)) {
      console.warn(`Already subscribed to channel: ${channelName}`);
      return channels.get(channelName) || null;
    }

    const channel = supabase.channel(channelName);

    // Subscribe to different types of changes based on channel name
    if (channelName.startsWith('messages:')) {
      // For message channels
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelName.split(':')[1]}`,
        },
        callback
      );
    } else if (channelName.startsWith('dm:')) {
      // For direct message channels
      const [fromId, toId] = channelName.split(':')[1].split('-');
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(from_user_id.eq.${fromId},to_user_id.eq.${toId}),and(from_user_id.eq.${toId},to_user_id.eq.${fromId}))`,
        },
        callback
      );
    } else if (channelName === 'notifications') {
      // For user notifications
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        callback
      );
    } else {
      // Generic subscription
      channel.on('broadcast', { event: '*' }, callback);
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Failed to subscribe to ${channelName}`);
      }
    });

    setChannels(prev => new Map(prev.set(channelName, channel)));
    return channel;
  };

  const unsubscribe = (channel: RealtimeChannel) => {
    channel.unsubscribe();
    setChannels(prev => {
      const newChannels = new Map(prev);
      for (const [name, ch] of Array.from(newChannels.entries())) {
        if (ch === channel) {
          newChannels.delete(name);
          break;
        }
      }
      return newChannels;
    });
  };

  const updatePresence = async (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!user) return;

    try {
      // Update presence in database
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
        });

      // Update presence in realtime channel
      const presenceChannel = channels.get('user-presence');
      if (presenceChannel) {
        await presenceChannel.track({
          user_id: user.id,
          status,
          online_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  return (
    <RealtimeContext.Provider value={{
      isConnected,
      subscribe,
      unsubscribe,
      updatePresence,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}