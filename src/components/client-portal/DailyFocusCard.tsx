import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useNextBestStep } from '@/hooks/useNextBestStep';
import { supabase } from '@/integrations/supabase/client';

interface FocusAction {
  title: string;
  description: string;
  cta: string;
  path: string;
  emoji: string;
  /** muted | warn | primary */
  tone?: 'muted' | 'warn' | 'primary';
}

/**
 * Returns the SINGLE most important action for the user today.
 * Decision tree (highest priority first):
 *   1. < 7 days old & incomplete journey nudge
 *   2. No snapshot → "Erstelle deinen ersten Snapshot"
 *   3. PeakScore < 3 → "Notgroschen ist kritisch"
 *   4. No 3a entry → "Säule 3a einrichten"
 *   5. Next incomplete task or coach module
 */
function useDailyFocus(): FocusAction | null {
  const { user } = useAuth();
  const uid = user?.id;
  const { score } = usePeakScore();
  const { data: nextStep } = useNextBestStep();

  const isFirstWeek = (() => {
    const createdAt = (user as { created_at?: string } | null)?.created_at;
    if (!createdAt) return false;
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days < 7;
  })();

  const { data: snapshot } = useQuery({
    queryKey: ['daily-focus-snapshot', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('financial_snapshots')
        .select('id, snapshot_data')
        .eq('user_id', uid!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!uid,
  });

  const { data: openTask } = useQuery({
    queryKey: ['daily-focus-task', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_tasks')
        .select('id, title')
        .eq('user_id', uid!)
        .eq('is_completed', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!uid,
  });

  if (!uid) return null;

  // 1. First week + journey nudge
  if (isFirstWeek && nextStep?.primary) {
    return {
      title: nextStep.primary.title,
      description: nextStep.primary.reason,
      cta: 'Loslegen',
      path: nextStep.primary.path,
      emoji: '🎯',
      tone: 'primary',
    };
  }

  // 2. No snapshot
  if (!snapshot) {
    return {
      title: 'Wo steht dein Geld wirklich? →',
      description: 'In 3 Minuten siehst du, wie du wirklich dastehst.',
      cta: 'Snapshot starten',
      path: '/app/client-portal/snapshot',
      emoji: '📸',
      tone: 'primary',
    };
  }

  // 3. PeakScore < 3 → Notgroschen
  if (score !== null && score < 3) {
    return {
      title: 'Dein Notgroschen ist kritisch',
      description: 'Baue zuerst 3 Monatsausgaben als Sicherheitspolster auf.',
      cta: 'Notgroschen-Plan',
      path: '/app/client-portal/coach',
      emoji: '🚨',
      tone: 'warn',
    };
  }

  // 4. No 3a entry in snapshot
  const snapData = (snapshot?.snapshot_data as Record<string, unknown>) || {};
  const has3a = !!(snapData['pillar_3a'] as Record<string, unknown> | undefined)?.amount;
  if (!has3a) {
    return {
      title: 'Säule 3a einrichten',
      description: 'Bis zu CHF 2 100 Steuerersparnis pro Jahr — der wichtigste Hebel.',
      cta: '3a einrichten',
      path: '/app/client-portal/tools',
      emoji: '🏦',
      tone: 'primary',
    };
  }

  // 5. Next incomplete task or coach module
  if (openTask) {
    return {
      title: openTask.title,
      description: 'Deine nächste offene Aufgabe.',
      cta: 'Erledigen',
      path: '/app/client-portal/tasks',
      emoji: '✅',
      tone: 'muted',
    };
  }

  if (nextStep?.primary) {
    return {
      title: nextStep.primary.title,
      description: nextStep.primary.reason,
      cta: 'Weiter',
      path: nextStep.primary.path,
      emoji: '✨',
      tone: 'primary',
    };
  }

  return null;
}

export function DailyFocusCard() {
  const navigate = useNavigate();
  const focus = useDailyFocus();

  if (!focus) return null;

  const toneStyles = {
    primary: 'bg-foreground text-background',
    warn: 'bg-destructive text-destructive-foreground',
    muted: 'bg-card border border-border text-foreground',
  } as const;

  const subTextOpacity = focus.tone === 'muted' ? 'text-muted-foreground' : 'opacity-80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
    >
      <Card
        className={`overflow-hidden cursor-pointer active:scale-[0.99] transition-transform border-0 ${toneStyles[focus.tone || 'primary']}`}
        onClick={() => navigate(focus.path)}
      >
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-background/15 flex items-center justify-center shrink-0 text-2xl">
            {focus.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] uppercase tracking-[0.15em] mb-1 flex items-center gap-1 ${subTextOpacity}`}>
              <Sparkles className="h-3 w-3" />
              Heute im Fokus
            </p>
            <h3 className="text-sm font-bold leading-tight">{focus.title}</h3>
            <p className={`text-xs mt-0.5 line-clamp-2 ${subTextOpacity}`}>
              {focus.description}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 opacity-70" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
