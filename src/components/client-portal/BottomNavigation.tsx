import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Wrench, BookOpen, TrendingUp, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerPortalSettings, PortalVisibility } from '@/hooks/useClientPortal';

interface BottomNavigationProps {
  onMoreClick: () => void;
  buildPath: (path: string) => string;
}

export function BottomNavigation({ onMoreClick, buildPath }: BottomNavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: settings } = useCustomerPortalSettings();

  // Fixed order: Übersicht, Werkzeugkiste, Wissensbibliothek, Anlagestrategien
  const allNavItems = [
    { key: 'home', path: '/app/client-portal', icon: Home, label: t('clientPortal.home'), settingsKey: null },
    { key: 'tools', path: '/app/client-portal/tools', icon: Wrench, label: t('clientPortal.tools'), settingsKey: 'show_tools' as keyof PortalVisibility },
    { key: 'library', path: '/app/client-portal/library', icon: BookOpen, label: t('clientPortal.library'), settingsKey: 'show_library' as keyof PortalVisibility },
    { key: 'strategies', path: '/app/client-portal/strategies', icon: TrendingUp, label: t('clientPortal.strategies'), settingsKey: 'show_strategies' as keyof PortalVisibility },
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
    '/app/client-portal/courses',
    '/app/client-portal/profile',
  ].some(p => location.pathname.startsWith(p));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden safe-area-pb">
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
            "flex flex-col items-center justify-center flex-1 h-full min-w-0 py-2 px-0.5 transition-colors",
            isMoreActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MoreHorizontal className={cn("h-5 w-5 mb-0.5 shrink-0", isMoreActive && "text-primary")} />
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
