import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { LoginCredentials, SignupCredentials } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

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
  const [retryAttempts, setRetryAttempts] = useState(0);
  const { toast } = useToast();
  const { language } = useLanguage();
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getErrorMessage = (error: any) => {
    const isArabic = language === 'ar';

    const messages = {
      default: {
        title: isArabic ? 'خطأ' : 'Error',
        message: isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'
      },
      invalid_credentials: {
        title: isArabic ? 'خطأ في تسجيل الدخول' : 'Login Error',
        message: isArabic ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Email or password is incorrect'
      },
      rate_limit: {
        title: isArabic ? 'محاولات كثيرة' : 'Too Many Attempts',
        message: isArabic ? 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى' : 'Please wait a moment before trying again'
      }
    };

    if (error.message?.includes('Invalid login credentials')) {
      return messages.invalid_credentials;
    } else if (error.message?.includes('rate limit')) {
      return messages.rate_limit;
    }

    return messages.default;
  };

  const handleAuthError = async (error: any, operation: () => Promise<any>) => {
    const { title, message } = getErrorMessage(error);

    if (error.message?.includes('rate limit') && retryAttempts < MAX_RETRY_ATTEMPTS) {
      setRetryAttempts(prev => prev + 1);
      await sleep(RETRY_DELAY * (retryAttempts + 1));
      return operation();
    }

    toast({
      variant: "destructive",
      title,
      description: message,
    });

    throw error;
  };

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setRetryAttempts(0);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return handleAuthError(error, () => signIn(credentials));
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

    } catch (error: any) {
      await handleAuthError(error, () => signIn(credentials));
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    try {
      setRetryAttempts(0);
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
        return handleAuthError(error, () => signUp(credentials));
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

    } catch (error: any) {
      await handleAuthError(error, () => signUp(credentials));
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      const { title, message } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description: message,
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