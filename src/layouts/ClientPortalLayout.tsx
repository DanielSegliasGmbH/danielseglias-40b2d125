import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortalSettings } from '@/hooks/useClientPortal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  Home,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ClientPortalLayoutProps {
  children: ReactNode;
}

const portalSections = [
  { key: 'insurances', path: '/app/client-portal/insurances', icon: Shield, labelKey: 'clientPortal.insurances' },
  { key: 'goals', path: '/app/client-portal/goals', icon: Target, labelKey: 'clientPortal.goals' },
  { key: 'tasks', path: '/app/client-portal/tasks', icon: ClipboardList, labelKey: 'clientPortal.tasks' },
  { key: 'strategies', path: '/app/client-portal/strategies', icon: TrendingUp, labelKey: 'clientPortal.strategies' },
  { key: 'library', path: '/app/client-portal/library', icon: BookOpen, labelKey: 'clientPortal.library' },
  { key: 'tools', path: '/app/client-portal/tools', icon: Wrench, labelKey: 'clientPortal.tools' },
] as const;

export function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: settings } = useClientPortalSettings();

  const visibleSections = portalSections.filter(section => {
    if (!settings) return true; // Show all if no settings (default)
    const settingKey = `show_${section.key}` as keyof typeof settings;
    return settings[settingKey] !== false;
  });

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const firstName = user?.user_metadata?.first_name || 'Kunde';

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-background border-r">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-foreground">{t('clientPortal.title')}</h1>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            <Link
              to="/app/client-portal"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === '/app/client-portal'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              {t('clientPortal.home')}
            </Link>
            {visibleSections.map(section => (
              <Link
                key={section.key}
                to={section.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === section.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <section.icon className="h-4 w-4" />
                {t(section.labelKey)}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t space-y-2">
          <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">{t('clientPortal.title')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background pt-16">
          <ScrollArea className="h-full">
            <nav className="p-4 space-y-2">
              <Link
                to="/app/client-portal"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium",
                  location.pathname === '/app/client-portal'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Home className="h-5 w-5" />
                {t('clientPortal.home')}
              </Link>
              {visibleSections.map(section => (
                <Link
                  key={section.key}
                  to={section.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium",
                    location.pathname === section.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <section.icon className="h-5 w-5" />
                  {t(section.labelKey)}
                </Link>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-muted-foreground px-3 mb-2">{user?.email}</div>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.logout')}
                </Button>
              </div>
            </nav>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pt-0 pt-16">
        <div className="hidden lg:flex items-center justify-end gap-4 p-4 border-b bg-background">
          <LanguageSwitcher />
          <span className="text-sm text-muted-foreground">{firstName}</span>
        </div>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}