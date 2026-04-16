import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, ChevronDown, Lightbulb, ArrowRight, Info, TrendingDown, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ALL_CANTONS,
  SUPPORTED_CANTONS,
  calculateSwissTax,
  type TaxInput,
  type TaxResult,
} from '@/config/swissTaxData';

interface Props {
  mode?: 'internal' | 'public';
}

const fmtCHF = (v: number) => `CHF ${Math.round(v).toLocaleString('de-CH')}`;

const CONFESSIONS = [
  { value: 'reformiert', label: 'Reformiert' },
  { value: 'katholisch', label: 'Katholisch' },
  { value: 'andere', label: 'Andere' },
  { value: 'keine', label: 'Keine / Konfessionslos' },
];

const CIVIL_STATUSES = [
  { value: 'single', label: 'Ledig' },
  { value: 'married', label: 'Verheiratet' },
  { value: 'partnership', label: 'Eingetragene Partnerschaft' },
];

export function SteuerrechnerTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();

  // Form state
  const [canton, setCanton] = useState('');
  const [gemeinde, setGemeinde] = useState('');
  const [civilStatus, setCivilStatus] = useState<'single' | 'married' | 'partnership'>('single');
  const [children, setChildren] = useState('0');
  const [confession, setConfession] = useState<'reformiert' | 'katholisch' | 'andere' | 'keine'>('keine');
  const [grossIncome, setGrossIncome] = useState('');
  const [contribution3a, setContribution3a] = useState('');
  const [pkEinkauf, setPkEinkauf] = useState('');
  const [profExpenses, setProfExpenses] = useState('');
  const [furtherEd, setFurtherEd] = useState('');
  const [healthCosts, setHealthCosts] = useState('');
  const [donations, setDonations] = useState('');
  const [mortgageInterest, setMortgageInterest] = useState('');
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState('');
  const [calculated, setCalculated] = useState(false);

  // Pre-fill
  const effectiveIncome = grossIncome || String((profile?.monthly_income || 0) * 12 || '');
  const effectiveCanton = canton || '';

  const isSupported = SUPPORTED_CANTONS.includes(effectiveCanton);

  const result: TaxResult | null = useMemo(() => {
    const income = parseFloat(effectiveIncome);
    if (!income || income <= 0 || !effectiveCanton) return null;

    const defaultProf = parseFloat(profExpenses) || Math.max(2000, income * 0.03);

    const input: TaxInput = {
      canton: effectiveCanton,
      civilStatus,
      children: parseInt(children) || 0,
      confession,
      grossIncome: income,
      contribution3a: parseFloat(contribution3a) || 0,
      pkEinkauf: parseFloat(pkEinkauf) || 0,
      professionalExpenses: defaultProf,
      furtherEducation: parseFloat(furtherEd) || 0,
      healthCosts: parseFloat(healthCosts) || 0,
      donations: parseFloat(donations) || 0,
      mortgageInterest: parseFloat(mortgageInterest) || 0,
    };

    return calculateSwissTax(input);
  }, [effectiveIncome, effectiveCanton, civilStatus, children, confession, contribution3a, pkEinkauf, profExpenses, furtherEd, healthCosts, donations, mortgageInterest]);

  const handleCalculate = async () => {
    setCalculated(true);
    if (user && result) {
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'steuerrechner',
        points_awarded: 25,
      });
    }
  };

  const paidAmount = parseFloat(alreadyPaid) || 0;
  const difference = result ? result.totalTax - paidAmount : 0;

  // Chart data for breakdown
  const chartData = result ? [
    { name: 'Bundessteuer', value: result.federalTax, color: 'hsl(var(--primary))' },
    { name: 'Kantonssteuer', value: result.cantonalTax, color: 'hsl(var(--primary) / 0.7)' },
    { name: 'Gemeindesteuer', value: result.municipalTax, color: 'hsl(var(--primary) / 0.5)' },
    ...(result.churchTax > 0 ? [{ name: 'Kirchensteuer', value: result.churchTax, color: 'hsl(var(--primary) / 0.3)' }] : []),
  ] : [];

  const isValid = parseFloat(effectiveIncome) > 0 && effectiveCanton;

  // Swiss median effective tax rate ~12%
  const medianRate = 12;

  return (
    <PdfExportWrapper toolName="Steuerrechner Schweiz">
      <div className="space-y-6">
        {/* Inputs */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Canton */}
              <div>
                <Label>Kanton</Label>
                <Select value={effectiveCanton} onValueChange={setCanton}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kanton wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CANTONS.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.code})
                        {!SUPPORTED_CANTONS.includes(c.code) && ' — Durchschnitt'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {effectiveCanton && !isSupported && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Für diesen Kanton wird der Schweizer Durchschnitt verwendet.
                  </p>
                )}
              </div>

              {/* Gemeinde */}
              <div>
                <Label>Gemeinde (optional)</Label>
                <Input
                  value={gemeinde}
                  onChange={e => setGemeinde(e.target.value)}
                  placeholder="z.B. Winterthur"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Die Gemeinde beeinflusst den Steuerfuss. Es wird der Kantonsdurchschnitt verwendet.
                </p>
              </div>

              {/* Civil status */}
              <div>
                <Label>Zivilstand</Label>
                <Select value={civilStatus} onValueChange={v => setCivilStatus(v as 'single' | 'married' | 'partnership')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CIVIL_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Children */}
              <div>
                <Label>Anzahl Kinder</Label>
                <Select value={children} onValueChange={setChildren}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Confession */}
              <div>
                <Label>Konfession</Label>
                <Select value={confession} onValueChange={v => setConfession(v as typeof confession)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFESSIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gross income */}
              <div>
                <Label>Jahresbruttoeinkommen (CHF)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={effectiveIncome}
                  onChange={e => setGrossIncome(e.target.value)}
                  placeholder="z.B. 85000"
                />
                {profile?.monthly_income && !grossIncome && (
                  <p className="text-[11px] text-primary mt-1">Aus deinem Finanzprofil übernommen</p>
                )}
              </div>

              {/* 3a */}
              <div>
                <Label>Säule 3a Beitrag (CHF)</Label>
                <Input
                  type="number"
                  min="0"
                  max="7258"
                  value={contribution3a}
                  onChange={e => setContribution3a(e.target.value)}
                  placeholder="0 – 7'258"
                />
              </div>

              {/* PK Einkauf */}
              <div>
                <Label>PK-Einkauf dieses Jahr (CHF)</Label>
                <Input
                  type="number"
                  min="0"
                  value={pkEinkauf}
                  onChange={e => setPkEinkauf(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Collapsible deductions */}
            <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2">
                <ChevronDown className={cn("h-4 w-4 transition-transform", deductionsOpen && "rotate-180")} />
                Weitere Abzüge (optional)
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-xs">Berufskosten (CHF)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={profExpenses}
                      onChange={e => setProfExpenses(e.target.value)}
                      placeholder="Standard: 3% oder CHF 2'000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weiterbildungskosten (CHF)</Label>
                    <Input type="number" min="0" value={furtherEd} onChange={e => setFurtherEd(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs">Krankheitskosten (CHF)</Label>
                    <Input type="number" min="0" value={healthCosts} onChange={e => setHealthCosts(e.target.value)} placeholder="Über Selbstbehalt" />
                  </div>
                  <div>
                    <Label className="text-xs">Spenden (CHF)</Label>
                    <Input type="number" min="0" value={donations} onChange={e => setDonations(e.target.value)} placeholder="0" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Hypothekarzinsen (CHF)</Label>
                    <Input type="number" min="0" value={mortgageInterest} onChange={e => setMortgageInterest(e.target.value)} placeholder="0" />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button
              onClick={handleCalculate}
              disabled={!isValid}
              className="w-full gap-2"
            >
              <Receipt className="h-4 w-4" /> Steuern berechnen
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Hero */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Deine geschätzte Steuerbelastung</p>
                <PrivateValue className="text-3xl font-bold text-primary">
                  {fmtCHF(result.totalTax)} / Jahr
                </PrivateValue>
                <p className="text-sm text-muted-foreground mt-2">
                  Das sind <span className="font-semibold text-foreground">{result.effectiveRate}%</span> deines Einkommens.
                </p>
                {result.isApproximation && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                    <Info className="h-3 w-3" /> Näherungswert (Schweizer Durchschnitt)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Breakdown cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="py-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Bundessteuer</p>
                  <PrivateValue className="text-sm font-bold">{fmtCHF(result.federalTax)}</PrivateValue>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Kantonssteuer</p>
                  <PrivateValue className="text-sm font-bold">{fmtCHF(result.cantonalTax)}</PrivateValue>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Gemeindesteuer</p>
                  <PrivateValue className="text-sm font-bold">{fmtCHF(result.municipalTax)}</PrivateValue>
                </CardContent>
              </Card>
              {result.churchTax > 0 && (
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Kirchensteuer</p>
                    <PrivateValue className="text-sm font-bold">{fmtCHF(result.churchTax)}</PrivateValue>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chart */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3">Steueraufteilung</p>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={100} />
                      <Tooltip
                        formatter={(value: number) => [fmtCHF(value), '']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Comparison to median */}
            <Card>
              <CardContent className="py-5">
                <p className="text-sm font-medium mb-3">Vergleich zum Schweizer Median</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Schweizer Median:</span>
                    <span className="font-medium">{medianRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deine Belastung:</span>
                    <span className={cn("font-semibold", result.effectiveRate > medianRate ? 'text-destructive' : 'text-primary')}>
                      {result.effectiveRate}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-primary/30 rounded-full"
                      style={{ width: `${Math.min(100, (medianRate / 40) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-1 bg-muted-foreground"
                      style={{ left: `${Math.min(100, (medianRate / 40) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-2.5 bg-primary rounded-full"
                      style={{ left: `${Math.min(97, (result.effectiveRate / 40) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span>40%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimization tips */}
            {(result.remaining3a > 0 || result.savingsPkExample > 0) && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Optimierungspotenzial</p>
                  </div>
                  {result.remaining3a > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                      <p>
                        <span className="text-muted-foreground">Säule 3a maximieren (+{fmtCHF(result.remaining3a)}) → </span>
                        <span className="font-semibold">ca. {fmtCHF(result.savings3aMax)} Steuern sparen</span>
                      </p>
                    </div>
                  )}
                  {result.savingsPkExample > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                      <p>
                        <span className="text-muted-foreground">PK-Einkauf von CHF 10'000 → </span>
                        <span className="font-semibold">ca. {fmtCHF(result.savingsPkExample)} Steuern sparen</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Track payments */}
            <Card>
              <CardContent className="py-5 space-y-3">
                <p className="text-sm font-medium">Bereits bezahlt dieses Jahr</p>
                <Input
                  type="number"
                  min="0"
                  value={alreadyPaid}
                  onChange={e => setAlreadyPaid(e.target.value)}
                  placeholder="CHF bereits bezahlt"
                />
                {paidAmount > 0 && (
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-medium p-3 rounded-lg",
                    difference > 0 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  )}>
                    {difference > 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4" />
                        <span>Noch offen: <PrivateValue className="inline">{fmtCHF(difference)}</PrivateValue></span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Zu viel bezahlt: <PrivateValue className="inline">{fmtCHF(Math.abs(difference))}</PrivateValue> (Rückerstattung erwartbar)</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Snapshot button */}
            {mode === 'internal' && result && (
              <ToolSnapshotButton
                toolSlug="steuerrechner"
                toolName="Steuerrechner Schweiz"
                snapshotData={{
                  canton: effectiveCanton,
                  grossIncome: parseFloat(effectiveIncome),
                  totalTax: result.totalTax,
                  effectiveRate: result.effectiveRate,
                  federalTax: result.federalTax,
                  cantonalTax: result.cantonalTax,
                  municipalTax: result.municipalTax,
                  churchTax: result.churchTax,
                }}
              />
            )}

            {/* Disclaimer */}
            <Card className="border-muted bg-muted/30">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ⚠️ Diese Berechnung ist eine <strong>Schätzung</strong> basierend auf vereinfachten Steuertabellen.
                  Für die definitive Berechnung nutze die offizielle Steuersoftware deines Kantons (z.B. ZH TaxMe, BE TaxInfo).
                  Individuelle Faktoren wie Liegenschaftssteuer, Vermögenssteuer oder Sonderfälle sind nicht berücksichtigt.
                </p>
              </CardContent>
            </Card>

            {mode === 'internal' && (
              <ToolReflection
                question="Nutzt du alle legalen Steueroptimierungen, die dir zustehen?"
                context="Viele Schweizer verschenken jährlich Tausende Franken, weil sie Abzüge nicht kennen oder die Säule 3a nicht maximieren."
              />
            )}
          </motion.div>
        )}

        <ToolTrustNote text="Unabhängige Schätzung — keine Steuerberatung. Vereinfachte Berechnung." />
      </div>
    </PdfExportWrapper>
  );
}
