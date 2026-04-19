import { AlertTriangle } from 'lucide-react';
import { usePeakScore } from '@/hooks/usePeakScore';

// ARCHIVED for v1.0 — auto-firing banner, restore after testing in Claude Code.
export function RankWarningBanner() {
  // ARCHIVED: return null
  return null;
  // eslint-disable-next-line no-unreachable
  // @ts-ignore — original implementation preserved below for restoration
  function _ArchivedImpl() {
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
