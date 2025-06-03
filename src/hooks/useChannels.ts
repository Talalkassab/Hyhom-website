'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Database } from '@/types/database';

type Channel = Database['public']['Tables']['channels']['Row'] & {
  channel_members?: Database['public']['Tables']['channel_members']['Row'][];
  unread_count?: number;
  member_role?: string;
};

type ChannelMember = Database['public']['Tables']['channel_members']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

export function useChannels() {
  const { user } = useAuthContext();
  const { subscribe, unsubscribe } = useRealtime();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's channels with member info
        const { data: userChannels, error: channelsError } = await supabase
          .from('channel_members')
          .select(`
            channel_id,
            role,
            last_read_at,
            notifications_enabled,
            channels:channel_id (
              id,
              name,
              name_ar,
              description,
              description_ar,
              type,
              department,
              icon,
              color,
              is_archived,
              is_default,
              created_by,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id);

        if (channelsError) {
          throw channelsError;
        }

        // Also fetch public channels not yet joined
        const { data: publicChannels, error: publicError } = await supabase
          .from('channels')
          .select('*')
          .in('type', ['public', 'announcement'])
          .not('id', 'in', `(${userChannels?.map(uc => uc.channel_id).join(',') || 'null'})`);

        if (publicError && publicError.code !== 'PGRST116') { // PGRST116 = no rows found
          throw publicError;
        }

        // Combine and format channels
        const joinedChannels: Channel[] = userChannels?.map(uc => ({
          ...(uc.channels as any),
          member_role: uc.role,
          unread_count: 0, // Will be calculated later
        })) || [];

        const availableChannels: Channel[] = publicChannels?.map(pc => ({
          ...pc,
          member_role: undefined,
          unread_count: 0,
        })) || [];

        const allChannels = [...joinedChannels, ...availableChannels];
        
        // Sort channels: default first, then by type, then by name
        allChannels.sort((a, b) => {
          if (a.is_default && !b.is_default) return -1;
          if (!a.is_default && b.is_default) return 1;
          if (a.type !== b.type) {
            const typeOrder = ['announcement', 'public', 'private', 'department'];
            return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
          }
          return a.name.localeCompare(b.name);
        });

        setChannels(allChannels);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError(err instanceof Error ? err.message : 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();

    // Subscribe to channel changes
    const channelSubscription = subscribe('channels', (payload) => {
      console.log('Channel change:', payload);
      fetchChannels(); // Refetch channels on any change
    });

    return () => {
      if (channelSubscription) {
        unsubscribe(channelSubscription);
      }
    };
  }, [user?.id]);

  const joinChannel = async (channelId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          role: 'member',
        });

      if (error) {
        return { error: error.message };
      }

      // Update local state
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, member_role: 'member' }
          : channel
      ));

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to join channel' };
    }
  };

  const leaveChannel = async (channelId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, member_role: undefined }
          : channel
      ));

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to leave channel' };
    }
  };

  const createChannel = async (channelData: {
    name: string;
    name_ar: string;
    description?: string;
    description_ar?: string;
    type: 'public' | 'private' | 'department' | 'announcement';
    department?: string;
    icon?: string;
    color?: string;
  }) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          ...channelData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Automatically join the creator as owner
      await supabase
        .from('channel_members')
        .insert({
          channel_id: data.id,
          user_id: user.id,
          role: 'owner',
        });

      return { data, error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create channel' };
    }
  };

  const getChannelMembers = async (channelId: string): Promise<{ data: ChannelMember[] | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            full_name_ar,
            avatar_url,
            department,
            position,
            position_ar
          )
        `)
        .eq('channel_id', channelId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch members' };
    }
  };

  const updateLastRead = async (channelId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('channel_id', channelId)
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error updating last read:', err);
    }
  };

  return {
    channels,
    loading,
    error,
    joinChannel,
    leaveChannel,
    createChannel,
    getChannelMembers,
    updateLastRead,
    refetch: () => {
      if (user) {
        setLoading(true);
        // The useEffect will handle refetching
      }
    }
  };
}