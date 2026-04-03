import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Briefcase, ClipboardList, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Network, Trash2, Eye, Wrench, UserPlus, Globe, Settings,
  KeyRound, LogOut, Shield, TrendingUp, MessageCircle, GraduationCap,
} from 'lucide-react';

export function AppBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { path: '/app', icon: LayoutDashboard, label: t('dashboard.title'), exact: true },
    { path: '/app/customers', icon: Users, label: t('customer.listTitle', 'Kunden') },
    { path: '/app/cases', icon: Briefcase, label: t('case.list') },
    { path: '/app/tasks', icon: ClipboardList, label: t('task.list') },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isMoreActive = [
    '/app/tools', '/app/users', '/app/system-map', '/app/trash',
    '/app/leads', '/app/public-pages', '/app/chat', '/app/courses',
    '/app/profile', '/app/insurance-consulting', '/app/investment-consulting',
    '/app/client-portal',
  ].some(p => location.pathname.startsWith(p));

  const menuItems = [
    { path: '/app/insurance-consulting/start', icon: Shield, label: t('insuranceConsulting.title', 'Versicherungsberatung') },
    { path: '/app/investment-consulting/start', icon: TrendingUp, label: t('investmentConsulting.title', 'Anlageberatung') },
    ...(role === 'admin' ? [
      { path: '/app/tools', icon: Wrench, label: t('nav.tools') },
      { path: '/app/users', icon: Settings, label: t('userManagement.title') },
      { path: '/app/notifications', icon: MessageCircle, label: 'Benachrichtigungen' },
      { path: '/app/chat', icon: MessageCircle, label: 'Nachrichten' },
      { path: '/app/courses', icon: GraduationCap, label: 'Videokurs' },
      { path: '/app/system-map', icon: Network, label: t('systemMap.title') },
      { path: '/app/leads', icon: UserPlus, label: t('adminLeads.title', 'Leads') },
      { path: '/app/public-pages', icon: Globe, label: t('adminPages.title', 'Öffentliche Seiten') },
      { path: '/app/trash', icon: Trash2, label: t('trash.title') },
      { path: '/app/client-portal', icon: Eye, label: t('clientPortal.preview') },
    ] : []),
    { path: '/app/profile', icon: KeyRound, label: t('userManagement.profile') },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.path, tab.exact);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-2 px-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
                <span className={cn("text-[10px] font-medium truncate max-w-[64px]", active && "text-primary")}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-2 px-1 transition-colors",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Menu className={cn("h-5 w-5 mb-1", isMoreActive && "text-primary")} />
            <span className={cn("text-[10px] font-medium", isMoreActive && "text-primary")}>Mehr</span>
          </button>
        </div>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe max-h-[80vh]">
          <div className="pt-2 pb-4">
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border mt-3 pt-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-foreground min-h-[44px]"
                onClick={() => { setMenuOpen(false); signOut(); }}
              >
                <LogOut className="h-5 w-5" />
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
