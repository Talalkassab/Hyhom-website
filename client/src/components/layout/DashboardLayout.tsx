import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n';
import {
  LayoutDashboard,
  Users,
  Building2,
  LineChart,
  Heart,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, href, active, onClick }: SidebarItemProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3",
        "hover:bg-accent/50",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
      onClick={handleClick}
    >
      {icon}
      <span>{label}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4" />}
    </Button>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: t('dashboard.overview'),
      href: '/dashboard'
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: t('dashboard.employees'),
      href: '/dashboard/employees'
    },
    {
      icon: <Building2 className="h-4 w-4" />,
      label: t('dashboard.departments'),
      href: '/dashboard/departments'
    },
    {
      icon: <LineChart className="h-4 w-4" />,
      label: t('dashboard.performance'),
      href: '/dashboard/performance'
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: t('dashboard.benefits'),
      href: '/dashboard/benefits'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Hyhom Limited</h2>
          </div>
          <Separator />
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                active={location === item.href}
              />
            ))}
          </nav>
          <Separator />
          <div className="p-4">
            <SidebarItem
              icon={<LogOut className="h-4 w-4" />}
              label={t('auth.signOut')}
              onClick={handleLogout}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}