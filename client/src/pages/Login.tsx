import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { type LoginCredentials, loginSchema } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      await signIn(data);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error instanceof Error ? error.message : language === 'ar' ? 'فشل تسجيل الدخول' : 'Failed to sign in',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {language === 'ar' ? 'مرحباً بعودتك' : 'Welcome back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'أدخل بريدك الإلكتروني لتسجيل الدخول إلى حسابك'
              : 'Enter your email to sign in to your account'}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              {...form.register("email")}
              className={language === 'ar' ? 'text-right' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'البريد الإلكتروني مطلوب' : form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
              {...form.register("password")}
              className={language === 'ar' ? 'text-right' : ''}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'كلمة المرور مطلوبة' : form.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading 
              ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...') 
              : (language === 'ar' ? 'تسجيل الدخول' : 'Sign in')}
          </Button>
        </form>
      </div>
    </div>
  );
}