'use client';

import { useState } from 'react';
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
import { MessageCircle, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  // Static translations object
  const t = {
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.appName': 'HYHOM Connect',
    'auth.forgotPassword': 'Forgot Password',
    'auth.email': 'Email',
    'auth.sendResetLink': 'Send Reset Link',
    'auth.backToLogin': 'Back to Login',
    'auth.forgotPasswordDescription': 'Enter your email address and we will send you a password reset link.',
    'auth.resetEmailSent': 'Reset email sent! Check your inbox.',
    'auth.emailRequired': 'Email is required'
  };
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast({
          title: t['common.error'],
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setEmailSent(true);
        toast({
          title: t['common.success'],
          description: 'Password reset email sent successfully',
        });
      }
    } catch (error) {
      toast({
        title: t['common.error'],
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hyhom-light to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <MessageCircle className="h-12 w-12 text-hyhom-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-hyhom-dark">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Link href="/login">
                <Button className="w-full bg-hyhom-primary hover:bg-hyhom-dark">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hyhom-light to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-hyhom-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-hyhom-dark">
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
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

            <Button
              type="submit"
              className="w-full bg-hyhom-primary hover:bg-hyhom-dark"
              disabled={loading}
            >
              {loading ? t['common.loading'] : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-hyhom-primary hover:underline flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}