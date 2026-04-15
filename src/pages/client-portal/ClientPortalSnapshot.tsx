import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Camera, History, TrendingUp, TrendingDown, Minus,
  ArrowLeft, ArrowRight, Loader2, Trash2, ChevronRight,
  Info, ExternalLink, Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// ── Types ──────────────────────────────────────────

interface SnapshotFieldValue {
  amount: string;
  provider?: string;
  link?: string;
  skipped: boolean;
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: string;
  link: string;
}

interface Valuable {
  id: string;
  name: string;
  value: string;
  category: string;
}

interface SnapshotDraft {
  // Step 0: Vorsorge
  pillar_3a: SnapshotFieldValue;
  freizuegigkeit: SnapshotFieldValue;
  pensionskasse: SnapshotFieldValue;
  ahv_annual: SnapshotFieldValue;
  // Step 1: Bankkonten & Bargeld
  bank_accounts: BankAccount[];
  bank_accounts_skipped: boolean;
  cash: SnapshotFieldValue;
  valuables: Valuable[];
  valuables_skipped: boolean;
  // Step 2: Vermögen
  savings: SnapshotFieldValue;
  investments: SnapshotFieldValue;
  real_estate: SnapshotFieldValue;
  emergency_fund: SnapshotFieldValue;
  // Step 3: Verbindlichkeiten
  mortgage: SnapshotFieldValue;
  consumer_debt: SnapshotFieldValue;
  other_debt: SnapshotFieldValue;
  // Step 4: Einkommen & Ausgaben
  monthly_income: SnapshotFieldValue;
  monthly_expenses: SnapshotFieldValue;
  insurance_monthly: SnapshotFieldValue;
  // Summary
  notes: string;
}

const DEFAULT_FIELD: SnapshotFieldValue = { amount: '', provider: '', link: '', skipped: false };

const newBankAccount = (): BankAccount => ({
  id: crypto.randomUUID(),
  name: '',
  bank: '',
  balance: '',
  link: '',
});

const newValuable = (): Valuable => ({
  id: crypto.randomUUID(),
  name: '',
  value: '',
  category: '',
});

const EMPTY_DRAFT: SnapshotDraft = {
  pillar_3a: { ...DEFAULT_FIELD },
  freizuegigkeit: { ...DEFAULT_FIELD },
  pensionskasse: { ...DEFAULT_FIELD },
  ahv_annual: { ...DEFAULT_FIELD },
  bank_accounts: [newBankAccount()],
  bank_accounts_skipped: false,
  cash: { ...DEFAULT_FIELD },
  valuables: [],
  valuables_skipped: false,
  savings: { ...DEFAULT_FIELD },
  investments: { ...DEFAULT_FIELD },
  real_estate: { ...DEFAULT_FIELD },
  emergency_fund: { ...DEFAULT_FIELD },
  mortgage: { ...DEFAULT_FIELD },
  consumer_debt: { ...DEFAULT_FIELD },
  other_debt: { ...DEFAULT_FIELD },
  monthly_income: { ...DEFAULT_FIELD },
  monthly_expenses: { ...DEFAULT_FIELD },
  insurance_monthly: { ...DEFAULT_FIELD },
  notes: '',
};

const VALUABLE_CATEGORIES = [
  { value: 'gold_silver', label: 'Gold/Silber' },
  { value: 'watches', label: 'Uhren' },
  { value: 'jewelry', label: 'Schmuck' },
  { value: 'art', label: 'Kunst' },
  { value: 'other', label: 'Sonstiges' },
];

// ── Step definitions ───────────────────────────────

interface FieldConfig {
  key: keyof SnapshotDraft;
  label: string;
  emoji: string;
  hint?: string;
  moreLink?: string;
  showProvider?: boolean;
  showLink?: boolean;
  isCHF?: boolean;
}

interface StepConfig {
  title: string;
  emoji: string;
  type: 'fields' | 'bank_cash';
  fields?: FieldConfig[];
}

