import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  CalendarCheck, MessageSquare, Wrench, Sparkles, Play,
  ExternalLink, Crown, ArrowRight,
} from 'lucide-react';
import { useResolvedCta, useTrackCtaImpression } from '@/hooks/useCtaEngine';

const TYPE_ICONS: Record<string, typeof Wrench> = {
  booking: CalendarCheck,
  chat: MessageSquare,
  tool: Wrench,
  module: Sparkles,
  video: Play,
  link: ExternalLink,
  premium: Crown,
  next_step: ArrowRight,
};

interface CtaBannerProps {
  context?: string;
}

export function CtaBanner({ context = 'dashboard' }: CtaBannerProps) {
  const navigate = useNavigate();
  const { data: resolved } = useResolvedCta(context);
  const trackImpression = useTrackCtaImpression();

  // Track impression on mount
  useEffect(() => {
    if (resolved) {
      trackImpression.mutate({
        ctaId: resolved.definition.id,
        ctaRef: resolved.definition.name,
        context,
        clicked: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved?.definition?.id]);

  if (!resolved) return null;

  const { definition } = resolved;
  const Icon = TYPE_ICONS[definition.cta_type] || ArrowRight;

  const handleClick = () => {
    trackImpression.mutate({
      ctaId: definition.id,
      ctaRef: definition.name,
      context,
      clicked: true,
    });

    const target = definition.target;
    if (target.startsWith('http')) {
      window.open(target, '_blank', 'noopener');
    } else if (target) {
      navigate(target);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {definition.display_text}
              </h3>
              {definition.display_description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {definition.display_description}
                </p>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleClick}
              className="shrink-0"
            >
              <span className="text-xs">Los geht's</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
