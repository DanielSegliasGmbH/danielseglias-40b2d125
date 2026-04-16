import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ArrowRight, Info, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Props {
  mode?: 'internal' | 'public';
}

const fmtCHF = (v: number) => `CHF ${Math.round(v).toLocaleString('de-CH')}`;

// Swiss social insurance rates (employee share)
const RATES = {
  ahvIvEo: 0.053,   // 5.3%
  alv: 0.011,        // 1.1%
  bvg: 0.075,        // ~7.5% average (varies by age/plan)
  uvg: 0,            // employer-paid (NBU)
  uvgNbu: 0.01,      // ~1% NBU employee
};

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.75)',
  'hsl(var(--primary) / 0.55)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.25)',
];

const OECD_AVG_RATE = 36; // OECD average social contribution + tax burden %

export function SozialabgabenUebersichtTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const navigate = useNavigate();

  const [grossIncome, setGrossIncome] = useState('');
  const [monthlyKK, setMonthlyKK] = useState('');
  const [workingYears, setWorkingYears] = useState('');
  const [bvgRate, setBvgRate] = useState('7.5');
  const [calculated, setCalculated] = useState(false);

  const effectiveIncome = grossIncome || String((profile?.monthly_income || 0) * 12 || '');
  const effectiveYears = workingYears || String(profile?.age ? Math.max(0, (profile.age) - 20) : '');

  const results = useMemo(() => {
    const income = parseFloat(effectiveIncome);
    const kk = parseFloat(monthlyKK) || 400; // default ~400/month
    const years = parseInt(effectiveYears) || 0;
    const bvgPct = parseFloat(bvgRate) / 100;

    if (!income || income <= 0) return null;

    // Annual contributions
    const ahvIvEo = Math.round(income * RATES.ahvIvEo);
    const alv = Math.round(income * RATES.alv);
    const bvg = Math.round(income * bvgPct);
    const uvgNbu = Math.round(income * RATES.uvgNbu);
    const kkAnnual = Math.round(kk * 12);
    const totalAnnual = ahvIvEo + alv + bvg + uvgNbu + kkAnnual;
    const totalMonthly = Math.round(totalAnnual / 12);

    // Percentage of income
    const pctOfIncome = Math.round((totalAnnual / income) * 1000) / 10;

    // Lifetime totals (simplified: current rates × years)
    const lifetimeAhv = ahvIvEo * years;
    const lifetimeAlv = alv * years;
    const lifetimeBvg = bvg * years;
    const lifetimeUvg = uvgNbu * years;
    const lifetimeKK = kkAnnual * years;
    const lifetimeTotal = lifetimeAhv + lifetimeAlv + lifetimeBvg + lifetimeUvg + lifetimeKK;

    // Pie data
    const pieData = [
      { name: 'AHV/IV/EO', value: ahvIvEo, monthly: Math.round(ahvIvEo / 12) },
      { name: 'ALV', value: alv, monthly: Math.round(alv / 12) },
      { name: 'BVG (PK)', value: bvg, monthly: Math.round(bvg / 12) },
      { name: 'UVG (NBU)', value: uvgNbu, monthly: Math.round(uvgNbu / 12) },
      { name: 'Krankenkasse', value: kkAnnual, monthly: Math.round(kk) },
    ];

    // Table data
    const tableData = [
      { name: 'AHV/IV/EO', monthly: Math.round(ahvIvEo / 12), lifetime: lifetimeAhv, benefit: 'AHV-Rente' },
      { name: 'ALV', monthly: Math.round(alv / 12), lifetime: lifetimeAlv, benefit: 'Arbeitslosenentschädigung' },
      { name: 'BVG (Pensionskasse)', monthly: Math.round(bvg / 12), lifetime: lifetimeBvg, benefit: 'PK-Rente / Kapital' },
      { name: 'UVG (Nichtberufsunfall)', monthly: Math.round(uvgNbu / 12), lifetime: lifetimeUvg, benefit: 'Unfallversicherung' },
      { name: 'Krankenkasse (KVG)', monthly: Math.round(kk), lifetime: lifetimeKK, benefit: 'Medizinische Versorgung' },
    ];

    // Timeline: last 10 years with assumed 2% income growth backwards
    const timelineData = [];
    for (let i = 9; i >= 0; i--) {
      const yearIncome = income / Math.pow(1.02, i);
      const yearSocial = yearIncome * (RATES.ahvIvEo + RATES.alv + bvgPct + RATES.uvgNbu) + kkAnnual;
      const yearPct = Math.round((yearSocial / yearIncome) * 100 * 10) / 10;
      timelineData.push({
        year: new Date().getFullYear() - i,
        einkommen: Math.round(yearIncome),
        sozialabgaben: Math.round(yearSocial),
        anteil: yearPct,
      });
    }

    return {
      totalAnnual,
      totalMonthly,
      pctOfIncome,
      lifetimeTotal,
      pieData,
      tableData,
      timelineData,
      ahvIvEo,
      alv,
      bvg,
      uvgNbu,
      kkAnnual,
    };
  }, [effectiveIncome, monthlyKK, effectiveYears, bvgRate]);

  const handleCalculate = async () => {
    setCalculated(true);
    if (user) {
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'sozialabgaben-uebersicht',
        points_awarded: 15,
      });
    }
  };

  const isValid = parseFloat(effectiveIncome) > 0;

  return (
    <PdfExportWrapper toolName="Sozialabgaben-Übersicht">
      <div className="space-y-6">
        {/* Inputs */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Jahresbruttoeinkommen (CHF)</Label>
                <Input type="number" min="0" step="1000" value={effectiveIncome} onChange={e => setGrossIncome(e.target.value)} placeholder="z.B. 85000" />
                {profile?.monthly_income && !grossIncome && (
                  <p className="text-[11px] text-primary mt-1">Aus deinem Finanzprofil übernommen</p>
                )}
              </div>
              <div>
                <Label>Monatliche KK-Prämie (CHF)</Label>
                <Input type="number" min="0" step="10" value={monthlyKK} onChange={e => setMonthlyKK(e.target.value)} placeholder="z.B. 420" />
              </div>
              <div>
                <Label>Bisherige Arbeitsjahre</Label>
                <Input type="number" min="0" max="50" value={effectiveYears} onChange={e => setWorkingYears(e.target.value)} placeholder="z.B. 12" />
                {profile?.age && !workingYears && (
                  <p className="text-[11px] text-primary mt-1">Geschätzt aus deinem Alter</p>
                )}
              </div>
              <div>
                <Label>BVG-Beitragssatz (%)</Label>
                <Input type="number" min="5" max="25" step="0.5" value={bvgRate} onChange={e => setBvgRate(e.target.value)} />
                <p className="text-[11px] text-muted-foreground mt-1">Arbeitnehmeranteil, typisch 7–18%</p>
              </div>
            </div>
            <Button onClick={handleCalculate} disabled={!isValid} className="w-full gap-2">
              <Shield className="h-4 w-4" /> Sozialabgaben berechnen
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && results && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Hero */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Dein Solidaritätsbeitrag — bisher bezahlt</p>
                <PrivateValue className="text-3xl font-bold text-primary">{fmtCHF(results.lifetimeTotal)}</PrivateValue>
                <p className="text-sm text-muted-foreground mt-2">
                  Aktuell: <PrivateValue className="inline font-medium">{fmtCHF(results.totalMonthly)}</PrivateValue> / Monat
                  ({results.pctOfIncome}% deines Einkommens)
                </p>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3">Jährliche Sozialabgaben nach Kategorie</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-[200px] w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {results.pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [fmtCHF(value), '']}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {results.pieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                          <span className="text-muted-foreground">{entry.name}</span>
                        </div>
                        <PrivateValue className="font-medium">{fmtCHF(entry.value)}</PrivateValue>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-sm font-semibold pt-1 border-t border-border">
                      <span>Total</span>
                      <PrivateValue>{fmtCHF(results.totalAnnual)}</PrivateValue>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3">Übersicht aller Sozialversicherungen</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-xs text-muted-foreground font-medium">Versicherung</th>
                        <th className="text-right py-2 text-xs text-muted-foreground font-medium">Monatlich</th>
                        <th className="text-right py-2 text-xs text-muted-foreground font-medium">Bisher total</th>
                        <th className="text-left py-2 text-xs text-muted-foreground font-medium hidden sm:table-cell">Leistung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.tableData.map(row => (
                        <tr key={row.name} className="border-b border-border/50">
                          <td className="py-2 text-xs">{row.name}</td>
                          <td className="py-2 text-right"><PrivateValue className="text-xs font-medium">{fmtCHF(row.monthly)}</PrivateValue></td>
                          <td className="py-2 text-right"><PrivateValue className="text-xs">{fmtCHF(row.lifetime)}</PrivateValue></td>
                          <td className="py-2 text-xs text-muted-foreground hidden sm:table-cell">{row.benefit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3">Entwicklung der letzten 10 Jahre (geschätzt)</p>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.timelineData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [fmtCHF(value), name === 'einkommen' ? 'Einkommen' : 'Sozialabgaben']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                      />
                      <Legend formatter={v => v === 'einkommen' ? 'Einkommen' : 'Sozialabgaben'} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="einkommen" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="sozialabgaben" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Context */}
            <Card>
              <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Einordnung</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  In der Schweiz zahlst du etwa <strong>{results.pctOfIncome}%</strong> deines Bruttoeinkommens in Sozialversicherungen.
                  Der OECD-Durchschnitt liegt bei ca. <strong>{OECD_AVG_RATE}%</strong> (inkl. Steuern und Sozialabgaben).
                </p>
              </CardContent>
            </Card>

            {/* Educational */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Optimierungspotenzial</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Viele dieser Abgaben sind nicht freiwillig. Aber manche — <strong>Krankenkasse</strong> und <strong>Säule 3a</strong> — kannst du optimieren.
                  Das macht oft tausende Franken pro Jahr aus.
                </p>
              </CardContent>
            </Card>

            {/* Links */}
            {mode === 'internal' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate('/app/client-portal/tools/ahv-tracker')}>
                  AHV-Tracker öffnen <ArrowRight className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate('/app/client-portal/tools/krankenkassen-tracker')}>
                  Krankenkassen-Tracker öffnen <ArrowRight className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate('/app/client-portal/tools/steuerrechner')}>
                  Steuer-Check öffnen <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Snapshot */}
            {mode === 'internal' && (
              <ToolSnapshotButton
                toolSlug="sozialabgaben-uebersicht"
                toolName="Sozialabgaben-Übersicht"
                snapshotData={{
                  totalAnnual: results.totalAnnual,
                  lifetimeTotal: results.lifetimeTotal,
                  pctOfIncome: results.pctOfIncome,
                  ahvIvEo: results.ahvIvEo,
                  bvg: results.bvg,
                  kkAnnual: results.kkAnnual,
                }}
              />
            )}

            {mode === 'internal' && (
              <ToolReflection
                question="Weisst du, was du für all diese Beiträge zurückbekommst?"
                context="Die meisten kennen ihre Sozialabgaben nicht — dabei sind sie einer der grössten Ausgabenposten überhaupt."
              />
            )}
          </motion.div>
        )}

        <ToolTrustNote text="Schätzung basierend auf aktuellen Beitragssätzen. Individuelle Abweichungen möglich." />
      </div>
    </PdfExportWrapper>
  );
}
