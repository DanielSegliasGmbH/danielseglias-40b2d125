import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'Etwas ist schiefgelaufen.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Bitte versuche es erneut oder kontaktiere den Support.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="rounded-xl h-11 px-6 gap-2">
          <RefreshCw className="h-4 w-4" />
          Nochmal versuchen
        </Button>
      )}
    </div>
  );
}
