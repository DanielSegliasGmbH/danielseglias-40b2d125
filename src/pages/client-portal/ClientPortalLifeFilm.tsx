import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useGamification } from '@/hooks/useGamification';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Film, Check } from 'lucide-react';

const LIFE_GOALS = [
  { id: 'eigenheim', emoji: '🏠', label: 'Eigenheim kaufen' },
  { id: 'familie', emoji: '👨‍👩‍👧‍👦', label: 'Familie gründen' },
  { id: 'reisen', emoji: '✈️', label: 'Viel reisen' },
  { id: 'fruehpension', emoji: '🔥', label: 'Frühpension / Teilzeit ab 50' },
  { id: 'traumauto', emoji: '🚗', label: 'Traumauto' },
  { id: 'weiterbildung', emoji: '📚', label: 'Weiterbildung / Umschulung' },
  { id: 'unternehmen', emoji: '💼', label: 'Eigenes Unternehmen gründen' },
  { id: 'auswandern', emoji: '🌍', label: 'Auswandern' },
];

const CHILDREN_OPTIONS = ['0', '1', '2', '3+'];

const TOTAL_STEPS = 8;

export default function ClientPortalLifeFilm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { profile: metaProfile } = useMetaProfile();
  const { awardPoints } = useGamification();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [totalSavings, setTotalSavings] = useState('');
  const [lifeGoals, setLifeGoals] = useState<string[]>([]);
  const [desiredChildren, setDesiredChildren] = useState('0');
  const [retirementAge, setRetirementAge] = useState(60);
  const [truthMode, setTruthMode] = useState<'optimistic' | 'realistic' | null>(null);

  // Pre-fill from meta profile
  useEffect(() => {
    if (metaProfile) {
      if (metaProfile.age && !age) setAge(String(metaProfile.age));
      if (metaProfile.monthly_income && !monthlyIncome) setMonthlyIncome(String(metaProfile.monthly_income));
      if (metaProfile.fixed_costs && !monthlyExpenses) setMonthlyExpenses(String(metaProfile.fixed_costs));
      if (metaProfile.wealth && !totalSavings) setTotalSavings(String(metaProfile.wealth));
    }
  }, [metaProfile]);

  // Check if already completed
  const { data: existingData } = useQuery({
    queryKey: ['life-film-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('life_film_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        user_id: user.id,
        age: age ? parseInt(age) : null,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
        monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses) : null,
        total_savings: totalSavings ? parseFloat(totalSavings) : null,
        life_goals: lifeGoals,
        desired_children: desiredChildren,
        target_retirement_age: retirementAge,
        truth_mode: truthMode || 'optimistic',
        completed: true,
      };
      
      if (existingData) {
        const { error } = await supabase
          .from('life_film_data')
          .update(payload)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('life_film_data')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-film-data'] });
      awardPoints('life_film_completed', `life_film_${Date.now()}`);
      // Navigate to film result
      navigate('/app/client-portal/life-film-result');
    },
  });

  const progressPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!age;
      case 1: return !!monthlyIncome;
      case 2: return !!monthlyExpenses;
      case 3: return !!totalSavings;
      case 4: return lifeGoals.length > 0;
      case 5: return true;
      case 6: return true;
      case 7: return truthMode !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      saveMutation.mutate();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleGoal = (id: string) => {
    setLifeGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const renderStep = () => {
    const variants = {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -40 },
    };

    switch (step) {
      case 0:
        return (
          <motion.div key="s0" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">🎂</div>
            <h2 className="text-xl font-bold text-foreground">Wie alt bist du?</h2>
            <Input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="z.B. 30"
              className="text-center text-2xl font-bold max-w-[200px] mx-auto h-14"
              min={16}
              max={99}
            />
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="s1" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">💰</div>
            <h2 className="text-xl font-bold text-foreground">Was ist dein monatliches Einkommen (brutto)?</h2>
            <div className="relative max-w-[280px] mx-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">CHF</span>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(e.target.value)}
                placeholder="z.B. 6000"
                className="text-center text-2xl font-bold pl-14 h-14"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="s2" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">📊</div>
            <h2 className="text-xl font-bold text-foreground">Wie viel gibst du monatlich aus?</h2>
            <div className="relative max-w-[280px] mx-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">CHF</span>
              <Input
                type="number"
                value={monthlyExpenses}
                onChange={e => setMonthlyExpenses(e.target.value)}
                placeholder="z.B. 4500"
                className="text-center text-2xl font-bold pl-14 h-14"
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="s3" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">🏦</div>
            <h2 className="text-xl font-bold text-foreground">Wie viel hast du aktuell gespart/investiert?</h2>
            <div className="relative max-w-[280px] mx-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">CHF</span>
              <Input
                type="number"
                value={totalSavings}
                onChange={e => setTotalSavings(e.target.value)}
                placeholder="z.B. 25000"
                className="text-center text-2xl font-bold pl-14 h-14"
              />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="s4" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">🎯</div>
            <h2 className="text-xl font-bold text-foreground">Was sind deine Lebensziele?</h2>
            <p className="text-sm text-muted-foreground">Wähle alle die zutreffen</p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {LIFE_GOALS.map(goal => {
                const selected = lifeGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm',
                      selected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/30 hover:bg-accent/50'
                    )}
                  >
                    <span className="text-lg shrink-0">{goal.emoji}</span>
                    <span className={cn('font-medium', selected && 'text-primary')}>{goal.label}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="s5" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">👶</div>
            <h2 className="text-xl font-bold text-foreground">Wie viele Kinder möchtest du (haben)?</h2>
            <div className="flex justify-center gap-3">
              {CHILDREN_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setDesiredChildren(opt)}
                  className={cn(
                    'w-16 h-16 rounded-2xl border-2 text-lg font-bold transition-all',
                    desiredChildren === opt
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30 text-muted-foreground'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="s6" {...variants} className="space-y-8 text-center">
            <div className="text-4xl">⏰</div>
            <h2 className="text-xl font-bold text-foreground">In welchem Alter möchtest du aufhören MÜSSEN zu arbeiten?</h2>
            <div className="max-w-sm mx-auto space-y-4">
              <div className="text-5xl font-bold text-primary">{retirementAge}</div>
              <Slider
                value={[retirementAge]}
                onValueChange={v => setRetirementAge(v[0])}
                min={50}
                max={70}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50</span>
                <span>60</span>
                <span>70</span>
              </div>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div key="s7" {...variants} className="space-y-6 text-center">
            <div className="text-4xl">🎬</div>
            <h2 className="text-xl font-bold text-foreground">Wie willst du die Wahrheit?</h2>
            <p className="text-sm text-muted-foreground">Wähle deinen Modus für den Lebensfilm</p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button
                onClick={() => setTruthMode('optimistic')}
                className={cn(
                  'p-5 rounded-2xl border-2 text-left transition-all',
                  truthMode === 'optimistic'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-border hover:border-emerald-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌸</span>
                  <div>
                    <p className="font-bold text-foreground">Optimistisch</p>
                    <p className="text-xs text-muted-foreground">Zeig mir die positive Version</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setTruthMode('realistic')}
                className={cn(
                  'p-5 rounded-2xl border-2 text-left transition-all',
                  truthMode === 'realistic'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-border hover:border-red-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="font-bold text-foreground">Knallhart</p>
                    <p className="text-xs text-muted-foreground">Zeig mir die harte Realität</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-lg mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step === 0 ? navigate(-1) : handleBack()} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold text-foreground">Dein Lebensfilm</h1>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground font-medium">{step + 1}/{TOTAL_STEPS}</span>
            </div>
          </div>
        </div>

        {/* Step content */}
        <Card className="min-h-[380px] flex items-center justify-center">
          <CardContent className="p-6 w-full">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück
          </Button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === step ? 'bg-primary w-4' : i < step ? 'bg-primary/40' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={!canProceed() || saveMutation.isPending}
            className="gap-1"
          >
            {step === TOTAL_STEPS - 1 ? (
              <>
                Film starten
                <Film className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Weiter
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>

        {/* XP hint */}
        <div className="text-center mt-4">
          <Badge variant="secondary" className="text-[10px] gap-1">
            🎬 +150 XP für deinen Lebensfilm
          </Badge>
        </div>
      </div>
    </ClientPortalLayout>
  );
}
