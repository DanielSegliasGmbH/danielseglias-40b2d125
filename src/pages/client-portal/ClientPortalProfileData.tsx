import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PageHeader } from '@/components/client-portal/PageHeader';
import { HamsterAvatar } from '@/components/client-portal/HamsterAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useHamster } from '@/hooks/useHamster';
import { useGoldNuts } from '@/hooks/useGoldNuts';
import { useHamsterSheets } from '@/hooks/useHamsterSheets';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { PROFESSION_OPTIONS } from '@/config/professionConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Save, ChevronDown, Wallet, Landmark, PiggyBank, Database,
  ShieldCheck, Trash2, Crown, Sparkles, Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const FINANCIAL_GOALS = [
  'Finanzielle Freiheit', 'Eigenheim', 'Altersvorsorge optimieren',
  'Vermögensaufbau', 'Schuldenabbau', 'Kinder absichern',
  'Frühpensionierung', 'Anderes',
];

const SWISS_CANTONS = [
  'AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW',
  'OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH',
];

interface ProfileForm {
  first_name: string;
  last_name: string;
  age: number | null;
  occupation: string;
  professional_status: string;
  phone: string;
  canton: string;
  financial_goal: string;
  risk_tolerance: number | null;
  freedom_life_expectancy: number | null;
  freedom_target_age: number | null;
}

const EMPTY_FORM: ProfileForm = {
  first_name: '', last_name: '', age: null, occupation: '',
  professional_status: '', phone: '', canton: '', financial_goal: '',
  risk_tolerance: null, freedom_life_expectancy: null, freedom_target_age: null,
};

