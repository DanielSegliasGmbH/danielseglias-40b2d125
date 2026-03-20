import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  title?: string;
  className?: string;
}

export function AutoSaveIndicator({ status, title, className }: AutoSaveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {title && (
        <span className="font-medium text-foreground truncate max-w-[200px]">
          {title}
        </span>
      )}
      <span className="flex items-center gap-1 text-muted-foreground shrink-0">
        {status === 'saving' && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Speichert…</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <Check className="w-3.5 h-3.5 text-primary" />
            <span>Gespeichert</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span>Fehler beim Speichern</span>
          </>
        )}
      </span>
    </div>
  );
}
