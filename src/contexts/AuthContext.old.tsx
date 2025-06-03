'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Check active session
    const checkSession = async () => {
      console.log('AuthContext: Checking session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Error getting session:', error);
        } else {
          console.log('AuthContext: Session found:', session?.user?.email || 'No session');
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          // Clear timeout if session check completes
          if (timeoutId) clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('AuthContext: Unexpected error checking session:', error);
        if (mounted) {
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    // Start session check
    checkSession();

    // Failsafe: ensure loading is set to false after 3 seconds
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('AuthContext: Loading timeout reached - forcing loading to false');
        setLoading(false);
      }
    }, 3000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state change:', event, 'User:', session?.user?.email);
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
        // Clear timeout on auth state change
        if (timeoutId) clearTimeout(timeoutId);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Remove supabase from dependencies

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/en/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}