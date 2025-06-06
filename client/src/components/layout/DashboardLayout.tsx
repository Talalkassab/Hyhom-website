import { ReactNode, useState } from 'react';
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
  ChevronRight,
  ChevronDown,
  FolderIcon,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

interface NavGroup {
  icon: ReactNode;
  label: string;
  items: NavItem[];
}

function MenuItem({ icon, label, href, active }: NavItem & { active: boolean }) {
  const [, navigate] = useLocation();

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3",
        "hover:bg-accent/50",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
      onClick={() => navigate(href)}
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
  const [isHROpen, setIsHROpen] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(true);

  const dashboardItem: NavItem = {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: t('dashboard.overview'),
    href: '/dashboard'
  };

  const hrGroup: NavGroup = {
    icon: <FolderIcon className="h-4 w-4" />,
    label: "HR Info",
    items: [
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
    ]
  };

  const aiGroup: NavGroup = {
    icon: <Bot className="h-4 w-4" />,
    label: "AI Assistants",
    items: [
      {
        icon: <Users className="h-4 w-4" />,
        label: "HR Assistant",
        href: '/dashboard/assistants/hr'
      },
      {
        icon: <Building2 className="h-4 w-4" />,
        label: "Marketing Assistant",
        href: '/dashboard/assistants/marketing'
      },
      {
        icon: <LineChart className="h-4 w-4" />,
        label: "Business Analysis",
        href: '/dashboard/assistants/business'
      },
      {
        icon: <Heart className="h-4 w-4" />,
        label: "Operational Assistant",
        href: '/dashboard/assistants/operational'
      },
      {
        icon: <Bot className="h-4 w-4" />,
        label: "General Assistant",
        href: '/dashboard/assistants/general'
      }
    ]
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="fixed left-0 h-[calc(100vh-5rem)] w-64 border-r bg-card mt-20">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Hyhom Limited</h2>
          </div>
          <Separator />
          <nav className="flex-1 space-y-1 p-4">
            <MenuItem
              {...dashboardItem}
              active={location === dashboardItem.href}
            />

            <Collapsible
              open={isHROpen}
              onOpenChange={setIsHROpen}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground"
                >
                  {hrGroup.icon}
                  <span>{hrGroup.label}</span>
                  <ChevronDown className={cn(
                    "ml-auto h-4 w-4 transition-transform duration-200",
                    isHROpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-6">
                {hrGroup.items.map((item) => (
                  <MenuItem
                    key={item.href}
                    {...item}
                    active={location === item.href}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={isAIOpen}
              onOpenChange={setIsAIOpen}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground"
                >
                  {aiGroup.icon}
                  <span>{aiGroup.label}</span>
                  <ChevronDown className={cn(
                    "ml-auto h-4 w-4 transition-transform duration-200",
                    isAIOpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-6">
                {aiGroup.items.map((item) => (
                  <MenuItem
                    key={item.href}
                    {...item}
                    active={location === item.href}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </nav>
          <Separator />
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>{t('auth.signOut')}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        <div className="container py-6 mt-20">
          {children}
        </div>
      </main>
    </div>
  );
}