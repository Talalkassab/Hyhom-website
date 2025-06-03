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

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  fullName: z.string().min(2),
  fullNameAr: z.string().min(2),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  // Static translations object
  const t = {
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.appName': 'HYHOM Connect',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.registerSuccess': 'Registration successful'
  };
  const router = useRouter();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          fullNameAr: data.fullNameAr,
        }),
      });
      
      const result = await response.json();
      console.log('Registration API response:', result);
      
      if (!response.ok) {
        toast({
          title: t['common.error'],
          description: result.error || 'Registration failed',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t['common.success'],
          description: result.message || t['auth.registerSuccess'],
        });
        // Redirect to login page after successful registration
        router.push('/en/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: t['common.error'],
        description: 'Network error - please check your connection',
        variant: 'destructive',
      });
    } finally {
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
            {t['auth.register']}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t['auth.fullName']} (English)</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName')}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">Required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullNameAr">{t['auth.fullName']} (العربية)</Label>
                <Input
                  id="fullNameAr"
                  type="text"
                  placeholder="جون دو"
                  {...register('fullNameAr')}
                  className={errors.fullNameAr ? 'border-red-500' : ''}
                  dir="rtl"
                />
                {errors.fullNameAr && (
                  <p className="text-sm text-red-500">مطلوب</p>
                )}
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t['auth.confirmPassword']}</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {t['auth.passwordMismatch']}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-hyhom-primary hover:bg-hyhom-dark"
              disabled={loading}
            >
              {loading ? t['common.loading'] : t['auth.register']}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">
                Already have an account?{' '}
              </span>
              <Link
                href="/en/login"
                className="text-hyhom-primary hover:underline font-medium"
              >
                {t['auth.login']}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}