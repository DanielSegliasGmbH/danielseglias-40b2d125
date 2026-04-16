import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { Briefcase, TrendingDown, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  mode?: 'internal' | 'public';
}

const fmtCHF = (v: number) => `CHF ${Math.round(v).toLocaleString('de-CH')}`;

export function HumankapitalTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const navigate = useNavigate();

  // Pre-fill from meta profile
  const [monthlyGross, setMonthlyGross] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('65');
  const [growthRate, setGrowthRate] = useState('1.5');
  const [inflationRate, setInflationRate] = useState('2');
  const [taxRate, setTaxRate] = useState('30');
  const [calculated, setCalculated] = useState(false);

  // Load pre-fill values
  const effectiveMonthly = monthlyGross || String(profile?.monthly_income || '');
  const effectiveAge = currentAge || String(profile?.age || '');

  // Fetch net worth for comparison
  const { data: netWorthData } = useQuery({
    queryKey: ['humankapital-net-worth', user?.id],
    queryFn: async () => {
      if (!user) return { assets: 0, liabilities: 0 };
      const [{ data: a }, { data: l }] = await Promise.all([
        supabase.from('net_worth_assets').select('value').eq('user_id', user.id),
        supabase.from('net_worth_liabilities').select('amount').eq('user_id', user.id),
      ]);
      const totalA = (a || []).reduce((s: number, r: { value: number }) => s + Number(r.value), 0);
      const totalL = (l || []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
      return { assets: totalA, liabilities: totalL };
    },
    enabled: !!user,
  });

  const currentNetWorth = (netWorthData?.assets || 0) - (netWorthData?.liabilities || 0);

  const results = useMemo(() => {
    const salary = parseFloat(effectiveMonthly) * 12;
    const age = parseInt(effectiveAge);
    const retire = parseInt(retirementAge);
    const growth = parseFloat(growthRate) / 100;
    const inflation = parseFloat(inflationRate) / 100;
    const tax = parseFloat(taxRate) / 100;

    if (!salary || !age || !retire || age >= retire) return null;

    const yearsLeft = retire - age;

    // Calculate year-by-year
    const yearlyData: Array<{
      year: number;
      age: number;
      grossIncome: number;
      netIncome: number;
      realIncome: number;
      cumulativeGross: number;
      cumulativeReal: number;
    }> = [];

    let cumulativeGross = 0;
    let cumulativeReal = 0;

    for (let i = 0; i < yearsLeft; i++) {
      const grossIncome = salary * Math.pow(1 + growth, i);
      const netIncome = grossIncome * (1 - tax);
      const realIncome = netIncome / Math.pow(1 + inflation, i);
      cumulativeGross += grossIncome;
      cumulativeReal += realIncome;

      yearlyData.push({
        year: new Date().getFullYear() + i,
        age: age + i,
        grossIncome: Math.round(grossIncome),
        netIncome: Math.round(netIncome),
        realIncome: Math.round(realIncome),
        cumulativeGross: Math.round(cumulativeGross),
        cumulativeReal: Math.round(cumulativeReal),
      });
    }

    const totalGross = cumulativeGross;
    const totalNet = totalGross * (1 - tax);
    const totalReal = cumulativeReal;

    // Milestones at ages 30, 40, 50
    const milestones = [30, 40, 50].map(targetAge => {
      if (targetAge <= age || targetAge >= retire) return null;
      const remainingFromTarget = retire - targetAge;
      let sum = 0;
      for (let i = 0; i < remainingFromTarget; i++) {
        const grossAt = salary * Math.pow(1 + growth, (targetAge - age) + i);
        const netAt = grossAt * (1 - tax);
        sum += netAt / Math.pow(1 + inflation, (targetAge - age) + i);
      }
      return { age: targetAge, value: Math.round(sum) };
    }).filter(Boolean) as Array<{ age: number; value: number }>;

    // Actionable tips
    const extraSavings500 = 500 * 12 * yearsLeft;
    const raiseValue500 = 500 * 12 * yearsLeft * (1 - tax);
    const tenPercentRaise = totalNet * 0.1;

    return {
      totalGross: Math.round(totalGross),
      totalNet: Math.round(totalNet),
      totalReal: Math.round(totalReal),
      yearsLeft,
      yearlyData,
      milestones,
      extraSavings500: Math.round(extraSavings500),
      raiseValue500: Math.round(raiseValue500),
      tenPercentRaise: Math.round(tenPercentRaise),
      ratio: currentNetWorth > 0 ? Math.round(totalReal / currentNetWorth) : null,
    };
  }, [effectiveMonthly, effectiveAge, retirementAge, growthRate, inflationRate, taxRate, currentNetWorth]);

  const handleCalculate = async () => {
    setCalculated(true);
    if (user && results) {
      // Save memory
      await supabase.from('memories').insert({
        user_id: user.id,
        tool_slug: 'humankapital',
        action: 'berechnet',
        input_data: {
          monthly_gross: effectiveMonthly,
          age: effectiveAge,
          retirement_age: retirementAge,
          growth_rate: growthRate,
          inflation_rate: inflationRate,
          tax_rate: taxRate,
        },
        output_data: {
          total_gross: results.totalGross,
          total_net: results.totalNet,
          total_real: results.totalReal,
          years_left: results.yearsLeft,
        },
        title: `Humankapital: ${fmtCHF(results.totalReal)} (real)`,
      });
      // Award XP
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'humankapital',
        points_awarded: 25,
      });
    }
  };

  // Chart data (show every 5th year for readability)
  const chartData = useMemo(() => {
    if (!results) return [];
    return results.yearlyData.filter((_, i) => i % Math.max(1, Math.floor(results.yearlyData.length / 20)) === 0 || i === results.yearlyData.length - 1);
  }, [results]);

  const isValid = parseFloat(effectiveMonthly) > 0 && parseInt(effectiveAge) > 0 && parseInt(effectiveAge) < parseInt(retirementAge);

  return (
    <PdfExportWrapper toolName="Humankapital">
      <div className="space-y-6">
        {/* Inputs */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Monatliches Bruttoeinkommen (CHF)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={effectiveMonthly}
                  onChange={e => setMonthlyGross(e.target.value)}
                  placeholder="z.B. 6500"
                />
                {profile?.monthly_income && !monthlyGross && (
                  <p className="text-[11px] text-primary mt-1">Aus deinem Finanzprofil übernommen</p>
                )}
              </div>
              <div>
                <Label>Aktuelles Alter</Label>
                <Input
                  type="number"
                  min="16"
                  max="70"
                  value={effectiveAge}
                  onChange={e => setCurrentAge(e.target.value)}
                  placeholder="z.B. 30"
                />
                {profile?.age && !currentAge && (
                  <p className="text-[11px] text-primary mt-1">Aus deinem Finanzprofil übernommen</p>
                )}
              </div>
              <div>
                <Label>Pensionsalter</Label>
                <Input
                  type="number"
                  min="50"
                  max="75"
                  value={retirementAge}
                  onChange={e => setRetirementAge(e.target.value)}
                />
              </div>
              <div>
                <Label>Erwartete Lohnsteigerung (% p.a.)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={growthRate}
                  onChange={e => setGrowthRate(e.target.value)}
                />
              </div>
              <div>
                <Label>Erwartete Inflation (% p.a.)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={inflationRate}
                  onChange={e => setInflationRate(e.target.value)}
                />
              </div>
              <div>
                <Label>Steuer- & Abzugsquote (%)</Label>
                <Input
                  type="number"
                  min="10"
                  max="50"
                  step="1"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground mt-1">Inkl. AHV, ALV, BVG — ca. 25–35%</p>
              </div>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={!isValid}
              className="w-full gap-2"
            >
              <Briefcase className="h-4 w-4" /> Humankapital berechnen
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Hero number */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Dein Humankapital</p>
                <PrivateValue className="text-3xl font-bold text-primary">
                  {fmtCHF(results.totalGross)}
                </PrivateValue>
                <p className="text-xs text-muted-foreground mt-2">
                  So viel wirst du in deinen verbleibenden {results.yearsLeft} Berufsjahren brutto verdienen.
                </p>
              </CardContent>
            </Card>

            {/* 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Brutto</p>
                  <PrivateValue className="text-lg font-bold">{fmtCHF(results.totalGross)}</PrivateValue>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Netto (nach Steuern & Abzügen)</p>
                  <PrivateValue className="text-lg font-bold">{fmtCHF(results.totalNet)}</PrivateValue>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Netto real (nach Inflation)</p>
                  <PrivateValue className="text-lg font-bold text-primary">{fmtCHF(results.totalReal)}</PrivateValue>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Chart */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3">Jahreseinkommen bis zur Pension</p>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="age" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Alter', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [fmtCHF(value), name === 'realIncome' ? 'Real (netto)' : 'Kumuliert (real)']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                        labelFormatter={(label: number) => `Alter ${label}`}
                      />
                      <Bar dataKey="realIncome" fill="hsl(var(--primary))" opacity={0.7} radius={[2, 2, 0, 0]} name="Real (netto)" />
                      <Line type="monotone" dataKey="cumulativeReal" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Kumuliert (real)" yAxisId={0} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Wake-up call */}
            {results.milestones.length > 0 && (
            <Card className="border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
                    <p className="text-sm font-semibold">Wichtig zu verstehen:</p>
                  </div>
                  {results.milestones.map(m => (
                    <div key={m.age} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mit {m.age} hast du noch:</span>
                      <PrivateValue className="font-semibold">{fmtCHF(m.value)}</PrivateValue>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-1">
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                    Jeder Tag, an dem du nicht optimierst, verlierst du unwiederbringlich Humankapital.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Comparison with net worth */}
            {currentNetWorth > 0 && results.ratio && (
              <Card>
                <CardContent className="py-5 space-y-2">
                  <p className="text-sm font-medium">Vergleich mit deinem Finanzkapital</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Heutiges Vermögen:</span>
                    <PrivateValue className="font-semibold">{fmtCHF(currentNetWorth)}</PrivateValue>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Humankapital (real):</span>
                    <PrivateValue className="font-semibold text-primary">{fmtCHF(results.totalReal)}</PrivateValue>
                  </div>
                  <p className="text-xs text-primary font-medium pt-1">
                    Dein Humankapital ist {results.ratio}× grösser als dein aktuelles Vermögen. Nutze es weise.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actionable Tips */}
            <Card>
              <CardContent className="py-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Was du daraus machen kannst</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <p>
                      <span className="text-muted-foreground">CHF 500 mehr sparen pro Monat → </span>
                      <PrivateValue className="font-semibold">{fmtCHF(results.extraSavings500)}</PrivateValue>
                      <span className="text-muted-foreground"> über deine Restarbeitszeit</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <p>
                      <span className="text-muted-foreground">CHF 500 Lohnerhöhung → </span>
                      <PrivateValue className="font-semibold">{fmtCHF(results.raiseValue500)}</PrivateValue>
                      <span className="text-muted-foreground"> mehr Humankapital (netto)</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <p>
                      <span className="text-muted-foreground">Weiterbildung mit 10% Lohnsteigerung → wert: </span>
                      <PrivateValue className="font-semibold">{fmtCHF(results.tenPercentRaise)}</PrivateValue>
                    </p>
                  </div>
                </div>

                {mode === 'internal' && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => navigate('/app/client-portal/tools/lohnerhoher')}
                    >
                      Lohnerhöher-Tool öffnen <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => navigate('/app/client-portal/tools/was-kostet-das-wirklich')}
                    >
                      Was kostet das wirklich? <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {mode === 'internal' && (
              <ToolReflection
                question="Was ist dir dein restliches Berufsleben wert?"
                context="Dein Humankapital ist endlich. Jede Investition in dich selbst — Weiterbildung, Gesundheit, Netzwerk — steigert seinen Wert."
              />
            )}
          </motion.div>
        )}

        <ToolTrustNote text="Unabhängige Berechnung — keine individuelle Steuer- oder Lohnberatung." />
      </div>
    </PdfExportWrapper>
  );
}