export default function ClientPortalProfileData() {
  const { user } = useAuth();
  const { rank, rankName, rankEmoji, rankDescription, coins } = useHamster();
  const { collectedCount, totalPossible } = useGoldNuts();
  const { openInventory } = useHamsterSheets();
  const { score, totalAssets, totalLiabilities } = usePeakScore();
  const { awardPoints } = useGamification();

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [counts, setCounts] = useState<Record<string, { count: number; last: string | null }>>({});
  const [dataInventoryOpen, setDataInventoryOpen] = useState(false);

  // Load profile
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (cancelled || !data) return;
      setProfile(data);
      setForm({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        age: data.age ?? null,
        occupation: data.occupation ?? '',
        professional_status: data.professional_status ?? '',
        phone: data.phone ?? '',
        canton: (data as any).canton ?? '',
        financial_goal: data.financial_goal ?? '',
        risk_tolerance: data.risk_tolerance ?? null,
        freedom_life_expectancy: data.freedom_life_expectancy ?? null,
        freedom_target_age: data.freedom_target_age ?? null,
      });
      setIsDirty(false);
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Load data inventory counts
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const tables = [
        { key: 'snapshots', table: 'financial_snapshots' as const, label: 'Snapshots' },
        { key: 'tasks', table: 'client_tasks' as const, label: 'Aufgaben' },
        { key: 'goals', table: 'client_goals' as const, label: 'Ziele' },
        { key: 'expenses', table: 'budget_expenses' as const, label: 'Ausgaben (Budget)' },
        { key: 'habits', table: 'habits' as const, label: 'Gewohnheiten' },
        { key: 'articles', table: 'article_reads' as const, label: 'Artikel gelesen' },
        { key: 'coach', table: 'coach_progress' as const, label: 'Coach-Fortschritt' },
        { key: 'goldnuts', table: 'gold_nut_collections' as const, label: 'Goldnüsse' },
      ];
      const results: Record<string, { count: number; last: string | null }> = {};
      await Promise.all(tables.map(async ({ key, table }) => {
        const { count } = await supabase.from(table)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        const { data: lastRow } = await supabase.from(table)
          .select('created_at').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(1).maybeSingle();
        results[key] = { count: count ?? 0, last: (lastRow as any)?.created_at ?? null };
      }));
      if (!cancelled) setCounts(results);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleChange = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const payload = {
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      age: form.age,
      occupation: form.occupation || null,
      professional_status: form.professional_status || null,
      phone: form.phone || null,
      financial_goal: form.financial_goal || null,
      risk_tolerance: form.risk_tolerance,
      freedom_life_expectancy: form.freedom_life_expectancy,
      freedom_target_age: form.freedom_target_age,
      last_confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
    setIsSaving(false);
    if (error) {
      console.error('[ProfileData] Save failed:', error);
      toast.error('Fehler beim Speichern');
      return;
    }
    setIsDirty(false);
    toast.success('Gespeichert ✓');
    awardPoints('profile_completed', 'profile_save');
  };

  const dataInventoryRows = useMemo(() => [
    { key: 'snapshots', label: 'Snapshots' },
    { key: 'tasks', label: 'Aufgaben' },
    { key: 'goals', label: 'Ziele' },
    { key: 'expenses', label: 'Ausgaben (Budget)' },
    { key: 'habits', label: 'Gewohnheiten' },
    { key: 'articles', label: 'Artikel gelesen' },
    { key: 'coach', label: 'Coach-Fortschritt' },
    { key: 'goldnuts', label: 'Goldnüsse' },
  ], []);

  const memberSince = user?.created_at
    ? format(parseISO(user.created_at), 'd. MMM yyyy', { locale: de })
    : '–';
  const plan = profile?.plan ?? 'default';
  const netWorth = (totalAssets ?? 0) - (totalLiabilities ?? 0);

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="w-full max-w-3xl mx-auto space-y-5 px-1">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-3xl mx-auto space-y-6 overflow-x-hidden px-1">
        <PageHeader title="🪪 Mein Profil" subtitle="Alles, was FinLife über dich weiss." />

        {/* SECTION 1 — Mein Hamster */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6 pb-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <HamsterAvatar size="lg" />
              <div>
                <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
                  <span aria-hidden>{rankEmoji}</span>{rankName}
                </p>
                <p className="text-xs text-muted-foreground italic max-w-[320px] mt-0.5">
                  {rankDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
                  <span aria-hidden>🪙</span>{coins}
                  <span className="text-muted-foreground font-normal text-xs">Münzen</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-semibold text-foreground">
                  <span aria-hidden>🥜</span>{collectedCount}
                  <span className="text-muted-foreground font-normal text-xs">/ {totalPossible}</span>
                </span>
                {score !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />PeakScore {score.toFixed(1)}
                    <span className="text-muted-foreground font-normal text-xs">Rang {rank}</span>
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openInventory()}
                className="gap-1.5 mt-2"
              >
                <Package className="h-4 w-4" />
                Inventar öffnen
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-muted-foreground">
                <span>Mitglied seit {memberSince}</span>
                <span aria-hidden>•</span>
                <Badge variant={plan === 'premium' ? 'default' : 'secondary'} className="gap-1 text-[10px]">
                  {plan === 'premium' && <Crown className="h-3 w-3" />}
                  {plan === 'premium' ? 'Premium' : 'Basis'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 — Meine Person */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">👤 Meine Person</CardTitle>
            <p className="text-xs text-muted-foreground">Diese Daten kannst du jederzeit anpassen.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Vorname">
                <Input value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} />
              </Field>
              <Field label="Nachname">
                <Input value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} />
              </Field>
              <Field label="Alter">
                <Input type="number" value={form.age ?? ''}
                  onChange={e => handleChange('age', e.target.value === '' ? null : Number(e.target.value))} />
              </Field>
              <Field label="Beruf">
                <Input value={form.occupation} onChange={e => handleChange('occupation', e.target.value)} />
              </Field>
              <Field label="Beruflicher Status">
                <Select value={form.professional_status || undefined}
                  onValueChange={v => handleChange('professional_status', v)}>
                  <SelectTrigger><SelectValue placeholder="Status wählen" /></SelectTrigger>
                  <SelectContent>
                    {PROFESSION_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="E-Mail" hint="Kann hier nicht geändert werden">
                <Input value={user?.email ?? ''} disabled />
              </Field>
              <Field label="Telefon">
                <Input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
              </Field>
              <Field label="Kanton">
                <Select value={form.canton || undefined}
                  onValueChange={v => handleChange('canton', v)}>
                  <SelectTrigger><SelectValue placeholder="Kanton wählen" /></SelectTrigger>
                  <SelectContent>
                    {SWISS_CANTONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Finanzziel">
                <Select value={form.financial_goal || undefined}
                  onValueChange={v => handleChange('financial_goal', v)}>
                  <SelectTrigger><SelectValue placeholder="Ziel wählen" /></SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_GOALS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={`Risikobereitschaft (${form.risk_tolerance ?? '–'}/10)`}>
                <Slider
                  min={1} max={10} step={1}
                  value={[form.risk_tolerance ?? 5]}
                  onValueChange={([v]) => handleChange('risk_tolerance', v)}
                  className="py-3"
                />
              </Field>
              <Field label="Lebenserwartung (Jahre)">
                <Input type="number" value={form.freedom_life_expectancy ?? ''}
                  onChange={e => handleChange('freedom_life_expectancy', e.target.value === '' ? null : Number(e.target.value))} />
              </Field>
              <Field label="Pensionsalter">
                <Input type="number" value={form.freedom_target_age ?? ''}
                  onChange={e => handleChange('freedom_target_age', e.target.value === '' ? null : Number(e.target.value))} />
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button onClick={handleSave} disabled={!isDirty || isSaving} className="gap-2 flex-1 sm:flex-none">
                <Save className="h-4 w-4" />
                {isSaving ? 'Speichere…' : isDirty ? 'Profil speichern' : 'Gespeichert ✓'}
              </Button>
              {profile?.last_confirmed_at && (
                <span className="text-[11px] text-muted-foreground">
                  Zuletzt bestätigt: {format(parseISO(profile.last_confirmed_at), 'dd.MM.yyyy', { locale: de })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3 — Meine Finanzen (Übersicht) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">💰 Meine Finanzen (Übersicht)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FinanceCard icon={Wallet} title="Einkommen" linkTo="/app/client-portal/budget"
                rows={[
                  { label: 'Mtl. Nettoeinkommen', value: formatCHF(profile?.monthly_income) },
                  { label: 'Sparrate', value: formatPercent(profile?.savings_rate) },
                  { label: 'Steuerbelastung', value: formatPercent(profile?.tax_burden) },
                ]} />
              <FinanceCard icon={Landmark} title="Vermögen" linkTo="/app/client-portal/snapshot"
                rows={[
                  { label: 'Gesamtvermögen', value: formatCHF(totalAssets) },
                  { label: 'Verbindlichkeiten', value: formatCHF(totalLiabilities) },
                  { label: 'Nettovermögen', value: formatCHF(netWorth), strong: true },
                ]} />
              <FinanceCard icon={PiggyBank} title="Fixkosten" linkTo="/app/client-portal/budget"
                rows={[
                  { label: 'Mtl. Fixkosten', value: formatCHF(profile?.fixed_costs) },
                ]} />
            </div>
            <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              ℹ️ Diese Werte werden automatisch aktualisiert, wenn du einen neuen Snapshot erstellst.
            </p>
          </CardContent>
        </Card>

        {/* SECTION 4 — Meine Daten (Transparenz) */}
        <Card>
          <Collapsible open={dataInventoryOpen} onOpenChange={setDataInventoryOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-base font-semibold text-foreground">Was speichert FinLife über mich?</p>
                    <p className="text-xs text-muted-foreground">Vollständige Übersicht deiner Daten</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dataInventoryOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Datentyp</th>
                        <th className="px-3 py-2 text-right font-medium">Anzahl</th>
                        <th className="px-3 py-2 text-right font-medium">Letzte Änderung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataInventoryRows.map((row, i) => {
                        const c = counts[row.key];
                        return (
                          <tr key={row.key} className={i % 2 ? 'bg-muted/20' : ''}>
                            <td className="px-3 py-2 text-foreground">{row.label}</td>
                            <td className="px-3 py-2 text-right font-mono text-foreground">{c?.count ?? '–'}</td>
                            <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                              {c?.last ? format(parseISO(c.last), 'dd.MM.yyyy', { locale: de }) : '–'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-xs text-foreground">
                  <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Deine Daten sind sicher. FinLife gibt keine Daten an Dritte weiter.</span>
                </div>

                <Button asChild variant="outline" size="sm" className="mt-3 gap-2 text-destructive hover:text-destructive">
                  <Link to="/app/client-portal/settings">
                    <Trash2 className="h-3.5 w-3.5" />
                    Datenlöschung beantragen
                  </Link>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}

// ── Helpers ──
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function FinanceCard({
  icon: Icon, title, rows, linkTo,
}: {
  icon: React.ElementType;
  title: string;
  rows: { label: string; value: string; strong?: boolean }[];
  linkTo: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="space-y-1.5 flex-1">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={r.strong ? 'font-semibold text-foreground' : 'text-foreground'}>{r.value}</span>
          </div>
        ))}
      </div>
      <Link to={linkTo} className="text-xs text-primary font-medium mt-2.5 hover:underline">
        Bearbeiten →
      </Link>
    </div>
  );
}

function formatCHF(v: number | null | undefined): string {
  if (v === null || v === undefined) return '–';
  return `CHF ${Math.round(Number(v)).toLocaleString('de-CH')}`;
}

function formatPercent(v: number | null | undefined): string {
  if (v === null || v === undefined) return '–';
  return `${Number(v).toFixed(1)}%`;
}
