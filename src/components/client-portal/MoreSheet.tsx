import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Target, ClipboardList, LogOut, ChevronRight, GraduationCap, TrendingUp, User, Users, HelpCircle, Globe, Crown, Wallet, PiggyBank, Landmark, Gift, Settings, FileBarChart, Camera, Archive } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildPath: (path: string) => string;
  onLogout: () => void;
  visibleSections: readonly { key: string }[];
}

export function MoreSheet({ open, onOpenChange, buildPath, onLogout, visibleSections }: MoreSheetProps) {
  const { t } = useTranslation();

  // Secondary content sections (only if visible via permissions)
  const contentItems = [
    { key: 'library', path: '/app/client-portal/library', icon: Globe, label: t('clientPortal.library') },
    { key: 'strategies', path: '/app/client-portal/strategies', icon: TrendingUp, label: t('clientPortal.strategies') },
    { key: 'insurances', path: '/app/client-portal/insurances', icon: Shield, label: t('clientPortal.insurances') },
    { key: 'goals', path: '/app/client-portal/goals', icon: Target, label: t('clientPortal.goals') },
    { key: 'tasks', path: '/app/client-portal/tasks', icon: ClipboardList, label: t('clientPortal.tasks') },
    { key: 'budget', path: '/app/client-portal/budget', icon: PiggyBank, label: t('clientPortal.budget', 'Mein Budget') },
    { key: 'net-worth', path: '/app/client-portal/net-worth', icon: Landmark, label: 'Mein Vermögen' },
    { key: 'courses', path: '/app/client-portal/courses', icon: GraduationCap, label: t('clientPortal.courses') },
  ];

  const visibleContentItems = contentItems.filter(item => 
    visibleSections.some(s => s.key === item.key)
  );

  const MoreLink = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <Link
      to={to}
      onClick={() => onOpenChange(false)}
      className={cn(
        "flex items-center justify-between w-full px-4 py-3.5 rounded-xl",
        "bg-muted/50 hover:bg-muted transition-colors",
        "active:scale-[0.98] touch-manipulation"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className="font-medium text-sm text-foreground">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto" style={{ paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))' }}>
        <SheetHeader className="pb-3">
          <SheetTitle className="text-base">{t('clientPortal.more')}</SheetTitle>
        </SheetHeader>
        
        {/* Secondary content areas */}
        {visibleContentItems.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              {t('clientPortal.moreContent', 'Weitere Bereiche')}
            </p>
            {visibleContentItems.map((item) => (
              <MoreLink key={item.key} to={buildPath(item.path)} icon={item.icon} label={item.label} />
            ))}
          </div>
        )}

        <Separator className="my-3" />

        {/* Account & Settings */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
            {t('app.accountSettings', 'Konto & Einstellungen')}
          </p>
          <MoreLink to="/app/client-portal/snapshot" icon={Camera} label="Mein Snapshot" />
          <MoreLink to="/app/client-portal/tool-archive" icon={Archive} label="Mein Archiv" />
          <MoreLink to="/app/client-portal/monthly-report" icon={FileBarChart} label="Mein Monatsbericht" />
          <MoreLink to="/app/client-portal/friends" icon={Users} label="Freunde" />
          <MoreLink to="/app/client-portal/invite" icon={Gift} label="Freunde einladen" />
          <MoreLink to="/app/client-portal/premium" icon={Crown} label="Premium" />
          <MoreLink to={buildPath('/app/client-portal/profile-data')} icon={Wallet} label="Mein Finanzprofil" />
          <MoreLink to="/app/profile" icon={User} label={t('userManagement.profile')} />
          <MoreLink to="/app/client-portal/settings" icon={Settings} label="Einstellungen" />
        </div>

        <Separator className="my-3" />

        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
            onLogout();
          }}
          className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {t('auth.logout')}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
