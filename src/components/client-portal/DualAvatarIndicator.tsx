import { useNavigate } from 'react-router-dom';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { usePeakScore } from '@/hooks/usePeakScore';
import { RankAvatar } from './RankAvatar';
import { cn } from '@/lib/utils';

interface DualAvatarIndicatorProps {
  className?: string;
}

export function DualAvatarIndicator({ className }: DualAvatarIndicatorProps) {
  const navigate = useNavigate();
  const { completed, futureSelfName } = useUserAvatar();
  const { rank } = usePeakScore();

  if (!completed) return null;

  return (
    <button
      onClick={() => navigate('/app/client-portal/avatar')}
      className={cn(
        'relative flex items-center -space-x-2 cursor-pointer group',
        className
      )}
      title={futureSelfName ? `Du → ${futureSelfName}` : 'Avatar'}
    >
      {/* Current self */}
      <RankAvatar rank={rank.rank} size="sm" variant="current" />
      {/* Future self – overlapping with glow */}
      <RankAvatar rank={6} size="sm" variant="future" />
    </button>
  );
}
