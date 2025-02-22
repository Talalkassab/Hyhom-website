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
  const { toast } = useToast();
  const { language } = useLanguage();

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
      email_not_confirmed: {
        title: isArabic ? 'البريد الإلكتروني غير مؤكد' : 'Email Not Confirmed',
        message: isArabic 
          ? 'يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد قبل تسجيل الدخول'
          : 'Please check your email and click the confirmation link before signing in'
      },
      rate_limit: {
        title: isArabic ? 'محاولات كثيرة' : 'Too Many Attempts',
        message: isArabic ? 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى' : 'Please wait a moment before trying again'
      }
    };

    if (error.message?.includes('Email not confirmed')) {
      return messages.email_not_confirmed;
    } else if (error.message?.includes('Invalid login credentials')) {
      return messages.invalid_credentials;
    } else if (error.message?.includes('rate limit')) {
      return messages.rate_limit;
    }

    return messages.default;
  };

  const signIn = async (credentials: LoginCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        const { title, message } = getErrorMessage(error);
        toast({
          variant: "destructive",
          title,
          description: message,
        });
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

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

  const signUp = async (credentials: SignupCredentials) => {
    try {
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
        const { title, message } = getErrorMessage(error);
        toast({
          variant: "destructive",
          title,
          description: message,
        });
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Show success message about email confirmation
      toast({
        title: language === 'ar' ? 'تم التسجيل بنجاح' : 'Registration Successful',
        description: language === 'ar' 
          ? 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.'
          : 'A confirmation link has been sent to your email. Please check your email to confirm your account.',
      });

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