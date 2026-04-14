import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Wrench, BookOpen, TrendingUp, Sparkles, MoreHorizontal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerPortalSettings, PortalVisibility } from '@/hooks/useClientPortal';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

interface BottomNavigationProps {
  onMoreClick: () => void;
  buildPath: (path: string) => string;
}

export function BottomNavigation({ onMoreClick, buildPath }: BottomNavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: settings } = useCustomerPortalSettings();
  const unreadCount = useUnreadNotificationCount();

  // Fixed order: Übersicht, Werkzeugkiste, Wissensbibliothek, Anlagestrategien
  const allNavItems = [
    { key: 'home', path: '/app/client-portal', icon: Home, label: t('clientPortal.home'), settingsKey: null },
    { key: 'coach', path: '/app/client-portal/coach', icon: Sparkles, label: t('clientPortal.coach'), settingsKey: null },
    { key: 'tools', path: '/app/client-portal/tools', icon: Wrench, label: t('clientPortal.tools'), settingsKey: 'show_tools' as keyof PortalVisibility },
    { key: 'memories', path: '/app/client-portal/memories', icon: Clock, label: t('clientPortal.memories', 'Erinnerungen'), settingsKey: null },
  ];

  const navItems = allNavItems.filter(item => {
    if (!item.settingsKey) return true;
    if (!settings) return true;
    return settings[item.settingsKey] !== false;
  });

  const isMoreActive = [
    '/app/client-portal/insurances',
    '/app/client-portal/goals',
    '/app/client-portal/tasks',
    '/app/client-portal/budget',
    '/app/client-portal/courses',
    '/app/client-portal/strategies',
    '/app/client-portal/library',
    '/app/client-portal/premium',
    '/app/profile',
  ].some(p => location.pathname.startsWith(p));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.key === 'home' 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.key}
              to={buildPath(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-0 py-2 px-0.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-0.5 shrink-0", isActive && "text-primary")} />
              <span className={cn(
                "text-[10px] leading-tight font-medium truncate max-w-[60px] text-center",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={onMoreClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full min-w-0 py-2 px-0.5 transition-colors relative",
            isMoreActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <MoreHorizontal className={cn("h-5 w-5 mb-0.5 shrink-0", isMoreActive && "text-primary")} />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1.5 -right-2.5 h-3.5 min-w-[14px] px-1 text-[9px] flex items-center justify-center bg-destructive text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          <span className={cn(
            "text-[10px] leading-tight font-medium",
            isMoreActive && "text-primary"
          )}>
            {t('clientPortal.more')}
          </span>
        </button>
      </div>
    </nav>
  );
}
