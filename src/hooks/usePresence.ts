'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Database } from '@/types/database';

type UserPresence = Database['public']['Tables']['user_presence']['Row'];

type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

interface UserWithPresence {
  id: string;
  full_name: string;
  full_name_ar: string;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  presence?: UserPresence;
  is_online?: boolean;
}

export function usePresence() {
  const { user } = useAuthContext();
  const { updatePresence, isConnected } = useRealtime();
  const [onlineUsers, setOnlineUsers] = useState<UserWithPresence[]>([]);
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Set user status
  const setStatus = async (status: PresenceStatus, statusMessage?: string) => {
    if (!user) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
          status_message: statusMessage || null,
        });

      if (error) {
        console.error('Error updating presence:', error);
        return;
      }

      // Update realtime presence
      await updatePresence(status);

      // Update local state
      setUserPresence(prev => ({
        ...prev,
        [user.id]: {
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
          status_message: statusMessage || null,
          status_message_ar: null,
        }
      }));
    } catch (error) {
      console.error('Error setting status:', error);
    }
  };

  // Auto set online when component mounts and connected
  useEffect(() => {
    if (user && isConnected) {
      setStatus('online');
    }
  }, [user?.id, isConnected]);

  // Auto set offline when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        // Try to set offline status (may not complete due to page unload)
        navigator.sendBeacon('/api/presence/offline', JSON.stringify({ userId: user.id }));
      }
    };

    const handleVisibilityChange = () => {
      if (user) {
        if (document.hidden) {
          setStatus('away');
        } else {
          setStatus('online');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  // Fetch online users and presence data
  useEffect(() => {
    if (!user) {
      setOnlineUsers([]);
      setLoading(false);
      return;
    }

    const fetchPresence = async () => {
      try {
        setLoading(true);

        // Get all users with their presence
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position,
            is_active,
            user_presence (
              status,
              last_seen,
              status_message,
              status_message_ar
            )
          `)
          .eq('is_active', true);

        if (profilesError) {
          throw profilesError;
        }

        const usersWithPresence: UserWithPresence[] = (profiles || []).map(profile => {
          const presence = (profile.user_presence as any)?.[0];
          const isRecent = presence?.last_seen ? 
            (Date.now() - new Date(presence.last_seen).getTime()) < 5 * 60 * 1000 : false; // 5 minutes
          
          return {
            ...profile,
            presence,
            is_online: presence?.status === 'online' && isRecent,
          };
        });

        setOnlineUsers(usersWithPresence);

        // Create presence lookup
        const presenceLookup: Record<string, UserPresence> = {};
        usersWithPresence.forEach(user => {
          if (user.presence) {
            presenceLookup[user.id] = user.presence;
          }
        });
        setUserPresence(presenceLookup);

      } catch (error) {
        console.error('Error fetching presence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresence();

    // Refresh presence every 2 minutes
    const interval = setInterval(fetchPresence, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Helper functions
  const getUserStatus = (userId: string): PresenceStatus => {
    const presence = userPresence[userId];
    if (!presence) return 'offline';

    const isRecent = presence.last_seen ? 
      (Date.now() - new Date(presence.last_seen).getTime()) < 5 * 60 * 1000 : false;

    return isRecent ? presence.status : 'offline';
  };

  const getUserLastSeen = (userId: string): Date | null => {
    const presence = userPresence[userId];
    return presence?.last_seen ? new Date(presence.last_seen) : null;
  };

  const getStatusColor = (status: PresenceStatus): string => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: PresenceStatus): string => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  const isUserOnline = (userId: string): boolean => {
    return getUserStatus(userId) === 'online';
  };

  const getOnlineCount = (): number => {
    return onlineUsers.filter(user => user.is_online).length;
  };

  return {
    onlineUsers,
    userPresence,
    loading,
    setStatus,
    getUserStatus,
    getUserLastSeen,
    getStatusColor,
    getStatusText,
    isUserOnline,
    getOnlineCount,
    isConnected,
  };
}