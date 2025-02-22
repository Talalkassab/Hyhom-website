import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { LoginCredentials, SignupCredentials } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user ? 'User found' : 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user ? 'User present' : 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting sign in for:', credentials.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Supabase Auth Error:', error.message);
        let errorMessage = 'Failed to sign in. Please try again.';

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'; // Arabic: Email or password is incorrect
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'يرجى تأكيد عنوان بريدك الإلكتروني قبل تسجيل الدخول'; // Arabic: Please confirm your email before signing in
        }

        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول", // Arabic: Login Error
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error('No user data returned from Supabase');
      }

      console.log('Sign in successful:', data.user.email);

    } catch (error) {
      console.error('Detailed Auth Error:', error);
      throw error;
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    try {
      console.log('Attempting sign up for:', credentials.email);
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        },
      });

      if (error) {
        console.error('Supabase Signup Error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('Sign up successful:', data.user.email);

    } catch (error) {
      console.error('Detailed Signup Error:', error);
      toast({
        variant: "destructive",
        title: "فشل التسجيل", // Arabic: Registration failed
        description: error instanceof Error ? error.message : "فشل في إنشاء الحساب", // Arabic: Failed to create account
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting sign out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase Signout Error:', error);
        throw error;
      }
      console.log('Sign out successful');
    } catch (error) {
      console.error('Detailed Signout Error:', error);
      toast({
        variant: "destructive",
        title: "فشل تسجيل الخروج", // Arabic: Sign out failed
        description: error instanceof Error ? error.message : "فشل في تسجيل الخروج", // Arabic: Failed to sign out
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}