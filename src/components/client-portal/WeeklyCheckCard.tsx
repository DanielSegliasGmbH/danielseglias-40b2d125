import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWeeklyCheck } from '@/hooks/useRitualSystem';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Check, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUS_OPTIONS = [
  { emoji: '💸', label: 'Eine Ausgabe reduzieren' },
  { emoji: '🔧', label: 'Ein Tool nutzen' },
  { emoji: '📖', label: 'Ein Artikel lesen' },
  { emoji: '👥', label: 'Mit Freund vergleichen' },
];

export function WeeklyCheckCard() {
  const { shouldShowWeekly, saveReflection } = useWeeklyCheck();
  const { points, streakDays, awardPoints } = useGamification();
  const { score } = usePeakScore();
  const [step, setStep] = useState<'overview' | 'focus' | 'done'>('overview');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [customFocus, setCustomFocus] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (!shouldShowWeekly || dismissed) return null;

  const handleComplete = async () => {
    const focus = selectedFocus === 'custom' ? customFocus : selectedFocus;
    try {
      await saveReflection.mutateAsync({
        peak_score_change: 0,
        tasks_completed: 0,
        xp_earned: points,
        focus_next_week: focus || null,
      });
      // Award 30 XP (3 × tool_used at 10 each)
      for (let i = 0; i < 3; i++) {
        await awardPoints('tool_used', `weekly-check-${i}-${Date.now()}`);
      }
      toast.success('+30 XP für deinen Sonntag-Check! ✨');
      setStep('done');
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            {step === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">🗓️ Sonntag-Check</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Deine Woche im Rückblick:</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <MetricBox label="PeakScore" value={String(score)} />
                  <MetricBox label="Streak" value={`${streakDays}🔥`} />
                  <MetricBox label="XP" value={String(points)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => setStep('focus')}>
                  Weiter →
                </Button>
              </motion.div>
            )}

            {step === 'focus' && (
              <motion.div
                key="focus"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  Eine Sache für nächste Woche:
                </p>
                <div className="space-y-1.5 mb-3">
                  {FOCUS_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedFocus(opt.label)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border",
                        selectedFocus === opt.label
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedFocus('custom')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border",
                      selectedFocus === 'custom'
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    ✏️ Eigene Wahl
                  </button>
                  {selectedFocus === 'custom' && (
                    <Input
                      value={customFocus}
                      onChange={e => setCustomFocus(e.target.value)}
                      placeholder="Dein Fokus..."
                      className="h-9 text-sm mt-1"
                      autoFocus
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDismissed(true)}>
                    Überspringen
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={handleComplete}
                    disabled={!selectedFocus || saveReflection.isPending}
                  >
                    <Check className="h-3.5 w-3.5" /> Fertig
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2"
              >
                <p className="text-lg">✅</p>
                <p className="text-sm font-medium text-foreground">Sonntag-Check erledigt!</p>
                <p className="text-xs text-muted-foreground">+30 XP</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-lg p-2 text-center border border-border/50">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
