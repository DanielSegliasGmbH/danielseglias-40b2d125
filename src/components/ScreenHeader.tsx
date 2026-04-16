import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  className?: string;
  breadcrumb?: string[];
}

export function ScreenHeader({ title, showBack = true, backTo, rightAction, className, breadcrumb }: ScreenHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn('sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border pt-safe', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="px-4 pt-1.5 pb-0">
          <p className="text-[10px] text-muted-foreground truncate">
            {breadcrumb.join(' › ')}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-xl text-foreground active:bg-accent transition-colors shrink-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        </div>
        {rightAction && <div className="shrink-0 ml-2">{rightAction}</div>}
      </div>
    </header>
  );
}
