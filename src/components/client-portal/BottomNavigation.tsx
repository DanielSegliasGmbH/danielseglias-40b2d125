import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ClipboardList, Target, BookOpen, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onMoreClick: () => void;
  buildPath: (path: string) => string;
}

export function BottomNavigation({ onMoreClick, buildPath }: BottomNavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { key: 'home', path: '/app/client-portal', icon: Home, label: t('clientPortal.home') },
    { key: 'tasks', path: '/app/client-portal/tasks', icon: ClipboardList, label: t('clientPortal.tasks') },
    { key: 'goals', path: '/app/client-portal/goals', icon: Target, label: t('clientPortal.goals') },
    { key: 'library', path: '/app/client-portal/library', icon: BookOpen, label: t('clientPortal.library') },
  ];

  const isMoreActive = [
    '/app/client-portal/insurances',
    '/app/client-portal/strategies',
    '/app/client-portal/tools',
  ].includes(location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.key}
              to={buildPath(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] py-2 px-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn(
                "text-[10px] font-medium truncate max-w-[64px]",
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
            "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] py-2 px-1 transition-colors",
            isMoreActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MoreHorizontal className={cn("h-5 w-5 mb-1", isMoreActive && "text-primary")} />
          <span className={cn(
            "text-[10px] font-medium",
            isMoreActive && "text-primary"
          )}>
            {t('clientPortal.more')}
          </span>
        </button>
      </div>
    </nav>
  );
}
