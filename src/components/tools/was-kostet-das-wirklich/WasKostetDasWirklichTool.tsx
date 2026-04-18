import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { ToolNextStep } from '@/components/tools/ToolNextStep';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { usePeakScore } from '@/hooks/usePeakScore';
import { formatPeakScoreDuration } from '@/lib/peakScoreFormat';
import { calculateWorkTime, calculateFutureValue, getFutureValueOverTime } from './calcLogic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  mode?: 'internal' | 'public';
}

const MOTIVATIONAL_QUOTES = [
  'Deine schlechteste Angewohnheit zu entfernen bringt dich 100× schneller weiter als eine neue Fähigkeit hinzuzufügen.',
  'Reichtum ist nicht, was du verdienst. Reichtum ist, was du behältst.',
  'Jede Stunde Arbeit ist Lebenszeit. Investiere sie weise.',
  'Nicht die Dinge, die wir kaufen, machen uns reich – sondern die, die wir nicht kaufen.',
  'Finanzielle Freiheit beginnt mit dem Bewusstsein, was dich jede Ausgabe wirklich kostet.',
];

const AVERAGE_WORKING_HOURS_PER_MONTH = 173;

const formatCHF = (n: number) =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function WasKostetDasWirklichTool({ mode = 'internal' }: Props) {
  const { profile } = useMetaProfile();
  const { score } = usePeakScore();

  const monthlyIncome = profile?.monthly_income ?? 6000;
  const monthlyExpenses = profile?.fixed_costs ?? 3000;

  const defaultHourly = Math.round((monthlyIncome / AVERAGE_WORKING_HOURS_PER_MONTH) * 100) / 100;

  const [itemName, setItemName] = useState('Neue Jacke');
  const [price, setPrice] = useState(150);
  const [grossHourlyRate, setGrossHourlyRate] = useState(defaultHourly);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(7);
  const [tab, setTab] = useState('arbeitszeit');

  useEffect(() => {
    if (profile?.monthly_income) {
      setGrossHourlyRate(Math.round((profile.monthly_income / AVERAGE_WORKING_HOURS_PER_MONTH) * 100) / 100);
    }
  }, [profile?.monthly_income]);

  const quoteIndex = useMemo(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length), []);

  const workResult = useMemo(
    () => calculateWorkTime({ price, grossHourlyRate, monthlyIncome }),
    [price, grossHourlyRate, monthlyIncome]
  );

  const futureResult = useMemo(
    () => calculateFutureValue({ price, years, returnRate: returnRate / 100, monthlyExpenses }),
    [price, years, returnRate, monthlyExpenses]
  );

  const chartData = useMemo(
    () => getFutureValueOverTime(price, returnRate / 100, years),
    [price, returnRate, years]
  );

  // Freedom days as PeakScore months
  const freedomMonths = monthlyExpenses > 0 ? futureResult.futureValue / monthlyExpenses : 0;

  const safeNum = (val: string, setter: (n: number) => void, min = 0) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= min) setter(n);
    else if (val === '') setter(0);
  };

  return (
    <PdfExportWrapper toolName="Was kostet das wirklich">
      <div className="space-y-4">
        {/* Inputs */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Was möchtest du kaufen?</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="z.B. Neue Jacke"
              />
            </div>
            <div className="space-y-2">
              <Label>Preis (CHF)</Label>
              <Input
                type="number"
                value={price || ''}
                onChange={(e) => safeNum(e.target.value, setPrice)}
                min={0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arbeitszeit" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              In Arbeitszeit
            </TabsTrigger>
            <TabsTrigger value="zukunftswert" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              In Zukunftswert
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Arbeitszeit */}
          <TabsContent value="arbeitszeit" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label>Dein Brutto-Stundenlohn (CHF)</Label>
                  <Input
                    type="number"
                    value={grossHourlyRate || ''}
                    onChange={(e) => safeNum(e.target.value, setGrossHourlyRate, 1)}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Berechnet aus deinem Monatseinkommen ÷ {AVERAGE_WORKING_HOURS_PER_MONTH} Arbeitsstunden
                  </p>
                </div>
              </CardContent>
            </Card>

            {price > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5 text-center space-y-4">
                    {/* Big number */}
                    <div>
                      <p className="text-4xl font-black text-foreground">
                        {workResult.hoursNeeded.toFixed(1)}
                      </p>
                      <p className="text-lg font-semibold text-muted-foreground">Stunden Arbeit</p>
                    </div>

                    {/* Visual clock */}
                    <div className="flex justify-center">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="16" fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeDasharray={`${Math.min(100, (workResult.hoursNeeded / 8) * 100)} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Sentence */}
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Du musst <span className="font-bold text-foreground">
                        {workResult.fullHours} Stunde{workResult.fullHours !== 1 ? 'n' : ''}{workResult.remainingMinutes > 0 ? ` und ${workResult.remainingMinutes} Minuten` : ''}
                      </span> arbeiten, um dir <span className="font-bold text-foreground">{itemName || 'das'}</span> leisten zu können.
                    </p>

                    {/* Breakdown */}
                    <div className="text-left space-y-1 bg-background/60 rounded-lg p-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brutto-Stundenlohn</span>
                        <span className="font-medium">CHF {workResult.grossHourlyRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">– Sozialversicherungen (13%)</span>
                        <span className="font-medium">CHF {workResult.afterSozial.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">– Steuern (~{Math.round(workResult.taxRate * 100)}%)</span>
                        <span className="font-medium">CHF {workResult.afterTax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-1 flex justify-between font-semibold">
                        <span>Realer Netto-Stundenlohn</span>
                        <span>CHF {workResult.netHourlyRate.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Motivational quote */}
            <Card className="border-none bg-muted/30">
              <CardContent className="py-4 px-5">
                <p className="text-sm italic text-muted-foreground text-center leading-relaxed">
                  «{MOTIVATIONAL_QUOTES[quoteIndex]}»
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Zukunftswert */}
          <TabsContent value="zukunftswert" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Anlagehorizont: {years} Jahre</Label>
                  <Slider
                    value={[years]}
                    onValueChange={([v]) => setYears(v)}
                    min={5}
                    max={30}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Erwartete Rendite: {returnRate}%</Label>
                  <Slider
                    value={[returnRate]}
                    onValueChange={([v]) => setReturnRate(v)}
                    min={3}
                    max={12}
                    step={0.5}
                  />
                </div>
              </CardContent>
            </Card>

            {price > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5 text-center space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Deine <span className="font-semibold text-foreground">{itemName || 'Ausgabe'}</span> für CHF {formatCHF(price)} wäre in {years} Jahren
                      </p>
                      <p className="text-4xl font-black text-foreground mt-1">
                        CHF {formatCHF(Math.round(futureResult.futureValue))}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">wert.</p>
                    </div>

                    {/* Freedom days */}
                    {freedomMonths > 0 && (
                      <div className="bg-background/60 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          Das sind <span className="font-bold text-primary">{formatPeakScoreDuration(freedomMonths)}</span> mehr finanzielle Freiheit.
                        </p>
                      </div>
                    )}

                    {/* Fun comparison */}
                    <div className="bg-background/60 rounded-lg p-3">
                      <p className="text-sm font-medium text-foreground">{futureResult.comparison}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart */}
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">Wertentwicklung über {years} Jahre</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="year"
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(v) => `${v}J`}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            width={40}
                          />
                          <Tooltip
                            formatter={(value: number) => [`CHF ${formatCHF(value)}`, 'Wert']}
                            labelFormatter={(l) => `Jahr ${l}`}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={i === chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Conversion elements */}
        {mode === 'internal' && (
          <>
            <ToolReflection
              question="Brauchst du das wirklich – oder willst du es nur?"
              context="Oft verwechseln wir Wünsche mit Bedürfnissen. Nimm dir einen Moment."
            />
            <ToolNextStep
              primary={{
                question: 'Wie steht es um dein Budget?',
                description: 'Prüfe deine Einnahmen und Ausgaben.',
                targetSlug: 'budget',
                buttonLabel: 'Mein Budget prüfen',
              }}
            />
            <ToolTrustNote text="Unabhängige Berechnung – keine Produktempfehlung." />
          </>
        )}
      </div>
    </PdfExportWrapper>
  );
}
