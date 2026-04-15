import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface InfoHintProps {
  text: string;
  articleId?: string;
  className?: string;
}

export function InfoHint({ text, articleId, className }: InfoHintProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('flex items-start gap-1.5 mt-1', className)}>
      <Info className="h-3 w-3 text-muted-foreground/60 shrink-0 mt-0.5" />
      <p className="text-[11px] text-muted-foreground leading-snug">
        {text}
        {articleId && (
          <>
            {' '}
            <button
              onClick={() => navigate(`/app/client-portal/library#${articleId}`)}
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-0.5 transition-colors"
            >
              Mehr erfahren →
            </button>
          </>
        )}
      </p>
    </div>
  );
}
