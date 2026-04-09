import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass, Sparkles, MessageSquare, CalendarCheck, BookOpen, Wrench, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NextStep, NextBestStepResult } from '@/hooks/useNextBestStep';

const TYPE_ICONS: Record<string, typeof Wrench> = {
  tool: Wrench,
  module: Sparkles,
  coach: Sparkles,
  chat: MessageSquare,
  cta: CalendarCheck,
  library: BookOpen,
  profile: UserCircle,
};

function StepIcon({ type }: { type: string }) {
  const Icon = TYPE_ICONS[type] || Compass;
  return (
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-6 w-6 text-primary" />
    </div>
  );
}

interface NextStepCardProps {
  result: NextBestStepResult;
}

export function NextStepCard({ result }: NextStepCardProps) {
  const navigate = useNavigate();
  const { primary, secondary } = result;

  if (!primary) return null;

  return (
    <div className="space-y-3">
      {/* Primary recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          className="border-primary/20 bg-primary/5 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] touch-manipulation"
          onClick={() => navigate(primary.path)}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <StepIcon type={primary.type} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">
                  Dein nächster Schritt
                </p>
                <h2 className="text-base font-bold text-foreground mb-1">
                  {primary.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {primary.reason}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary recommendation */}
      {secondary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
        >
          <Card
            className="border-border cursor-pointer transition-all hover:border-primary/20 hover:shadow-sm active:scale-[0.98] touch-manipulation"
            onClick={() => navigate(secondary.path)}
          >
            <CardContent className="py-3.5 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {(() => { const Icon = TYPE_ICONS[secondary.type] || Compass; return <Icon className="h-4 w-4 text-muted-foreground" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{secondary.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{secondary.reason}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
