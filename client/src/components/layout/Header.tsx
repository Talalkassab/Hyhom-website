import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { MenuIcon, Globe, User, LogOut, LayoutDashboard } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const dashboardText = language === 'ar' ? 'لوحة التحكم' : 'Dashboard';
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

            {/* Auth Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.email} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={profilePath}>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>{profileText}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard">
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{dashboardText}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutText}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline">
                  <User className="h-5 w-5 mr-2" />
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
                      <Button variant="outline" className="w-full justify-start gap-3">
                        <User className="h-5 w-5" />
                        {profileText}
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full justify-start gap-3">
                        <LayoutDashboard className="h-5 w-5" />
                        {dashboardText}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full justify-start gap-3"
                    >
                      <LogOut className="h-5 w-5" />
                      {logoutText}
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <User className="h-5 w-5" />
                      {loginText}
                    </Button>
                  </Link>
                )}

                {/* Language Toggle */}
                <Button
                  variant="outline"
                  onClick={toggleLanguage}
                  className="w-full justify-start gap-3"
                >
                  <Globe className="h-5 w-5" />
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