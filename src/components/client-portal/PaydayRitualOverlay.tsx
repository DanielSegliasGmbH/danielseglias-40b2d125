import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, Check } from 'lucide-react';
import { usePaydayRitual } from '@/hooks/useRitualSystem';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { RankAvatar } from '@/components/client-portal/RankAvatar';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatCHF(n: number): string {
  return n.toLocaleString('de-CH', { maximumFractionDigits: 0 });
}

export function PaydayRitualOverlay() {
  const { shouldShowRitual, saveRitual } = usePaydayRitual();
  const { points, streakDays, awardPoints } = useGamification();
  const { score, totalAssets, totalLiabilities, monthlyExpenses } = usePeakScore();
  const { futureSelfName } = useUserAvatar();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);

  // Allocation form
  const monthlyIncome = totalAssets > 0 ? Math.round(totalAssets * 0.05) : 5000; // rough estimate
  const [allocation, setAllocation] = useState({
    fixkosten: Math.round(monthlyExpenses * 0.5),
    notgroschen: Math.round(monthlyExpenses * 0.1),
    investment: Math.round(monthlyExpenses * 0.2),
    spass: Math.round(monthlyExpenses * 0.2),
  });
  const [intention, setIntention] = useState('');

  if (!shouldShowRitual || dismissed) return null;

  const handleComplete = async () => {
    try {
      await saveRitual.mutateAsync({
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: allocation.notgroschen + allocation.investment,
        allocation_data: allocation,
        monthly_intention: intention || null,
        streak_count: streakDays,
      });
      await awardPoints('tool_used', `payday-ritual-${Date.now()}`);
      // Extra XP for ritual (awardPoints gives 10 for tool_used, we want 100 total)
      for (let i = 0; i < 9; i++) {
        await awardPoints('tool_used', `payday-bonus-${i}-${Date.now()}`);
      }
      toast.success('+100 XP für dein Payday-Ritual! 🎉');
      setDismissed(true);
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  const steps = [
    // STEP 0: Month summary
    <StepWrapper key="summary">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6">
        Dein Monat ist vollbracht.
      </p>
      <div className="space-y-3 w-full max-w-xs mx-auto">
        <SummaryRow label="PeakScore" value={String(score)} />
        <SummaryRow label="Ausgaben" value={`CHF ${formatCHF(monthlyExpenses)}`} />
        <SummaryRow label="Streak" value={`${streakDays} Tage 🔥`} />
        <SummaryRow label="XP gesamt" value={String(points)} />
      </div>
      <Button className="mt-8 gap-2" onClick={() => setStep(1)}>
        Weiter <ArrowRight className="h-4 w-4" />
      </Button>
    </StepWrapper>,

    // STEP 1: Allocation
    <StepWrapper key="allocation">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Deine Aufteilung
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Passe deine monatliche Aufteilung an:
      </p>
      <div className="space-y-3 w-full max-w-xs mx-auto">
        {([
          { key: 'fixkosten', label: '🏠 Fixkosten', hint: 'automatisch' },
          { key: 'notgroschen', label: '🛡️ Notgroschen', hint: '' },
          { key: 'investment', label: '📈 Investment', hint: '' },
          { key: 'spass', label: '🎉 Spass', hint: '' },
        ] as const).map(item => (
          <div key={item.key} className="flex items-center gap-3">
            <span className="text-sm w-28 text-left">{item.label}</span>
            <div className="flex-1 relative">
              <Input
                type="number"
                value={allocation[item.key]}
                onChange={e => setAllocation(prev => ({
                  ...prev,
                  [item.key]: Number(e.target.value) || 0,
                }))}
                className="h-9 text-sm pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-6 gap-2" onClick={() => setStep(2)}>
        Weiter <ArrowRight className="h-4 w-4" />
      </Button>
    </StepWrapper>,

    // STEP 2: Intention
    <StepWrapper key="intention">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Deine Intention
      </p>
      <p className="text-base text-foreground/80 mb-4">
        Was ist dein Fokus für den kommenden Monat?
      </p>
      <div className="w-full max-w-xs mx-auto">
        <Input
          value={intention}
          onChange={e => setIntention(e.target.value)}
          placeholder="z.B. Sparrate um 5% erhöhen"
          className="text-base h-12"
          autoFocus
        />
      </div>
      <Button className="mt-6 gap-2" onClick={() => setStep(3)}>
        Weiter <ArrowRight className="h-4 w-4" />
      </Button>
    </StepWrapper>,

    // STEP 3: Avatar celebration
    <StepWrapper key="celebration">
      <div className="flex items-center justify-center gap-4 mb-6">
        <RankAvatar rank={1} size="lg" />
        <div className="text-2xl">→</div>
        <RankAvatar rank={6} size="lg" isFutureSelf />
      </div>
      <p className="text-lg font-semibold text-foreground mb-2">
        Dein Zukunfts-Ich ist dabei.
      </p>
      <p className="text-base text-muted-foreground">
        {futureSelfName || 'Dein Zukunfts-Ich'} nickt anerkennend. 👏
      </p>
      <Button className="mt-8 gap-2" size="lg" onClick={handleComplete} disabled={saveRitual.isPending}>
        <Check className="h-4 w-4" /> Ritual abschliessen
      </Button>
    </StepWrapper>,
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[85] bg-background/98 flex items-center justify-center overflow-y-auto"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground z-10"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 8px) + 8px)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        <div className="w-full max-w-lg mx-auto px-6 py-16">
          <AnimatePresence mode="wait">
            {steps[step]}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center"
    >
      {children}
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30">
      <span className="text-sm text-muted-foreground">{label}</span>
      <PrivateValue className="text-sm font-semibold text-foreground">{value}</PrivateValue>
    </div>
  );
}
