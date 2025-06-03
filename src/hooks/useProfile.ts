'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { useAuthContext } from '@/contexts/AuthContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const createProfile = async (user: any) => {
    try {
      console.log('Creating profile for user:', user.id, user.email);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.email.split('@')[0] || 'User',
          full_name_ar: user.email.split('@')[0] || 'مستخدم',
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setError(error.message);
        setLoading(false);
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in createProfile:', err);
      setError('Failed to create profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Profile fetch result:', { data, error });

        if (error) {
          console.error('Error fetching profile:', error);
          // If no profile exists (404 error), create one
          if (error.code === 'PGRST116') {
            console.log('No profile found, creating one...');
            await createProfile(user);
          } else {
            // For other errors, set error state but don't fail completely
            console.warn('Profile fetch error, continuing without profile:', error);
            setError(error.message);
            setLoading(false);
          }
        } else {
          console.log('Profile loaded successfully:', data);
          setProfile(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error in fetchProfile:', err);
        // Don't let profile errors block the entire app
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Profile loading timeout, continuing without profile');
        setLoading(false);
        setError('Profile loading timeout');
      }
    }, 3000);

    fetchProfile();

    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
      }

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { error: 'Failed to update profile' };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: () => {
      if (user) {
        setProfile(null);
        setLoading(true);
      }
    }
  };
}