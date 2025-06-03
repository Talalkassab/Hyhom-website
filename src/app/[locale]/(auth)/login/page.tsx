'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // Static translations object
  const t = {
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.appName': 'HYHOM Connect',
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.register': 'Register',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.invalidCredentials': 'Invalid credentials',
    'auth.loginSuccess': 'Login successful'
  };
  const router = useRouter();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    console.log('Attempting login with:', data.email);
    
    try {
      // Use Supabase client directly for more reliable authentication
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      console.log('Direct auth response:', { user: authData?.user?.email, error });
      
      if (error) {
        console.error('Login failed:', error.message);
        toast({
          title: t['common.error'],
          description: error.message || t['auth.invalidCredentials'],
          variant: 'destructive',
        });
        setLoading(false);
      } else if (authData?.user && authData?.session) {
        console.log('Login successful, user authenticated');
        
        // Verify session is active
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session verification:', session?.user?.email);
        
        toast({
          title: t['common.success'],
          description: t['auth.loginSuccess'],
        });
        
        // Use window.location for a full page reload to ensure auth state is fresh
        setTimeout(() => {
          console.log('Redirecting to dashboard with full reload...');
          window.location.href = '/en/dashboard';
        }, 500);
      } else {
        console.error('Login succeeded but no session/user data');
        toast({
          title: t['common.error'],
          description: 'Authentication error. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast({
        title: t['common.error'],
        description: 'Network error - please check your connection',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hyhom-light to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-hyhom-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-hyhom-dark">
            {t['common.appName']}
          </CardTitle>
          <CardDescription>
            {t['auth.login']}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t['auth.email']}</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@hyhom.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {t['auth.emailRequired']}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t['auth.password']}</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {t['auth.passwordRequired']}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/en/forgot-password"
                className="text-sm text-hyhom-primary hover:underline"
              >
                {t['auth.forgotPassword']}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-hyhom-primary hover:bg-hyhom-dark"
              disabled={loading}
            >
              {loading ? t['common.loading'] : t['auth.login']}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">
                Don't have an account?{' '}
              </span>
              <Link
                href="/en/register"
                className="text-hyhom-primary hover:underline font-medium"
              >
                {t['auth.register']}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}