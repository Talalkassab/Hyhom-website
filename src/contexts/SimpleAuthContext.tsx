'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface SimpleAuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    console.log('SimpleAuth: Initializing...');
    
    // Check active session
    const checkSession = async () => {
      try {
        console.log('SimpleAuth: Checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('SimpleAuth: Session result:', { user: session?.user?.email, error: error?.message });
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('SimpleAuth: Error checking session:', error);
        setUser(null);
      } finally {
        console.log('SimpleAuth: Setting loading to false');
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('SimpleAuth: Auth state change:', event, 'User:', session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('SimpleAuth: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('SimpleAuth: Signing out...');
      await supabase.auth.signOut();
      window.location.href = '/ar/login';
    } catch (error) {
      console.error('SimpleAuth: Error signing out:', error);
    }
  };

  console.log('SimpleAuth: Rendering with user:', user?.email, 'loading:', loading);

  return (
    <SimpleAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}