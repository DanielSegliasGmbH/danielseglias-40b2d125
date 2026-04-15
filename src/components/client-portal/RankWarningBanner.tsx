import { AlertTriangle } from 'lucide-react';
import { usePeakScore } from '@/hooks/usePeakScore';

export function RankWarningBanner() {
  const { score, rankBuffer } = usePeakScore();

  if (score === null || !rankBuffer.isWarning) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
      <span className="text-xs text-foreground/80">
        ⚠️ Dein Rang ist gefährdet. Noch <strong>{rankBuffer.buffer}</strong> Punkte Puffer.
      </span>
    </div>
  );
}
