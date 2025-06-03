'use client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePresence } from '@/hooks/usePresence';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  LogOut, 
  Hash,
  User,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', nameAr: 'لوحة التحكم', href: '/en/dashboard', icon: MessageCircle },
  { name: 'Channels', nameAr: 'القنوات', href: '/en/channels', icon: Hash },
  { name: 'Direct Messages', nameAr: 'الرسائل المباشرة', href: '/en/messages', icon: Users },
];

// Static translations object
const t = {
  'common.appName': 'HYHOM Connect',
  'navigation.profile': 'Profile',
  'navigation.settings': 'Settings',
  'common.logout': 'Logout'
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuthContext();
  const { profile } = useProfile();
  const { getOnlineCount, isConnected } = usePresence();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <MessageCircle className="h-8 w-8 text-hyhom-primary" />
              <h1 className="text-xl font-bold text-hyhom-dark">
                {t['common.appName']}
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages, channels, people..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyhom-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                      <AvatarFallback>
                        {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || user?.email || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.position || user?.email || 'user@hyhom.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/en/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t['navigation.profile']}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/en/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t['navigation.settings']}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t['common.logout']}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-hyhom-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Channels Section */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Channels
              </h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link
                    href="/channel/general"
                    className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Hash className="h-4 w-4" />
                    <span>general</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/channel/announcements"
                    className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Hash className="h-4 w-4" />
                    <span>announcements</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Direct Messages Section */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Direct Messages
              </h3>
              <ul className="mt-2 space-y-1">
                <li className="px-3 py-2 text-sm text-gray-500">
                  No recent conversations
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}