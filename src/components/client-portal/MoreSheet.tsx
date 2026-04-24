import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, ChevronRight, Archive, Settings } from 'lucide-react';
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
  onChatOpen?: () => void;
}

export function MoreSheet({ open, onOpenChange, onLogout }: MoreSheetProps) {
  const { t } = useTranslation();

  const MoreLink = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <Link
      to={to}
      onClick={() => onOpenChange(false)}
      className={cn(
        "flex items-center justify-between w-full px-4 py-3.5 rounded-xl",
        "bg-muted/50 transition-colors touch-manipulation",
        "active:bg-muted more-sheet-item"
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
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
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[85vh] overflow-y-auto touch-pan-y [&>button]:top-4 [&>button]:right-4"
        style={{ paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))', touchAction: 'pan-y' }}
      >
        <SheetHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-base">{t('clientPortal.more')}</SheetTitle>
        </SheetHeader>

        {/* ARCHIVED: "Weitere Bereiche" section (Chat, library, strategies, insurances, goals, tasks, budget, net-worth, courses) */}

        {/* Account & Settings — simplified to 2 items, no label */}
        <div className="space-y-1.5">
          <MoreLink to="/app/client-portal/tool-archive" icon={Archive} label="Mein Archiv" />
          <MoreLink to="/app/client-portal/settings" icon={Settings} label="Einstellungen" />
          {/* ARCHIVED: Snapshot, Kalender, Gewohnheiten, Monatsbericht, Finanzprofil, Friends, Premium, Manifest, letzter Plan, Expat, Finanz-Pfad */}
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
