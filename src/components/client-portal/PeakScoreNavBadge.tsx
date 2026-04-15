import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { usePeakScore } from '@/hooks/usePeakScore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function PeakScoreNavBadge() {
  const navigate = useNavigate();
  const { score, rank, loading } = usePeakScore();

  if (loading || score === null) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => navigate('/app/client-portal/peak-score')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-colors text-foreground/80"
        >
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-bold tabular-nums">{score.toFixed(1)}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">PeakScore · {rank.emoji} {rank.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