const STEPS: StepConfig[] = [
  {
    title: 'Vorsorge',
    emoji: '🏛️',
    type: 'fields',
    fields: [
      {
        key: 'pillar_3a',
        label: 'Säule 3a',
        emoji: '💎',
        hint: 'Du findest den Betrag auf deinem 3a-Kontoauszug oder im Online-Portal.',
        moreLink: '/app/client-portal/library',
        showProvider: true,
        showLink: true,
        isCHF: true,
      },
      {
        key: 'freizuegigkeit',
        label: 'Freizügigkeit',
        emoji: '🔄',
        hint: 'Falls du in der Vergangenheit die Stelle gewechselt hast, könnte hier Geld liegen.',
        moreLink: '/app/client-portal/library',
        showProvider: true,
        showLink: true,
        isCHF: true,
      },
      {
        key: 'pensionskasse',
        label: 'Pensionskasse (BVG)',
        emoji: '🏛️',
        hint: "Diesen Betrag findest du auf deinem Pensionskassenausweis unter 'Austrittsleistung' oder 'Freizügigkeitsleistung'.",
        moreLink: '/app/client-portal/library',
        showProvider: true,
        showLink: true,
        isCHF: true,
      },
      {
        key: 'ahv_annual',
        label: 'AHV (geschätzte Jahresrente)',
        emoji: '🇨🇭',
        hint: 'Deine AHV-Rente wird basierend auf deinem Einkommen geschätzt. Du kannst den genauen Betrag bei deiner Ausgleichskasse anfragen.',
        isCHF: true,
      },
    ],
  },
  {
    title: 'Bankkonten & Bargeld',
    emoji: '🏦',
    type: 'bank_cash',
  },
  {
    title: 'Vermögen',
    emoji: '💰',
    type: 'fields',
    fields: [
      { key: 'investments', label: 'Investitionen (Aktien, ETFs etc.)', emoji: '📈', isCHF: true, showProvider: true, showLink: true },
      { key: 'real_estate', label: 'Immobilien (Marktwert)', emoji: '🏠', isCHF: true },
      { key: 'emergency_fund', label: 'Notgroschen', emoji: '🛡️', isCHF: true, hint: 'Dein finanzielles Sicherheitspolster für Notfälle.' },
    ],
  },
  {
    title: 'Verbindlichkeiten',
    emoji: '📉',
    type: 'fields',
    fields: [
      { key: 'mortgage', label: 'Hypothek', emoji: '🏠', isCHF: true, showProvider: true },
      { key: 'consumer_debt', label: 'Konsumschulden / Leasing', emoji: '💳', isCHF: true },
      { key: 'other_debt', label: 'Sonstige Schulden', emoji: '📋', isCHF: true },
    ],
  },
  {
    title: 'Einkommen & Ausgaben',
    emoji: '💸',
    type: 'fields',
    fields: [
      { key: 'monthly_income', label: 'Monatliches Nettoeinkommen', emoji: '💰', isCHF: true },
      { key: 'monthly_expenses', label: 'Monatliche Ausgaben (gesamt)', emoji: '🛒', isCHF: true },
      { key: 'insurance_monthly', label: 'Versicherungen (monatlich)', emoji: '🔒', isCHF: true },
    ],
  },
];

const TOTAL_STEPS = STEPS.length + 1; // +1 for summary

// ── Helpers ────────────────────────────────────────

function n(v: string | undefined): number { return Number(v) || 0; }

function sumBankAccounts(accounts: BankAccount[]): number {
  return accounts.reduce((sum, a) => sum + n(a.balance), 0);
}

function sumValuables(items: Valuable[]): number {
  return items.reduce((sum, v) => sum + n(v.value), 0);
}

