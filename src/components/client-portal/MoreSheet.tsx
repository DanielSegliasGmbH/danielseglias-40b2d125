import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, TrendingUp, Wrench, LogOut, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildPath: (path: string) => string;
  onLogout: () => void;
  visibleSections: readonly { key: string }[];
}

export function MoreSheet({ open, onOpenChange, buildPath, onLogout, visibleSections }: MoreSheetProps) {
  const { t } = useTranslation();

  const moreItems = [
    { key: 'insurances', path: '/app/client-portal/insurances', icon: Shield, label: t('clientPortal.insurances') },
    { key: 'strategies', path: '/app/client-portal/strategies', icon: TrendingUp, label: t('clientPortal.strategies') },
    { key: 'tools', path: '/app/client-portal/tools', icon: Wrench, label: t('clientPortal.tools') },
  ];

  const visibleMoreItems = moreItems.filter(item => 
    visibleSections.some(s => s.key === item.key)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
        <SheetHeader className="pb-4">
          <SheetTitle>{t('clientPortal.more')}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2">
          {visibleMoreItems.map((item) => (
            <Link
              key={item.key}
              to={buildPath(item.path)}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-4 rounded-xl",
                "bg-muted/50 hover:bg-muted transition-colors",
                "active:scale-[0.98] touch-manipulation"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Settings Section */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl mb-4">
          <span className="text-sm font-medium text-muted-foreground">{t('app.settings', 'Einstellungen')}</span>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
            onLogout();
          }}
          className="w-full justify-start h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {t('auth.logout')}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
