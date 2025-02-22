import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { MenuIcon, Globe, LogIn, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from './Logo';
import { useAuth } from '@/lib/AuthContext';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  const navigationItems = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/brands', label: t('nav.brands') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const loginText = language === 'ar' ? 'تسجيل دخول' : 'Login';
  const profileText = language === 'ar' ? 'الملف الشخصي' : 'Profile';
  const logoutText = language === 'ar' ? 'تسجيل خروج' : 'Logout';
  const profilePath = user ? `/profile/${user.id}` : '/login';

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="text-gray-600 hover:text-[#2a577e] transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="ml-4"
            >
              <Globe className="h-5 w-5" />
            </Button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={profilePath}>
                  <Button variant="outline">
                    <User className="h-5 w-5 mr-2" />
                    {profileText}
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-2" />
                  {logoutText}
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline">
                  <LogIn className="h-5 w-5 mr-2" />
                  {loginText}
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="pt-4">
                <Logo className="mb-6" />
              </div>
              <nav className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="text-lg text-gray-600 hover:text-[#2a577e]"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Auth Links */}
                {user ? (
                  <>
                    <Link href={profilePath}>
                      <Button variant="outline" className="w-full">
                        <User className="h-5 w-5 mr-2" />
                        {profileText}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      {logoutText}
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      <LogIn className="h-5 w-5 mr-2" />
                      {loginText}
                    </Button>
                  </Link>
                )}

                {/* Language Toggle */}
                <Button
                  variant="outline"
                  onClick={toggleLanguage}
                  className="w-full"
                >
                  {language === 'en' ? 'العربية' : 'English'}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}