import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { usePeakScore } from '@/hooks/usePeakScore';
import { formatPeakScoreDuration } from '@/lib/peakScoreFormat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ListTodo, Zap, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

const formatCHF = (n: number) =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface ActionItem {
  id: string;
  icon: string;
  title: string;
  taskTitle: string;
  route: string;
}

const ACTION_ITEMS: ActionItem[] = [
  { id: 'notgroschen', icon: '🏦', title: 'Notgroschen aufbauen', taskTitle: 'Notgroschen aufbauen: 3-6 Monatsausgaben ansparen', route: '/app/client-portal/net-worth' },
  { id: 'variable', icon: '✂️', title: 'Grösste variable Kosten identifizieren', taskTitle: 'Variable Kosten prüfen und Sparpotenzial finden', route: '/app/client-portal/budget' },
  { id: 'versicherung', icon: '🛡️', title: 'Versicherungs-Check machen', taskTitle: 'Versicherungs-Check durchführen', route: '/app/client-portal/tools/versicherungs-check' },
  { id: 'einkommen', icon: '💡', title: 'Einkommen diversifizieren', taskTitle: 'Möglichkeiten zur Einkommensdiversifizierung recherchieren', route: '/app/client-portal/coach' },
];

export function NotfallCheckTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const { score, totalAssets, totalLiabilities, monthlyExpenses: peakExpenses } = usePeakScore();
  const navigate = useNavigate();

  const defaultExpenses = peakExpenses > 0 ? peakExpenses : (profile?.fixed_costs ?? 4000);
  const defaultSavings = Math.max(0, (profile?.wealth ?? 0));
  // Estimate liquid as ~30% of total assets or wealth
  const estimatedLiquid = totalAssets > 0 ? Math.round(totalAssets * 0.3) : defaultSavings;

  const [monthlyTotal, setMonthlyTotal] = useState(defaultExpenses);
  const [liquidSavings, setLiquidSavings] = useState(estimatedLiquid);
  const [fixedCosts, setFixedCosts] = useState(Math.round(defaultExpenses * 0.65));
  const [variableCosts, setVariableCosts] = useState(Math.round(defaultExpenses * 0.35));
  const [calculated, setCalculated] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Set<string>>(new Set());

  const monthsSurvival = useMemo(() => {
    if (monthlyTotal <= 0) return 0;
    return liquidSavings / monthlyTotal;
  }, [liquidSavings, monthlyTotal]);

  const monthsSurvivalCut = useMemo(() => {
    const reducedExpenses = fixedCosts;
    if (reducedExpenses <= 0) return 0;
    return liquidSavings / reducedExpenses;
  }, [liquidSavings, fixedCosts]);

  const statusColor = monthsSurvival < 3 ? 'destructive' : monthsSurvival < 6 ? 'orange' : 'green';
  const statusBg = monthsSurvival < 3 ? 'bg-destructive/10 border-destructive/30' : monthsSurvival < 6 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30';
  const statusText = monthsSurvival < 3 ? 'text-destructive' : monthsSurvival < 6 ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400';

  const recommendation = monthsSurvival < 3
    ? { icon: '⚠️', text: 'Kritisch. Experten empfehlen mindestens 3-6 Monatsausgaben als Notgroschen.' }
    : monthsSurvival < 6
    ? { icon: '⚡', text: 'Basis vorhanden. Ideal wären 6 Monate für volle Sicherheit.' }
    : { icon: '✅', text: 'Gut aufgestellt! Dein Notgroschen gibt dir Sicherheit.' };

  // PeakScore context
  const peakMonths = score ?? 0;
  const liquidMonths = monthlyTotal > 0 ? liquidSavings / monthlyTotal : 0;
  const illiquidMonths = Math.max(0, peakMonths - liquidMonths);

  const safeNum = (val: string, setter: (n: number) => void) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) setter(n);
    else if (val === '') setter(0);
  };

  const handleCreateTask = async (item: ActionItem) => {
    if (!user) return;
    const { error } = await supabase.from('client_tasks').insert({
      user_id: user.id,
      title: item.taskTitle,
    });
    if (error) {
      toast.error('Aufgabe konnte nicht erstellt werden');
    } else {
      setCreatedTasks(prev => new Set(prev).add(item.id));
      toast.success('Aufgabe erstellt! ✅');
    }
  };

  const handleCalculate = () => {
    setCalculated(true);
    // Award XP
    if (user) {
      supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'notfall-check',
        points_awarded: 20,
      });
    }
  };

  const cardAnim = (i: number) => ({
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.35 } },
  });

  return (
    <PdfExportWrapper toolName="Notfall-Check">
      <div className="space-y-4">
        {/* Inputs */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Monatliche Gesamtausgaben (CHF)</Label>
                <Input type="number" value={monthlyTotal || ''} onChange={(e) => safeNum(e.target.value, setMonthlyTotal)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Liquide Ersparnisse (CHF)</Label>
                <Input type="number" value={liquidSavings || ''} onChange={(e) => safeNum(e.target.value, setLiquidSavings)} />
                <p className="text-[10px] text-muted-foreground">Bank + Bargeld – sofort verfügbar</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fixkosten/Mt. (CHF)</Label>
                <Input type="number" value={fixedCosts || ''} onChange={(e) => safeNum(e.target.value, setFixedCosts)} />
                <p className="text-[10px] text-muted-foreground">Miete, Versicherung…</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Variable Kosten/Mt. (CHF)</Label>
                <Input type="number" value={variableCosts || ''} onChange={(e) => safeNum(e.target.value, setVariableCosts)} />
                <p className="text-[10px] text-muted-foreground">Essen, Freizeit…</p>
              </div>
            </div>
            {!calculated && (
              <Button className="w-full" onClick={handleCalculate}>
                Notfall-Check starten 🆘
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && (
          <div className="space-y-3">
            {/* Section 1: Notfall-Puffer */}
            <motion.div variants={cardAnim(0)} initial="hidden" animate="visible">
              <Card className={cn('border', statusBg)}>
                <CardContent className="p-5 text-center space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Dein Notfall-Puffer</p>
                  <div>
                    <p className={cn('text-5xl font-black', statusText)}>
                      {monthsSurvival.toFixed(1)}
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground">Monate</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Du überlebst <span className={cn('font-bold', statusText)}>{monthsSurvival.toFixed(1)} Monate</span> ohne Einkommen.
                  </p>
                  <div className={cn('rounded-lg p-3 text-sm text-left', statusBg)}>
                    <p>{recommendation.icon} {recommendation.text}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 2: Wenn du sofort sparst */}
            <motion.div variants={cardAnim(1)} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Wenn du sofort sparst</p>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Wenn du alle variablen Kosten streichst:
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <div className="text-center">
                        <p className="text-2xl font-black text-muted-foreground">{monthsSurvival.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Jetzt</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <div className="text-center">
                        <p className="text-2xl font-black text-primary">{monthsSurvivalCut.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Sparmode</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fixkosten (nicht kürzbar)</span>
                      <span className="font-medium">CHF {formatCHF(fixedCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variable Kosten (kürzbar)</span>
                      <span className="font-medium text-primary">CHF {formatCHF(variableCosts)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1">
                      <span className="font-semibold">Sparpotenzial/Monat</span>
                      <span className="font-bold text-primary">CHF {formatCHF(variableCosts)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 3: Aktionsplan */}
            {mode === 'internal' && (
              <motion.div variants={cardAnim(2)} initial="hidden" animate="visible">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Dein Aktionsplan</p>
                    <div className="space-y-2">
                      {ACTION_ITEMS.map((item, i) => (
                        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                          <span className="text-lg shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{i + 1}. {item.title}</p>
                          </div>
                          {createdTasks.has(item.id) ? (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-2 shrink-0"
                              onClick={() => handleCreateTask(item)}
                            >
                              <ListTodo className="h-3 w-3 mr-1" />
                              Aufgabe
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Section 4: PeakScore-Kontext */}
            <motion.div variants={cardAnim(3)} initial="hidden" animate="visible">
              <Card className="bg-muted/30 border-none">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">PeakScore-Kontext</p>
                  <div className="space-y-1.5 text-sm text-center">
                    {score !== null && (
                      <>
                        <p className="text-muted-foreground">
                          Dein PeakScore ist <span className="font-bold text-foreground">{score.toFixed(1)}</span> — das entspricht <span className="font-bold text-primary">{formatPeakScoreDuration(peakMonths)}</span>.
                        </p>
                        <p className="text-muted-foreground">
                          Notgroschen-Anteil: <span className="font-semibold text-foreground">{formatPeakScoreDuration(liquidMonths)}</span>
                        </p>
                        {illiquidMonths > 0 && (
                          <p className="text-muted-foreground">
                            Restliches Vermögen (nicht sofort verfügbar): <span className="font-semibold text-foreground">{formatPeakScoreDuration(illiquidMonths)}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Conversion elements */}
            {mode === 'internal' && (
              <>
                <ToolReflection
                  question="Was wäre, wenn morgen dein Einkommen wegfällt?"
                  context="Ein Notgroschen ist kein Luxus – er ist deine Versicherung gegen das Unerwartete."
                />
                <ToolTrustNote text="Unabhängige Einschätzung – keine Produktempfehlung." />
              </>
            )}
          </div>
        )}
      </div>
    </PdfExportWrapper>
  );
}