function computeNetWorth(d: SnapshotDraft): number {
  const bankTotal = d.bank_accounts_skipped ? 0 : sumBankAccounts(d.bank_accounts);
  const cashTotal = d.cash.skipped ? 0 : n(d.cash.amount);
  const valuablesTotal = d.valuables_skipped ? 0 : sumValuables(d.valuables);
  return bankTotal + cashTotal + valuablesTotal +
    n(d.investments.amount) + n(d.real_estate.amount) + n(d.emergency_fund.amount) +
    n(d.pillar_3a.amount) + n(d.freizuegigkeit.amount) + n(d.pensionskasse.amount) -
    n(d.mortgage.amount) - n(d.consumer_debt.amount) - n(d.other_debt.amount);
}

// ── Field labels for history display ───────────────
const STATIC_FIELD_LABELS: Record<string, { label: string; emoji: string }> = {};
STEPS.forEach(step => step.fields?.forEach(f => {
  STATIC_FIELD_LABELS[f.key as string] = { label: f.label, emoji: f.emoji };
}));
// Add cash
STATIC_FIELD_LABELS['cash'] = { label: 'Bargeld', emoji: '💵' };

// ── Main component ────────────────────────────────

export default function ClientPortalSnapshot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const [draft, setDraft] = useState<SnapshotDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState('new');
  const [saving, setSaving] = useState(false);
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // ── Load snapshots ──
  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['financial-snapshots', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('financial_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // ── Load draft ──
  const { data: savedDraft } = useQuery({
    queryKey: ['snapshot-draft', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('snapshot_drafts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // ── Load meta profile for AHV suggestion ──
  const { data: metaProfile } = useQuery({
    queryKey: ['meta-profile-snapshot', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('meta_profiles').select('monthly_income').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Restore draft on load
  useEffect(() => {
    if (savedDraft?.draft_data) {
      try {
        const parsed = savedDraft.draft_data as unknown as SnapshotDraft;
        const merged: SnapshotDraft = { ...EMPTY_DRAFT };
        // Restore simple fields
        const simpleKeys: (keyof SnapshotDraft)[] = [
          'pillar_3a', 'freizuegigkeit', 'pensionskasse', 'ahv_annual', 'cash',
          'savings', 'investments', 'real_estate', 'emergency_fund',
          'mortgage', 'consumer_debt', 'other_debt',
          'monthly_income', 'monthly_expenses', 'insurance_monthly',
        ];
        for (const key of simpleKeys) {
          if (parsed[key] && typeof parsed[key] === 'object' && 'amount' in (parsed[key] as any)) {
            (merged as any)[key] = { ...DEFAULT_FIELD, ...(parsed[key] as SnapshotFieldValue) };
          }
        }
        merged.notes = (parsed.notes as string) || '';
        // Restore dynamic lists
        if (Array.isArray(parsed.bank_accounts) && parsed.bank_accounts.length > 0) {
          merged.bank_accounts = parsed.bank_accounts;
        }
        merged.bank_accounts_skipped = !!parsed.bank_accounts_skipped;
        if (Array.isArray(parsed.valuables)) {
          merged.valuables = parsed.valuables;
        }
        merged.valuables_skipped = !!parsed.valuables_skipped;
        setDraft(merged);
        setStep(savedDraft.current_step || 0);
      } catch { /* ignore parse errors */ }
    }
  }, [savedDraft]);

  // ── Auto-save draft ──
  const saveDraft = useCallback(async (d: SnapshotDraft, currentStep: number) => {
    if (!user) return;
    await supabase.from('snapshot_drafts').upsert({
      user_id: user.id,
      draft_data: d as any,
      current_step: currentStep,
    }, { onConflict: 'user_id' });
  }, [user]);

  const debouncedSave = useCallback((d: SnapshotDraft, currentStep: number) => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => saveDraft(d, currentStep), 1500);
  }, [saveDraft]);

  // ── Field updaters ──
  const updateField = (key: keyof SnapshotDraft, field: keyof SnapshotFieldValue, value: string | boolean) => {
    setDraft(prev => {
      const updated = {
        ...prev,
        [key]: { ...(prev[key] as SnapshotFieldValue), [field]: value },
      };
      debouncedSave(updated, step);
      return updated;
    });
  };

  const updateAmount = (key: keyof SnapshotDraft, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    updateField(key, 'amount', cleaned);
  };

  // ── Dynamic list updaters ──
  const updateDraft = useCallback((updater: (prev: SnapshotDraft) => SnapshotDraft) => {
    setDraft(prev => {
      const updated = updater(prev);
      debouncedSave(updated, step);
      return updated;
    });
  }, [debouncedSave, step]);

  const lastSnapshot = snapshots[0] || null;

  // ── Save final snapshot ──
  const handleSave = async () => {
    if (!user) return;
    const netWorth = computeNetWorth(draft);
    setSaving(true);
    try {
      const { error } = await supabase.from('financial_snapshots').insert({
        user_id: user.id,
        snapshot_data: draft as any,
        net_worth: netWorth,
        notes: draft.notes || null,
      });
      if (error) throw error;

      await supabase.from('snapshot_drafts').delete().eq('user_id', user.id);
      queryClient.invalidateQueries({ queryKey: ['snapshot-draft'] });

      await awardPoints('snapshot_completed', 'snapshot_' + Date.now());
      queryClient.invalidateQueries({ queryKey: ['financial-snapshots'] });
      toast({ title: 'Snapshot gespeichert! 📸', description: '+100 XP verdient' });
      setDraft(EMPTY_DRAFT);
      setStep(0);
      setTab('history');
    } catch {
      toast({ title: 'Fehler', description: 'Snapshot konnte nicht gespeichert werden.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteSnapshot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_snapshots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-snapshots'] });
      toast({ title: 'Snapshot gelöscht' });
    },
  });

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;
  const isSummary = step === STEPS.length;
  const currentStepConfig = STEPS[step] || null;

  const ahvSuggestion = metaProfile?.monthly_income
    ? Math.round(Number(metaProfile.monthly_income) * 12 * 0.044).toString()
    : undefined;

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Mein Snapshot</h1>
            <p className="text-xs text-muted-foreground">Deine finanzielle Momentaufnahme</p>
          </div>
          {lastSnapshot ? (
            <Badge variant="outline" className="text-[10px]">
              Letzter: {format(new Date(lastSnapshot.created_at), 'dd. MMM yyyy', { locale: de })}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">Noch kein Snapshot</Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="new" className="flex-1 gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Neuer Snapshot
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              <History className="h-3.5 w-3.5" /> Verlauf
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: Neuer Snapshot ── */}
          <TabsContent value="new" className="space-y-4 mt-4">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Schritt {step + 1} von {TOTAL_STEPS}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
              <div className="flex gap-1">
                {STEPS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { saveDraft(draft, i); setStep(i); }}
                    className={cn(
                      "flex-1 text-[9px] py-1 rounded transition-colors text-center",
                      i === step ? "bg-primary/15 text-primary font-semibold" : i < step ? "bg-muted text-muted-foreground" : "text-muted-foreground/50"
                    )}
                  >
                    {s.emoji} {s.title}
                  </button>
                ))}
                <button
                  onClick={() => { saveDraft(draft, STEPS.length); setStep(STEPS.length); }}
                  className={cn(
                    "flex-1 text-[9px] py-1 rounded transition-colors text-center",
                    isSummary ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground/50"
                  )}
                >
                  ✅ Fertig
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {isSummary ? (
                  <SummaryStep draft={draft} onNotesChange={(v) => setDraft(prev => ({ ...prev, notes: v }))} />
                ) : currentStepConfig?.type === 'bank_cash' ? (
                  <BankCashStep draft={draft} updateDraft={updateDraft} updateField={updateField} updateAmount={updateAmount} />
                ) : currentStepConfig?.type === 'fields' && currentStepConfig.fields ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentStepConfig.emoji}</span>
                      <h2 className="text-base font-bold text-foreground">{currentStepConfig.title}</h2>
                    </div>
                    {currentStepConfig.fields.map((field) => (
                      <SnapshotFieldCard
                        key={field.key as string}
                        config={field}
                        value={draft[field.key] as SnapshotFieldValue}
                        onChange={(f, v) => updateField(field.key, f, v)}
                        onAmountChange={(v) => updateAmount(field.key, v)}
                        ahvSuggestion={field.key === 'ahv_annual' ? ahvSuggestion : undefined}
                      />
                    ))}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="outline" className="flex-1" onClick={() => { saveDraft(draft, step - 1); setStep(step - 1); }}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
                </Button>
              )}
              {!isSummary ? (
                <Button className="flex-1" onClick={() => { saveDraft(draft, step + 1); setStep(step + 1); }}>
                  Weiter <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button className="flex-1 h-12 text-base font-semibold" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gespeichert...</>
                  ) : (
                    <>📸 Snapshot speichern · +100 XP</>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>

          {/* ── TAB: Verlauf ── */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : snapshots.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Camera className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="font-semibold text-foreground mb-1">Noch kein Snapshot</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erstelle deinen ersten Finanz-Snapshot und verfolge deine Entwicklung.
                  </p>
                  <Button variant="outline" onClick={() => setTab('new')}>Jetzt starten</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {snapshots.length >= 2 && <ComparisonBanner current={snapshots[0]} previous={snapshots[1]} />}
                {snapshots.map((snap: any, idx: number) => (
                  <HistoryCard
                    key={snap.id}
                    snapshot={snap}
                    previous={snapshots[idx + 1] || null}
                    onDelete={() => deleteSnapshot.mutate(snap.id)}
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientPortalLayout>
  );
}

// ── Bank & Cash Step ──────────────────────────────

function BankCashStep({
  draft, updateDraft, updateField, updateAmount,
}: {
  draft: SnapshotDraft;
  updateDraft: (fn: (prev: SnapshotDraft) => SnapshotDraft) => void;
  updateField: (key: keyof SnapshotDraft, field: keyof SnapshotFieldValue, value: string | boolean) => void;
  updateAmount: (key: keyof SnapshotDraft, value: string) => void;
}) {
  const addAccount = () => updateDraft(d => ({ ...d, bank_accounts: [...d.bank_accounts, newBankAccount()] }));
  const removeAccount = (id: string) => updateDraft(d => ({
    ...d, bank_accounts: d.bank_accounts.filter(a => a.id !== id),
  }));
  const updateAccount = (id: string, field: keyof BankAccount, value: string) => updateDraft(d => ({
    ...d,
    bank_accounts: d.bank_accounts.map(a => a.id === id ? { ...a, [field]: field === 'balance' ? value.replace(/[^0-9.]/g, '') : value } : a),
  }));

  const addValuable = () => updateDraft(d => ({ ...d, valuables: [...d.valuables, newValuable()] }));
  const removeValuable = (id: string) => updateDraft(d => ({
    ...d, valuables: d.valuables.filter(v => v.id !== id),
  }));
  const updateValuableField = (id: string, field: keyof Valuable, value: string) => updateDraft(d => ({
    ...d,
    valuables: d.valuables.map(v => v.id === id ? { ...v, [field]: field === 'value' ? value.replace(/[^0-9.]/g, '') : value } : v),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏦</span>
        <h2 className="text-base font-bold text-foreground">Bankkonten & Bargeld</h2>
      </div>

      {/* ── Bankkonten ── */}
      <Card className={cn(draft.bank_accounts_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>🏦</span> Bankkonten
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={draft.bank_accounts_skipped}
                onCheckedChange={(v) => updateDraft(d => ({ ...d, bank_accounts_skipped: !!v }))}
                className="h-3.5 w-3.5"
              />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>

          {!draft.bank_accounts_skipped && (
            <>
              {draft.bank_accounts.map((account, idx) => (
                <div key={account.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  {draft.bank_accounts.length > 1 && (
                    <button
                      onClick={() => removeAccount(account.id)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <p className="text-[10px] font-medium text-muted-foreground">Konto {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Kontoname</Label>
                      <Input
                        value={account.name}
                        onChange={(e) => updateAccount(account.id, 'name', e.target.value)}
                        placeholder="z.B. Sparkonto"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Bank</Label>
                      <Input
                        value={account.bank}
                        onChange={(e) => updateAccount(account.id, 'bank', e.target.value)}
                        placeholder="z.B. UBS"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Saldo</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={account.balance}
                        onChange={(e) => updateAccount(account.id, 'balance', e.target.value)}
                        placeholder="0"
                        className="pl-11 text-right"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Link zum E-Banking (optional)
                    </Label>
                    <Input
                      type="url"
                      value={account.link}
                      onChange={(e) => updateAccount(account.id, 'link', e.target.value)}
                      placeholder="https://..."
                      maxLength={500}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={addAccount}
                className="w-full gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Konto hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Bargeld ── */}
      <SnapshotFieldCard
        config={{
          key: 'cash' as any,
          label: 'Bargeld',
          emoji: '💵',
          hint: 'Schätze, wie viel Bargeld du zu Hause oder im Portemonnaie hast.',
          isCHF: true,
        }}
        value={draft.cash}
        onChange={(f, v) => updateField('cash', f, v)}
        onAmountChange={(v) => updateAmount('cash', v)}
      />

      {/* ── Edelmetalle & Wertgegenstände ── */}
      <Card className={cn(draft.valuables_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>💍</span> Edelmetalle & Wertgegenstände
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={draft.valuables_skipped}
                onCheckedChange={(v) => updateDraft(d => ({ ...d, valuables_skipped: !!v }))}
                className="h-3.5 w-3.5"
              />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>

          {!draft.valuables_skipped && (
            <>
              {draft.valuables.map((item, idx) => (
                <div key={item.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  <button
                    onClick={() => removeValuable(item.id)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateValuableField(item.id, 'name', e.target.value)}
                        placeholder="z.B. Goldmünzen"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Kategorie</Label>
                      <Select
                        value={item.category}
                        onValueChange={(v) => updateValuableField(item.id, 'category', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {VALUABLE_CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Geschätzter Wert</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={item.value}
                        onChange={(e) => updateValuableField(item.id, 'value', e.target.value)}
                        placeholder="0"
                        className="pl-11 text-right"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {draft.valuables.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">
                  Keine Wertgegenstände erfasst.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={addValuable}
                className="w-full gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Wertgegenstand hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Field Card ─────────────────────────────────────

function SnapshotFieldCard({
  config, value, onChange, onAmountChange, ahvSuggestion,
}: {
  config: FieldConfig;
  value: SnapshotFieldValue;
  onChange: (field: keyof SnapshotFieldValue, val: string | boolean) => void;
  onAmountChange: (val: string) => void;
  ahvSuggestion?: string;
}) {
  const navigate = useNavigate();
  const isSkipped = value.skipped;

  return (
    <Card className={cn(isSkipped && "opacity-60")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span>{config.emoji}</span> {config.label}
          </h3>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={isSkipped}
              onCheckedChange={(v) => onChange('skipped', !!v)}
              className="h-3.5 w-3.5"
            />
            <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
          </label>
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Betrag</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
            <Input
              type="text"
              inputMode="decimal"
              value={value.amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={ahvSuggestion ? `ca. ${ahvSuggestion}` : '0'}
              className="pl-11 text-right"
              disabled={isSkipped}
            />
          </div>
          {ahvSuggestion && !value.amount && !isSkipped && (
            <button
              className="text-[10px] text-primary hover:underline"
              onClick={() => onAmountChange(ahvSuggestion)}
            >
              Vorschlag übernehmen: CHF {Number(ahvSuggestion).toLocaleString('de-CH')}
            </button>
          )}
        </div>

        {/* Provider */}
        {config.showProvider && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Anbieter</Label>
            <Input
              type="text"
              value={value.provider || ''}
              onChange={(e) => onChange('provider', e.target.value)}
              placeholder="z.B. Swiss Life, VIAC, UBS..."
              disabled={isSkipped}
              maxLength={100}
            />
          </div>
        )}

        {/* Link */}
        {config.showLink && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Link zum Portal (optional)
            </Label>
            <Input
              type="url"
              value={value.link || ''}
              onChange={(e) => onChange('link', e.target.value)}
              placeholder="https://..."
              disabled={isSkipped}
              maxLength={500}
            />
          </div>
        )}

        {/* Hint */}
        {config.hint && (
          <div className="flex gap-2 bg-muted/50 rounded-lg p-2.5">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">{config.hint}</p>
          </div>
        )}

        {/* More link */}
        {config.moreLink && (
          <button
            onClick={() => navigate(config.moreLink!)}
            className="text-xs text-primary hover:underline font-medium"
          >
            Mehr dazu →
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Summary step ───────────────────────────────────

function SummaryStep({ draft, onNotesChange }: { draft: SnapshotDraft; onNotesChange: (v: string) => void }) {
  const netWorth = computeNetWorth(draft);
  const income = n(draft.monthly_income.amount);
  const expenses = n(draft.monthly_expenses.amount);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const bankTotal = draft.bank_accounts_skipped ? 0 : sumBankAccounts(draft.bank_accounts);
  const cashTotal = draft.cash.skipped ? 0 : n(draft.cash.amount);
  const valuablesTotal = draft.valuables_skipped ? 0 : sumValuables(draft.valuables);
  const totalAssets = bankTotal + cashTotal + valuablesTotal + n(draft.investments.amount) + n(draft.real_estate.amount) + n(draft.emergency_fund.amount);
  const totalPension = n(draft.pillar_3a.amount) + n(draft.freizuegigkeit.amount) + n(draft.pensionskasse.amount);
  const totalDebt = n(draft.mortgage.amount) + n(draft.consumer_debt.amount) + n(draft.other_debt.amount);
  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH')}`;

  const summaryItems = [
    { label: 'Nettovermögen', value: fmtCHF(netWorth), highlight: true, positive: netWorth >= 0 },
    { label: 'Sparquote', value: income > 0 ? `${savingsRate}%` : '–' },
    { label: 'Bankkonten', value: fmtCHF(bankTotal) },
    { label: 'Bargeld & Wertgegenstände', value: fmtCHF(cashTotal + valuablesTotal) },
    { label: 'Vermögen (Investitionen etc.)', value: fmtCHF(n(draft.investments.amount) + n(draft.real_estate.amount) + n(draft.emergency_fund.amount)) },
    { label: 'Vorsorge Total', value: fmtCHF(totalPension) },
    { label: 'Schulden Total', value: fmtCHF(totalDebt) },
    { label: 'Einkommen mtl.', value: income > 0 ? fmtCHF(income) : '–' },
    { label: 'Ausgaben mtl.', value: expenses > 0 ? fmtCHF(expenses) : '–' },
  ];

  // Count skipped fields
  const simpleSkipped = (['pillar_3a', 'freizuegigkeit', 'pensionskasse', 'ahv_annual', 'cash',
    'investments', 'real_estate', 'emergency_fund', 'mortgage', 'consumer_debt', 'other_debt',
    'monthly_income', 'monthly_expenses', 'insurance_monthly'] as (keyof SnapshotDraft)[])
    .filter(k => (draft[k] as SnapshotFieldValue).skipped).length;
  const skippedCount = simpleSkipped + (draft.bank_accounts_skipped ? 1 : 0) + (draft.valuables_skipped ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">✅</span>
        <h2 className="text-base font-bold text-foreground">Zusammenfassung</h2>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-2.5">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className={cn(
                "text-sm font-semibold",
                item.highlight
                  ? item.positive ? "text-primary" : "text-destructive"
                  : "text-foreground"
              )}>
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {skippedCount > 0 && (
        <p className="text-[11px] text-muted-foreground text-center">
          {skippedCount} Feld(er) übersprungen — du kannst sie jederzeit nachträglich ausfüllen.
        </p>
      )}

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-xs">📝 Notizen (optional)</Label>
          <Textarea
            value={draft.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="z.B. Bonus erhalten, Hypothek abgeschlossen..."
            rows={3}
            maxLength={500}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ── History components ─────────────────────────────

function ComparisonBanner({ current, previous }: { current: any; previous: any }) {
  const diff = (current.net_worth || 0) - (previous.net_worth || 0);
  const positive = diff >= 0;
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("border-0", positive ? "bg-primary/5" : "bg-destructive/5")}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", positive ? "bg-primary/10" : "bg-destructive/10")}>
            <Icon className={cn("h-5 w-5", positive ? "text-primary" : "text-destructive")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seit letztem Snapshot</p>
            <p className={cn("font-bold", positive ? "text-primary" : "text-destructive")}>
              {positive ? '+' : ''}CHF {diff.toLocaleString('de-CH')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HistoryCard({ snapshot, previous, onDelete }: { snapshot: any; previous: any; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const data = snapshot.snapshot_data || {};
  const netWorth = snapshot.net_worth || 0;
  const diff = previous ? netWorth - (previous.net_worth || 0) : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          className="p-4 flex items-center gap-3 cursor-pointer active:bg-muted/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-lg">📸</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {format(new Date(snapshot.created_at), 'dd. MMMM yyyy', { locale: de })}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Nettovermögen: <span className="font-medium text-foreground">CHF {netWorth.toLocaleString('de-CH')}</span>
              </p>
              {diff !== null && (
                <span className={cn("text-[10px] font-medium", diff >= 0 ? "text-primary" : "text-destructive")}>
                  {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toLocaleString('de-CH')}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
        </div>

        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
            <Separator />
            <div className="p-4 space-y-2">
              {/* Static fields */}
              {Object.entries(STATIC_FIELD_LABELS).map(([key, meta]) => {
                const fieldData = data[key];
                if (!fieldData) return null;
                const amount = typeof fieldData === 'object' ? fieldData.amount : fieldData;
                if (!amount && amount !== 0) return null;
                const provider = typeof fieldData === 'object' ? fieldData.provider : null;
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {meta.emoji} {meta.label}
                      {provider && <span className="text-[10px] ml-1">({provider})</span>}
                    </span>
                    <span className="font-medium text-foreground">CHF {Number(amount).toLocaleString('de-CH')}</span>
                  </div>
                );
              })}
              {/* Bank accounts */}
              {Array.isArray(data.bank_accounts) && data.bank_accounts.map((a: any, i: number) => (
                n(a.balance) > 0 && (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      🏦 {a.name || 'Konto'}{a.bank && <span className="text-[10px] ml-1">({a.bank})</span>}
                    </span>
                    <span className="font-medium text-foreground">CHF {Number(a.balance).toLocaleString('de-CH')}</span>
                  </div>
                )
              ))}
              {/* Valuables */}
              {Array.isArray(data.valuables) && data.valuables.map((v: any, i: number) => (
                n(v.value) > 0 && (
                  <div key={`v-${i}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">💍 {v.name || 'Wertgegenstand'}</span>
                    <span className="font-medium text-foreground">CHF {Number(v.value).toLocaleString('de-CH')}</span>
                  </div>
                )
              ))}
              {snapshot.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">📝 {snapshot.notes}</p>
                </div>
              )}
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs h-8" onClick={onDelete}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Löschen
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
