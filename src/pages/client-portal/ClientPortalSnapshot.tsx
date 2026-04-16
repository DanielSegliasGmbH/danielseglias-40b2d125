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
  Info, ExternalLink, Plus, Zap, CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { InfoHint } from '@/components/client-portal/InfoHint';
import { formatSnapshotTrend } from '@/lib/peakScoreFormat';

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

interface InvestmentPosition {
  id: string;
  name: string;
  platform: string;
  value: string;
  link: string;
}

interface CryptoPosition {
  id: string;
  name: string;
  platform: string;
  value: string;
  link: string;
}

interface Property {
  id: string;
  description: string;
  market_value: string;
  equity_invested: string;
  mortgage_amount: string;
  mortgage_rate: string;
  link: string;
}

interface OtherAsset {
  id: string;
  name: string;
  value: string;
}

interface CreditItem {
  id: string;
  name: string;
  remaining: string;
  monthly_payment: string;
  interest_rate: string;
}

interface DebtItem {
  id: string;
  description: string;
  amount: string;
}

// New list entry types for Vorsorge
interface Pillar3aEntry {
  id: string;
  balance: string;
  provider: string;
  expected_return: string;
  link: string;
}

interface FreizuegigkeitEntry {
  id: string;
  balance: string;
  provider: string;
  expected_return: string;
  link: string;
}

interface PensionskasseEntry {
  id: string;
  balance: string;
  provider: string;
  expected_return: string;
  link: string;
}

interface SnapshotDraft {
  // Step 0: Vorsorge (legacy single fields kept for backward compat)
  pillar_3a: SnapshotFieldValue;
  freizuegigkeit: SnapshotFieldValue;
  pensionskasse: SnapshotFieldValue;
  ahv_annual: SnapshotFieldValue;
  // Step 0: Vorsorge (new dynamic lists)
  pillar_3a_entries: Pillar3aEntry[];
  pillar_3a_skipped: boolean;
  freizuegigkeit_entries: FreizuegigkeitEntry[];
  freizuegigkeit_skipped: boolean;
  pensionskasse_entries: PensionskasseEntry[];
  pensionskasse_skipped: boolean;
  // Step 1: Bankkonten & Bargeld
  bank_accounts: BankAccount[];
  bank_accounts_skipped: boolean;
  cash: SnapshotFieldValue;
  valuables: Valuable[];
  valuables_skipped: boolean;
  // Step 2: Investments & Immobilien
  investment_positions: InvestmentPosition[];
  investment_positions_skipped: boolean;
  crypto_positions: CryptoPosition[];
  crypto_positions_skipped: boolean;
  properties: Property[];
  owns_property: boolean;
  other_assets: OtherAsset[];
  other_assets_skipped: boolean;
  // Step 3: Verbindlichkeiten
  credits: CreditItem[];
  credits_skipped: boolean;
  debts: DebtItem[];
  debts_skipped: boolean;
  // Legacy liability fields
  mortgage?: SnapshotFieldValue;
  consumer_debt?: SnapshotFieldValue;
  other_debt?: SnapshotFieldValue;
  // Step 4: Einkommen & Ausgaben
  monthly_income: SnapshotFieldValue;
  monthly_expenses: SnapshotFieldValue;
  insurance_monthly: SnapshotFieldValue;
  // Legacy (kept for backward compat with old snapshots)
  savings?: SnapshotFieldValue;
  investments?: SnapshotFieldValue;
  real_estate?: SnapshotFieldValue;
  emergency_fund?: SnapshotFieldValue;
  // Summary
  notes: string;
}

const DEFAULT_FIELD: SnapshotFieldValue = { amount: '', provider: '', link: '', skipped: false };

const newPillar3aEntry = (): Pillar3aEntry => ({
  id: crypto.randomUUID(), balance: '', provider: '', expected_return: '', link: '',
});

const newFreizuegigkeitEntry = (): FreizuegigkeitEntry => ({
  id: crypto.randomUUID(), balance: '', provider: '', expected_return: '', link: '',
});

const newPensionskasseEntry = (): PensionskasseEntry => ({
  id: crypto.randomUUID(), balance: '', provider: '', expected_return: '', link: '',
});

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

const newInvestment = (): InvestmentPosition => ({
  id: crypto.randomUUID(),
  name: '',
  platform: '',
  value: '',
  link: '',
});

const newCrypto = (): CryptoPosition => ({
  id: crypto.randomUUID(),
  name: '',
  platform: '',
  value: '',
  link: '',
});

const newProperty = (): Property => ({
  id: crypto.randomUUID(),
  description: '',
  market_value: '',
  equity_invested: '',
  mortgage_amount: '',
  mortgage_rate: '',
  link: '',
});

const newOtherAsset = (): OtherAsset => ({
  id: crypto.randomUUID(),
  name: '',
  value: '',
});

const newCredit = (): CreditItem => ({
  id: crypto.randomUUID(),
  name: '',
  remaining: '',
  monthly_payment: '',
  interest_rate: '',
});

const newDebt = (): DebtItem => ({
  id: crypto.randomUUID(),
  description: '',
  amount: '',
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
  investment_positions: [],
  investment_positions_skipped: false,
  crypto_positions: [],
  crypto_positions_skipped: false,
  properties: [],
  owns_property: false,
  other_assets: [],
  other_assets_skipped: false,
  credits: [],
  credits_skipped: false,
  debts: [],
  debts_skipped: false,
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
  articleId?: string;
  showProvider?: boolean;
  showLink?: boolean;
  isCHF?: boolean;
}

interface StepConfig {
  title: string;
  emoji: string;
  type: 'fields' | 'bank_cash' | 'investments' | 'liabilities';
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
        articleId: '3a-steuervorteile',
        showProvider: true,
        showLink: true,
        isCHF: true,
      },
      {
        key: 'freizuegigkeit',
        label: 'Freizügigkeit',
        emoji: '🔄',
        hint: 'Falls du in der Vergangenheit die Stelle gewechselt hast, könnte hier Geld liegen.',
        articleId: 'vorsorgeluecke',
        showProvider: true,
        showLink: true,
        isCHF: true,
      },
      {
        key: 'pensionskasse',
        label: 'Pensionskasse (BVG)',
        emoji: '🏛️',
        hint: "Diesen Betrag findest du auf deinem Pensionskassenausweis unter 'Austrittsleistung' oder 'Freizügigkeitsleistung'.",
        articleId: 'drei-saeulen-system',
        showProvider: true,
        showLink: true,
        isCHF: true,
      },
      {
        key: 'ahv_annual',
        label: 'AHV (geschätzte Jahresrente)',
        emoji: '🇨🇭',
        hint: 'Deine AHV-Rente wird basierend auf deinem Einkommen geschätzt. Du kannst den genauen Betrag bei deiner Ausgleichskasse anfragen.',
        articleId: 'ahv-grundlagen',
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
    title: 'Investments & Immobilien',
    emoji: '📈',
    type: 'investments',
  },
  {
    title: 'Verbindlichkeiten',
    emoji: '📉',
    type: 'liabilities',
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

function sumInvestments(items: InvestmentPosition[]): number {
  return items.reduce((sum, i) => sum + n(i.value), 0);
}

function sumCrypto(items: CryptoPosition[]): number {
  return items.reduce((sum, c) => sum + n(c.value), 0);
}

function sumPropertyEquity(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + n(p.market_value) - n(p.mortgage_amount), 0);
}

function sumPropertyValue(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + n(p.market_value), 0);
}

function sumPropertyMortgages(properties: Property[]): number {
  return properties.reduce((sum, p) => sum + n(p.mortgage_amount), 0);
}

function sumOtherAssets(items: OtherAsset[]): number {
  return items.reduce((sum, a) => sum + n(a.value), 0);
}

function sumCredits(items: CreditItem[]): number {
  return items.reduce((sum, c) => sum + n(c.remaining), 0);
}

function sumDebts(items: DebtItem[]): number {
  return items.reduce((sum, d) => sum + n(d.amount), 0);
}

function computeNetWorth(d: SnapshotDraft): number {
  const bankTotal = d.bank_accounts_skipped ? 0 : sumBankAccounts(d.bank_accounts);
  const cashTotal = d.cash.skipped ? 0 : n(d.cash.amount);
  const valuablesTotal = d.valuables_skipped ? 0 : sumValuables(d.valuables);
  const investTotal = d.investment_positions_skipped ? 0 : sumInvestments(d.investment_positions);
  const cryptoTotal = d.crypto_positions_skipped ? 0 : sumCrypto(d.crypto_positions);
  const propertyEquity = d.owns_property ? sumPropertyEquity(d.properties) : 0;
  const otherTotal = d.other_assets_skipped ? 0 : sumOtherAssets(d.other_assets);
  const creditsTotal = d.credits_skipped ? 0 : sumCredits(d.credits);
  const debtsTotal = d.debts_skipped ? 0 : sumDebts(d.debts);
  // Legacy fields for old snapshots
  const legacySavings = d.savings ? n(d.savings.amount) : 0;
  const legacyInvestments = d.investments ? n(d.investments.amount) : 0;
  const legacyRE = d.real_estate ? n(d.real_estate.amount) : 0;
  const legacyEmergency = d.emergency_fund ? n(d.emergency_fund.amount) : 0;
  const legacyMortgage = d.mortgage ? n(d.mortgage.amount) : 0;
  const legacyConsumer = d.consumer_debt ? n(d.consumer_debt.amount) : 0;
  const legacyOther = d.other_debt ? n(d.other_debt.amount) : 0;
  return bankTotal + cashTotal + valuablesTotal + investTotal + cryptoTotal + propertyEquity + otherTotal +
    legacySavings + legacyInvestments + legacyRE + legacyEmergency +
    n(d.pillar_3a.amount) + n(d.freizuegigkeit.amount) + n(d.pensionskasse.amount) -
    creditsTotal - debtsTotal - legacyMortgage - legacyConsumer - legacyOther;
}

// ── Field labels for history display ───────────────
const STATIC_FIELD_LABELS: Record<string, { label: string; emoji: string }> = {};
STEPS.forEach(step => step.fields?.forEach(f => {
  STATIC_FIELD_LABELS[f.key as string] = { label: f.label, emoji: f.emoji };
}));
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
  const [showConfetti, setShowConfetti] = useState(false);
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
        if (Array.isArray(parsed.valuables)) merged.valuables = parsed.valuables;
        merged.valuables_skipped = !!parsed.valuables_skipped;
        if (Array.isArray(parsed.investment_positions)) merged.investment_positions = parsed.investment_positions;
        merged.investment_positions_skipped = !!parsed.investment_positions_skipped;
        if (Array.isArray(parsed.crypto_positions)) merged.crypto_positions = parsed.crypto_positions;
        merged.crypto_positions_skipped = !!parsed.crypto_positions_skipped;
        if (Array.isArray(parsed.properties)) merged.properties = parsed.properties;
        merged.owns_property = !!parsed.owns_property;
        if (Array.isArray(parsed.other_assets)) merged.other_assets = parsed.other_assets;
        merged.other_assets_skipped = !!parsed.other_assets_skipped;
        if (Array.isArray(parsed.credits)) merged.credits = parsed.credits;
        merged.credits_skipped = !!parsed.credits_skipped;
        if (Array.isArray(parsed.debts)) merged.debts = parsed.debts;
        merged.debts_skipped = !!parsed.debts_skipped;
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
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
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
      {/* Confetti celebration */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['hsl(var(--primary))', '#FFD700', '#FF6B35', '#4CAF50', '#E91E63'][i % 5],
              }}
              initial={{ top: '-5%', opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                top: '110%',
                opacity: [1, 1, 0],
                scale: [1, 1.5, 0.5],
                rotate: Math.random() * 720 - 360,
                x: (Math.random() - 0.5) * 200,
              }}
              transition={{ duration: 2 + Math.random(), delay: i * 0.04, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
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
                  <SummaryStep draft={draft} onNotesChange={(v) => setDraft(prev => ({ ...prev, notes: v }))} onEdit={() => setStep(step - 1)} />
                ) : currentStepConfig?.type === 'bank_cash' ? (
                  <BankCashStep draft={draft} updateDraft={updateDraft} updateField={updateField} updateAmount={updateAmount} />
                ) : currentStepConfig?.type === 'investments' ? (
                  <InvestmentsStep draft={draft} updateDraft={updateDraft} />
                ) : currentStepConfig?.type === 'liabilities' ? (
                  <LiabilitiesStep draft={draft} updateDraft={updateDraft} />
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
            <SnapshotHistory
              snapshots={snapshots}
              isLoading={isLoading}
              onCreateNew={() => setTab('new')}
              onDelete={(id) => deleteSnapshot.mutate(id)}
            />
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

// ── Investments & Immobilien Step ──────────────────

function InvestmentsStep({
  draft, updateDraft,
}: {
  draft: SnapshotDraft;
  updateDraft: (fn: (prev: SnapshotDraft) => SnapshotDraft) => void;
}) {
  const cleanNum = (v: string) => v.replace(/[^0-9.]/g, '');

  // Investment helpers
  const addInvestment = () => updateDraft(d => ({ ...d, investment_positions: [...d.investment_positions, newInvestment()] }));
  const removeInvestment = (id: string) => updateDraft(d => ({ ...d, investment_positions: d.investment_positions.filter(i => i.id !== id) }));
  const updateInv = (id: string, field: keyof InvestmentPosition, value: string) => updateDraft(d => ({
    ...d, investment_positions: d.investment_positions.map(i => i.id === id ? { ...i, [field]: field === 'value' ? cleanNum(value) : value } : i),
  }));

  // Crypto helpers
  const addCrypto = () => updateDraft(d => ({ ...d, crypto_positions: [...d.crypto_positions, newCrypto()] }));
  const removeCrypto = (id: string) => updateDraft(d => ({ ...d, crypto_positions: d.crypto_positions.filter(c => c.id !== id) }));
  const updateCryp = (id: string, field: keyof CryptoPosition, value: string) => updateDraft(d => ({
    ...d, crypto_positions: d.crypto_positions.map(c => c.id === id ? { ...c, [field]: field === 'value' ? cleanNum(value) : value } : c),
  }));

  // Property helpers
  const addProperty = () => updateDraft(d => ({ ...d, properties: [...d.properties, newProperty()] }));
  const removeProperty = (id: string) => updateDraft(d => ({ ...d, properties: d.properties.filter(p => p.id !== id) }));
  const updateProp = (id: string, field: keyof Property, value: string) => updateDraft(d => ({
    ...d, properties: d.properties.map(p => p.id === id ? {
      ...p,
      [field]: ['market_value', 'equity_invested', 'mortgage_amount', 'mortgage_rate'].includes(field) ? cleanNum(value) : value,
    } : p),
  }));

  // Other assets helpers
  const addOther = () => updateDraft(d => ({ ...d, other_assets: [...d.other_assets, newOtherAsset()] }));
  const removeOther = (id: string) => updateDraft(d => ({ ...d, other_assets: d.other_assets.filter(a => a.id !== id) }));
  const updateOther = (id: string, field: keyof OtherAsset, value: string) => updateDraft(d => ({
    ...d, other_assets: d.other_assets.map(a => a.id === id ? { ...a, [field]: field === 'value' ? cleanNum(value) : value } : a),
  }));

  const toggleProperty = (on: boolean) => {
    updateDraft(d => ({
      ...d,
      owns_property: on,
      properties: on && d.properties.length === 0 ? [newProperty()] : d.properties,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">📈</span>
        <h2 className="text-base font-bold text-foreground">Investments & Immobilien</h2>
      </div>

      {/* ── Aktien, ETFs & Fonds ── */}
      <Card className={cn(draft.investment_positions_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>📊</span> Aktien, ETFs & Fonds
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={draft.investment_positions_skipped}
                onCheckedChange={(v) => updateDraft(d => ({ ...d, investment_positions_skipped: !!v }))}
                className="h-3.5 w-3.5"
              />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>

          {!draft.investment_positions_skipped && (
            <>
              {draft.investment_positions.map((inv, idx) => (
                <div key={inv.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  <button onClick={() => removeInvestment(inv.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-[10px] font-medium text-muted-foreground">Position {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input value={inv.name} onChange={(e) => updateInv(inv.id, 'name', e.target.value)} placeholder="z.B. Swissquote Depot" maxLength={100} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Plattform/Broker</Label>
                      <Input value={inv.platform} onChange={(e) => updateInv(inv.id, 'platform', e.target.value)} placeholder="z.B. Swissquote" maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Aktueller Wert</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                      <Input type="text" inputMode="decimal" value={inv.value} onChange={(e) => updateInv(inv.id, 'value', e.target.value)} placeholder="0" className="pl-11 text-right" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Link (optional)</Label>
                    <Input type="url" value={inv.link} onChange={(e) => updateInv(inv.id, 'link', e.target.value)} placeholder="https://..." maxLength={500} />
                  </div>
                </div>
              ))}
              {draft.investment_positions.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Keine Positionen erfasst.</p>
              )}
              <Button variant="outline" size="sm" onClick={addInvestment} className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Position hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Kryptowährungen ── */}
      <Card className={cn(draft.crypto_positions_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>🪙</span> Kryptowährungen
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={draft.crypto_positions_skipped}
                onCheckedChange={(v) => updateDraft(d => ({ ...d, crypto_positions_skipped: !!v }))}
                className="h-3.5 w-3.5"
              />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>

          {!draft.crypto_positions_skipped && (
            <>
              {draft.crypto_positions.map((cry, idx) => (
                <div key={cry.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  <button onClick={() => removeCrypto(cry.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-[10px] font-medium text-muted-foreground">Krypto {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input value={cry.name} onChange={(e) => updateCryp(cry.id, 'name', e.target.value)} placeholder="z.B. Bitcoin" maxLength={100} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Plattform</Label>
                      <Input value={cry.platform} onChange={(e) => updateCryp(cry.id, 'platform', e.target.value)} placeholder="z.B. Binance" maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Aktueller Wert</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                      <Input type="text" inputMode="decimal" value={cry.value} onChange={(e) => updateCryp(cry.id, 'value', e.target.value)} placeholder="0" className="pl-11 text-right" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Link (optional)</Label>
                    <Input type="url" value={cry.link} onChange={(e) => updateCryp(cry.id, 'link', e.target.value)} placeholder="https://..." maxLength={500} />
                  </div>
                </div>
              ))}
              {draft.crypto_positions.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Keine Kryptowährungen erfasst.</p>
              )}
              <Button variant="outline" size="sm" onClick={addCrypto} className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Krypto hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Immobilien ── */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>🏠</span> Immobilien
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Besitzt du Wohneigentum?</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={draft.owns_property ? "default" : "outline"} className="h-7 text-xs px-3" onClick={() => toggleProperty(true)}>Ja</Button>
              <Button size="sm" variant={!draft.owns_property ? "default" : "outline"} className="h-7 text-xs px-3" onClick={() => toggleProperty(false)}>Nein</Button>
            </div>
          </div>

          {draft.owns_property && (
            <>
              {draft.properties.map((prop, idx) => {
                const equity = n(prop.market_value) - n(prop.mortgage_amount);
                return (
                  <div key={prop.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                    {draft.properties.length > 1 && (
                      <button onClick={() => removeProperty(prop.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <p className="text-[10px] font-medium text-muted-foreground">Immobilie {idx + 1}</p>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Beschreibung</Label>
                      <Input value={prop.description} onChange={(e) => updateProp(prop.id, 'description', e.target.value)} placeholder="z.B. 3.5-Zi-Wohnung Zürich" maxLength={200} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Aktueller Marktwert</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                          <Input type="text" inputMode="decimal" value={prop.market_value} onChange={(e) => updateProp(prop.id, 'market_value', e.target.value)} placeholder="0" className="pl-11 text-right" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Eigenmittel eingebracht</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                          <Input type="text" inputMode="decimal" value={prop.equity_invested} onChange={(e) => updateProp(prop.id, 'equity_invested', e.target.value)} placeholder="0" className="pl-11 text-right" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Hypothek Betrag</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                          <Input type="text" inputMode="decimal" value={prop.mortgage_amount} onChange={(e) => updateProp(prop.id, 'mortgage_amount', e.target.value)} placeholder="0" className="pl-11 text-right" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Hypothekarzins (% p.a.)</Label>
                        <div className="relative">
                          <Input type="text" inputMode="decimal" value={prop.mortgage_rate} onChange={(e) => updateProp(prop.id, 'mortgage_rate', e.target.value)} placeholder="1.5" className="text-right" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                    {(n(prop.market_value) > 0 || n(prop.mortgage_amount) > 0) && (
                      <div className="flex gap-2 bg-primary/5 rounded-lg p-2.5">
                        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-primary font-medium">
                          Dein Eigenkapitalanteil: CHF {equity.toLocaleString('de-CH')}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Link zum Hypothekaranbieter (optional)</Label>
                      <Input type="url" value={prop.link} onChange={(e) => updateProp(prop.id, 'link', e.target.value)} placeholder="https://..." maxLength={500} />
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" onClick={addProperty} className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Weitere Immobilie hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Sonstiges Vermögen ── */}
      <Card className={cn(draft.other_assets_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>📦</span> Sonstiges Vermögen
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={draft.other_assets_skipped}
                onCheckedChange={(v) => updateDraft(d => ({ ...d, other_assets_skipped: !!v }))}
                className="h-3.5 w-3.5"
              />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>

          {!draft.other_assets_skipped && (
            <>
              {draft.other_assets.map((asset, idx) => (
                <div key={asset.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  <button onClick={() => removeOther(asset.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
                      <Input value={asset.name} onChange={(e) => updateOther(asset.id, 'name', e.target.value)} placeholder="z.B. Darlehen an Freund" maxLength={100} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Wert</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                        <Input type="text" inputMode="decimal" value={asset.value} onChange={(e) => updateOther(asset.id, 'value', e.target.value)} placeholder="0" className="pl-11 text-right" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {draft.other_assets.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Keine sonstigen Vermögenswerte erfasst.</p>
              )}
              <Button variant="outline" size="sm" onClick={addOther} className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Liabilities Step ───────────────────────────────

function LiabilitiesStep({
  draft, updateDraft,
}: {
  draft: SnapshotDraft;
  updateDraft: (fn: (prev: SnapshotDraft) => SnapshotDraft) => void;
}) {
  const cleanNum = (v: string) => v.replace(/[^0-9.]/g, '');

  const propertyMortgages = draft.owns_property
    ? draft.properties.filter(p => n(p.mortgage_amount) > 0)
    : [];

  const addCredit = () => updateDraft(d => ({ ...d, credits: [...d.credits, newCredit()] }));
  const removeCredit = (id: string) => updateDraft(d => ({ ...d, credits: d.credits.filter(c => c.id !== id) }));
  const updateCred = (id: string, field: keyof CreditItem, value: string) => updateDraft(d => ({
    ...d, credits: d.credits.map(c => c.id === id ? {
      ...c, [field]: ['remaining', 'monthly_payment', 'interest_rate'].includes(field) ? cleanNum(value) : value,
    } : c),
  }));

  const addDebtItem = () => updateDraft(d => ({ ...d, debts: [...d.debts, newDebt()] }));
  const removeDebtItem = (id: string) => updateDraft(d => ({ ...d, debts: d.debts.filter(x => x.id !== id) }));
  const updateDebtItem = (id: string, field: keyof DebtItem, value: string) => updateDraft(d => ({
    ...d, debts: d.debts.map(x => x.id === id ? { ...x, [field]: field === 'amount' ? cleanNum(value) : value } : x),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">📉</span>
        <h2 className="text-base font-bold text-foreground">Verbindlichkeiten</h2>
      </div>

      {/* Hypotheken (auto-filled) */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span>🏠</span> Hypotheken
          </h3>
          {propertyMortgages.length > 0 ? (
            <>
              <div className="flex gap-2 bg-primary/5 rounded-lg p-2.5">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-primary">Automatisch übernommen aus deinen Immobilien in Schritt 3.</p>
              </div>
              {propertyMortgages.map((prop, idx) => (
                <div key={prop.id} className="flex justify-between items-center p-2.5 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground">{prop.description || `Immobilie ${idx + 1}`}</span>
                  <span className="text-sm font-medium text-foreground">CHF {Number(prop.mortgage_amount).toLocaleString('de-CH')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 border-t border-border/50">
                <span className="text-xs font-medium text-muted-foreground">Total Hypotheken</span>
                <span className="text-sm font-bold text-foreground">CHF {sumPropertyMortgages(draft.properties).toLocaleString('de-CH')}</span>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center py-2">Keine Hypotheken erfasst. Du kannst Immobilien in Schritt 3 hinzufügen.</p>
          )}
        </CardContent>
      </Card>

      {/* Kredite & Leasing */}
      <Card className={cn(draft.credits_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>💳</span> Kredite & Leasing
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={draft.credits_skipped} onCheckedChange={(v) => updateDraft(d => ({ ...d, credits_skipped: !!v }))} className="h-3.5 w-3.5" />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>
          {!draft.credits_skipped && (
            <>
              <div className="flex gap-2 bg-destructive/5 rounded-lg p-2.5">
                <Info className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive">Konsumkredite und Leasingverträge belasten deinen PeakScore stark.</p>
              </div>
              {draft.credits.map((credit, idx) => (
                <div key={credit.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  <button onClick={() => removeCredit(credit.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-[10px] font-medium text-muted-foreground">Kredit {idx + 1}</p>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
                    <Input value={credit.name} onChange={(e) => updateCred(credit.id, 'name', e.target.value)} placeholder="z.B. Autokredit, Privatkredit" maxLength={100} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Restschuld</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                        <Input type="text" inputMode="decimal" value={credit.remaining} onChange={(e) => updateCred(credit.id, 'remaining', e.target.value)} placeholder="0" className="pl-11 text-right" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Monatliche Rate</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                        <Input type="text" inputMode="decimal" value={credit.monthly_payment} onChange={(e) => updateCred(credit.id, 'monthly_payment', e.target.value)} placeholder="0" className="pl-11 text-right" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Zinssatz (% p.a., optional)</Label>
                    <div className="relative">
                      <Input type="text" inputMode="decimal" value={credit.interest_rate} onChange={(e) => updateCred(credit.id, 'interest_rate', e.target.value)} placeholder="z.B. 4.9" className="text-right" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              ))}
              {draft.credits.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Keine Kredite oder Leasingverträge erfasst.</p>
              )}
              <Button variant="outline" size="sm" onClick={addCredit} className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Kredit hinzufügen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sonstige Schulden */}
      <Card className={cn(draft.debts_skipped && "opacity-60")}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>📋</span> Sonstige Schulden
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={draft.debts_skipped} onCheckedChange={(v) => updateDraft(d => ({ ...d, debts_skipped: !!v }))} className="h-3.5 w-3.5" />
              <span className="text-[10px] text-muted-foreground">Nicht bekannt</span>
            </label>
          </div>
          {!draft.debts_skipped && (
            <>
              {draft.debts.map((debt) => (
                <div key={debt.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                  <button onClick={() => removeDebtItem(debt.id)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Beschreibung</Label>
                      <Input value={debt.description} onChange={(e) => updateDebtItem(debt.id, 'description', e.target.value)} placeholder="z.B. Darlehen Familie" maxLength={100} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Betrag</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                        <Input type="text" inputMode="decimal" value={debt.amount} onChange={(e) => updateDebtItem(debt.id, 'amount', e.target.value)} placeholder="0" className="pl-11 text-right" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {draft.debts.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Keine sonstigen Schulden erfasst.</p>
              )}
              <Button variant="outline" size="sm" onClick={addDebtItem} className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Hinzufügen
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

        {/* Article link */}
        {config.articleId && (
          <InfoHint
            text=""
            articleId={config.articleId}
            className="mt-0"
          />
        )}
        {config.moreLink && !config.articleId && (
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

function SummaryStep({ draft, onNotesChange, onEdit }: { draft: SnapshotDraft; onNotesChange: (v: string) => void; onEdit: () => void }) {
  const netWorth = computeNetWorth(draft);
  const income = n(draft.monthly_income.amount);
  const expenses = n(draft.monthly_expenses.amount);
  const bankTotal = draft.bank_accounts_skipped ? 0 : sumBankAccounts(draft.bank_accounts);
  const cashTotal = draft.cash.skipped ? 0 : n(draft.cash.amount);
  const valuablesTotal = draft.valuables_skipped ? 0 : sumValuables(draft.valuables);
  const investTotal = draft.investment_positions_skipped ? 0 : sumInvestments(draft.investment_positions);
  const cryptoTotal = draft.crypto_positions_skipped ? 0 : sumCrypto(draft.crypto_positions);
  const propertyTotal = draft.owns_property ? sumPropertyValue(draft.properties) : 0;
  const propertyMortgages = draft.owns_property ? sumPropertyMortgages(draft.properties) : 0;
  const otherTotal = draft.other_assets_skipped ? 0 : sumOtherAssets(draft.other_assets);
  const creditsTotal = draft.credits_skipped ? 0 : sumCredits(draft.credits);
  const debtsTotal = draft.debts_skipped ? 0 : sumDebts(draft.debts);
  const totalPension = n(draft.pillar_3a.amount) + n(draft.freizuegigkeit.amount) + n(draft.pensionskasse.amount);
  const legacyDebt = (draft.mortgage ? n(draft.mortgage.amount) : 0) + (draft.consumer_debt ? n(draft.consumer_debt.amount) : 0) + (draft.other_debt ? n(draft.other_debt.amount) : 0);
  const totalDebt = propertyMortgages + creditsTotal + debtsTotal + legacyDebt;
  const totalAssets = bankTotal + cashTotal + valuablesTotal + investTotal + cryptoTotal + propertyTotal + otherTotal + totalPension;
  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH')}`;

  // Assets breakdown
  const assetItems = [
    { label: 'Bankkonten', value: bankTotal },
    { label: 'Bargeld', value: cashTotal },
    { label: 'Wertgegenstände', value: valuablesTotal },
    { label: 'Aktien, ETFs & Fonds', value: investTotal },
    { label: 'Kryptowährungen', value: cryptoTotal },
    { label: 'Immobilien (Marktwert)', value: propertyTotal },
    { label: 'Sonstiges Vermögen', value: otherTotal },
    { label: 'Vorsorge (3a, FZ, PK)', value: totalPension },
  ].filter(i => i.value > 0);

  // Liabilities breakdown
  const liabilityItems = [
    { label: 'Hypotheken', value: propertyMortgages },
    { label: 'Kredite & Leasing', value: creditsTotal },
    { label: 'Sonstige Schulden', value: debtsTotal },
    ...(legacyDebt > 0 ? [{ label: 'Weitere Schulden', value: legacyDebt }] : []),
  ].filter(i => i.value > 0);

  // PeakScore impact (months of expenses covered)
  const monthlyExpenses = expenses > 0 ? expenses : 1;
  const currentMonths = Math.max(0, Math.round(netWorth / monthlyExpenses));

  // Completeness — count fields as "addressed" if value entered OR "Nicht bekannt" checked
  const TOTAL_FIELDS = 15;
  const simpleFieldKeys = ['pillar_3a', 'freizuegigkeit', 'pensionskasse', 'ahv_annual', 'cash',
    'monthly_income', 'monthly_expenses', 'insurance_monthly'] as (keyof SnapshotDraft)[];

  let filledCount = 0;
  let unknownCount = 0;
  let untouchedCount = 0;

  simpleFieldKeys.forEach(k => {
    const val = draft[k];
    if (val && typeof val === 'object' && 'skipped' in val) {
      const fv = val as SnapshotFieldValue;
      if (fv.skipped) unknownCount++;
      else if (fv.amount && String(fv.amount).trim() !== '') filledCount++;
      else untouchedCount++;
    } else {
      untouchedCount++;
    }
  });

  const listFields: { skippedKey: keyof SnapshotDraft; listKey?: keyof SnapshotDraft }[] = [
    { skippedKey: 'bank_accounts_skipped', listKey: 'bank_accounts' },
    { skippedKey: 'valuables_skipped', listKey: 'valuables' },
    { skippedKey: 'investment_positions_skipped', listKey: 'investment_positions' },
    { skippedKey: 'crypto_positions_skipped', listKey: 'crypto_positions' },
    { skippedKey: 'other_assets_skipped', listKey: 'other_assets' },
    { skippedKey: 'credits_skipped', listKey: 'credits' },
    { skippedKey: 'debts_skipped', listKey: 'debts' },
  ];

  listFields.forEach(({ skippedKey, listKey }) => {
    if (draft[skippedKey]) {
      unknownCount++;
    } else if (listKey && Array.isArray(draft[listKey]) && (draft[listKey] as unknown[]).length > 0) {
      filledCount++;
    } else {
      untouchedCount++;
    }
  });

  const addressedCount = filledCount + unknownCount;
  const completenessPercent = Math.round((addressedCount / TOTAL_FIELDS) * 100);

  const motivationalText = completenessPercent === 100
    ? 'Vollständig! Du hast zu jedem Punkt Stellung bezogen. ✅'
    : completenessPercent > 80
      ? 'Sehr vollständig! Top Überblick. 🎯'
      : completenessPercent >= 50
        ? 'Guter Start. Ergänze fehlende Felder beim nächsten Snapshot.'
        : 'Jedes Feld, das du ausfüllst, macht deinen Plan besser.';

  const today = format(new Date(), 'dd. MMMM yyyy', { locale: de });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-foreground">Dein Snapshot – {today}</h2>
        <p className="text-xs text-muted-foreground">Deine finanzielle Momentaufnahme</p>
      </div>

      {/* SECTION 1: Vermögen (green) */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" /> Vermögen
          </h3>
          {assetItems.map(item => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground">{fmtCHF(item.value)}</span>
            </div>
          ))}
          {assetItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">Keine Vermögenswerte erfasst</p>
          )}
          <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
            <span className="text-xs font-semibold text-primary">Total Vermögen</span>
            <span className="text-lg font-bold text-primary">{fmtCHF(totalAssets)}</span>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Verbindlichkeiten (red) */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-destructive flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4" /> Verbindlichkeiten
          </h3>
          {liabilityItems.map(item => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-destructive">-{fmtCHF(item.value)}</span>
            </div>
          ))}
          {liabilityItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">Keine Verbindlichkeiten erfasst</p>
          )}
          <div className="pt-2 border-t border-destructive/20 flex justify-between items-center">
            <span className="text-xs font-semibold text-destructive">Total Schulden</span>
            <span className="text-lg font-bold text-destructive">-{fmtCHF(totalDebt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Nettovermögen */}
      <Card className={cn("border-2", netWorth >= 0 ? "border-primary/40" : "border-destructive/40")}>
        <CardContent className="p-5 text-center space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nettovermögen</p>
          <p className={cn("text-2xl font-bold", netWorth >= 0 ? "text-primary" : "text-destructive")}>
            {fmtCHF(netWorth)}
          </p>
          {income > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Sparquote: {Math.round(((income - expenses) / income) * 100)}%
            </p>
          )}
        </CardContent>
      </Card>

      {/* SECTION 4: PeakScore Impact */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" /> PeakScore Impact
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Finanzielle Reichweite</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">{currentMonths} Monate</span>
              {currentMonths >= 6 ? (
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">✓ Gesund</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">Aufbau nötig</Badge>
              )}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {currentMonths >= 6
              ? 'Du hast genug Reserven, um mindestens 6 Monate ohne Einkommen zu überbrücken.'
              : `Ziel: 6 Monate Ausgaben als Reserve. Dir fehlen noch ${fmtCHF(Math.max(0, monthlyExpenses * 6 - Math.max(0, netWorth)))}.`}
          </p>
        </CardContent>
      </Card>

      {/* SECTION 5: Vollständigkeit */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-primary" /> Vollständigkeit
          </h3>
          <div className="flex items-center gap-4">
            {/* Progress ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" className="stroke-muted/30" />
                <circle
                  cx="32" cy="32" r="28" fill="none" strokeWidth="5"
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - completenessPercent / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                {completenessPercent}%
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-sm font-medium text-foreground">
                {addressedCount} von {TOTAL_FIELDS} Felder bearbeitet
              </p>
              {filledCount > 0 && (
                <p className="text-[11px] text-muted-foreground">{filledCount} Felder ausgefüllt</p>
              )}
              {unknownCount > 0 && (
                <p className="text-[11px] text-muted-foreground">{unknownCount} als «Nicht bekannt» markiert</p>
              )}
              {untouchedCount > 0 && (
                <p className="text-[11px] text-muted-foreground/60">{untouchedCount} Felder übersprungen</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">{motivationalText}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
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

      {/* Edit button */}
      <Button variant="outline" className="w-full" onClick={onEdit}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Noch bearbeiten
      </Button>
    </div>
  );
}

// ── History components ─────────────────────────────

function SnapshotHistory({
  snapshots,
  isLoading,
  onCreateNew,
  onDelete,
}: {
  snapshots: any[];
  isLoading: boolean;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Camera className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground mb-1">Noch kein Snapshot</p>
          <p className="text-sm text-muted-foreground mb-4">
            Erstelle deinen ersten Finanz-Snapshot und verfolge deine Entwicklung.
          </p>
          <Button variant="outline" onClick={onCreateNew}>Jetzt starten</Button>
        </CardContent>
      </Card>
    );
  }

  // Reminder banner
  const lastDate = new Date(snapshots[0].created_at);
  const monthsAgo = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  // Compare mode toggle
  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  // Detail view
  if (detailId) {
    const snap = snapshots.find(s => s.id === detailId);
    if (!snap) { setDetailId(null); return null; }
    return <SnapshotDetail snapshot={snap} onBack={() => setDetailId(null)} onDelete={() => { onDelete(snap.id); setDetailId(null); }} />;
  }

  // Compare view
  if (compareMode && selected.length === 2) {
    const [s1, s2] = selected.map(id => snapshots.find(s => s.id === id)!).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setCompareMode(false); setSelected([]); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
          </Button>
          <h3 className="text-sm font-bold text-foreground">Snapshot-Vergleich</h3>
        </div>
        <SnapshotComparison older={s1} newer={s2} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reminder banner */}
      {monthsAgo >= 3 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Dein letzter Snapshot ist {monthsAgo} Monate alt.
                </p>
                <p className="text-xs text-muted-foreground">Zeit für ein Update!</p>
              </div>
              <Button size="sm" onClick={onCreateNew} className="shrink-0 text-xs">
                Neuen Snapshot erstellen →
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Net Worth Chart */}
      {snapshots.length >= 2 && (
        <NetWorthChart snapshots={snapshots} onPointClick={(id) => setDetailId(id)} />
      )}

      {/* Compare button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Snapshot-Verlauf</h3>
        {snapshots.length >= 2 && (
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            className="text-xs h-8"
            onClick={() => { setCompareMode(!compareMode); setSelected([]); }}
          >
            {compareMode ? 'Abbrechen' : 'Vergleichen'}
          </Button>
        )}
      </div>

      {compareMode && selected.length < 2 && (
        <p className="text-xs text-muted-foreground text-center">
          Wähle 2 Snapshots zum Vergleichen ({selected.length}/2 gewählt)
        </p>
      )}

      {/* Timeline */}
      {snapshots.map((snap: any, idx: number) => {
        const prev = snapshots[idx + 1] || null;
        const nw = snap.net_worth || 0;
        const diff = prev ? nw - (prev.net_worth || 0) : null;
        const diffPct = diff !== null && prev?.net_worth ? ((diff / Math.abs(prev.net_worth)) * 100) : null;
        const data = snap.snapshot_data || {};

        // Completeness calculation
        const TOTAL_FIELDS = 15;
        const fieldKeys = ['pillar_3a', 'freizuegigkeit', 'pensionskasse', 'ahv_annual', 'cash',
          'monthly_income', 'monthly_expenses', 'insurance_monthly'];
        const listSkipKeys = ['bank_accounts_skipped', 'valuables_skipped', 'investment_positions_skipped',
          'crypto_positions_skipped', 'other_assets_skipped', 'credits_skipped', 'debts_skipped'];
        let addressed = 0;
        fieldKeys.forEach(k => {
          const v = data[k];
          if (v?.skipped || (v?.amount && String(v.amount).trim() !== '')) addressed++;
        });
        listSkipKeys.forEach(k => {
          if (data[k]) addressed++;
          else {
            const listKey = k.replace('_skipped', '');
            if (Array.isArray(data[listKey]) && data[listKey].length > 0) addressed++;
          }
        });
        const filled = addressed;

        const isSelected = selected.includes(snap.id);

        return (
          <motion.div key={snap.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card
              className={cn(
                "overflow-hidden cursor-pointer transition-all active:scale-[0.98]",
                compareMode && isSelected && "ring-2 ring-primary",
              )}
              onClick={() => compareMode ? toggleSelect(snap.id) : setDetailId(snap.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {compareMode && (
                    <Checkbox checked={isSelected} className="mt-1 shrink-0" />
                  )}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">📸</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(snap.created_at), 'dd. MMMM yyyy', { locale: de })}
                      </p>
                      {!compareMode && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nettovermögen: <span className="font-medium text-foreground">CHF {nw.toLocaleString('de-CH')}</span>
                    </p>
                    {diff !== null && (
                      <span className={cn("text-[11px] font-medium inline-flex items-center gap-0.5",
                        diff >= 0 ? "text-primary" : "text-destructive"
                      )}>
                        {diff >= 0 ? '+' : ''}CHF {diff.toLocaleString('de-CH')}
                        {diffPct !== null && ` (${diff >= 0 ? '↑' : '↓'} ${Math.abs(diffPct).toFixed(1)}%)`}
                      </span>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{filled} von {TOTAL_FIELDS} Felder bearbeitet</span>
                      {snap.peak_score != null && <span>PeakScore: {snap.peak_score}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Compare button at bottom when 2 selected */}
      {compareMode && selected.length === 2 && (
        <Button className="w-full" onClick={() => {}}>
          Snapshots vergleichen
        </Button>
      )}
    </div>
  );
}

// ── Net Worth Chart ────────────────────────────────

function NetWorthChart({
  snapshots,
  onPointClick,
}: {
  snapshots: Array<{ id: string; created_at: string; net_worth: number }>;
  onPointClick: (id: string) => void;
}) {
  // Reverse to chronological order
  const chartData = [...snapshots].reverse().map(s => ({
    id: s.id,
    date: format(new Date(s.created_at), 'dd.MM.yy', { locale: de }),
    value: s.net_worth || 0,
  }));

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" /> Nettovermögen-Entwicklung
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
              onClick={(e) => {
                if (e?.activePayload?.[0]?.payload?.id) {
                  onPointClick(e.activePayload[0].payload.id);
                }
              }}
            >
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`CHF ${value.toLocaleString('de-CH')}`, 'Nettovermögen']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#nwGrad)"
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, cursor: 'pointer' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Snapshot Detail ────────────────────────────────

function SnapshotDetail({
  snapshot,
  onBack,
  onDelete,
}: {
  snapshot: any;
  onBack: () => void;
  onDelete: () => void;
}) {
  const data = snapshot.snapshot_data || {};
  const netWorth = snapshot.net_worth || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
        </Button>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">
            Snapshot vom {format(new Date(snapshot.created_at), 'dd. MMMM yyyy', { locale: de })}
          </h3>
        </div>
      </div>

      <Card className={cn("border-2", netWorth >= 0 ? "border-primary/30" : "border-destructive/30")}>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Nettovermögen</p>
          <p className={cn("text-2xl font-bold", netWorth >= 0 ? "text-primary" : "text-destructive")}>
            CHF {netWorth.toLocaleString('de-CH')}
          </p>
        </CardContent>
      </Card>

      {/* All fields */}
      <Card>
        <CardContent className="p-4 space-y-2">
          {Object.entries(STATIC_FIELD_LABELS).map(([key, meta]) => {
            const fieldData = data[key];
            if (!fieldData) return null;
            const amount = typeof fieldData === 'object' ? fieldData.amount : fieldData;
            if (!amount && amount !== 0) return null;
            const provider = typeof fieldData === 'object' ? fieldData.provider : null;
            const link = typeof fieldData === 'object' ? fieldData.link : null;
            return (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  {meta.emoji} {meta.label}
                  {provider && <span className="text-[10px]">({provider})</span>}
                  {link && (
                    <button onClick={() => window.open(link, '_blank', 'noopener,noreferrer')} className="p-0.5 rounded hover:bg-primary/10">
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </span>
                <span className="font-medium text-foreground">CHF {Number(amount).toLocaleString('de-CH')}</span>
              </div>
            );
          })}
          {Array.isArray(data.bank_accounts) && data.bank_accounts.map((a: any, i: number) => (
            n(a.balance) > 0 && (
              <div key={`ba-${i}`} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  🏦 {a.name || 'Konto'}{a.bank && <span className="text-[10px]">({a.bank})</span>}
                  {a.link && (
                    <button onClick={() => window.open(a.link, '_blank', 'noopener,noreferrer')} className="p-0.5 rounded hover:bg-primary/10">
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </span>
                <span className="font-medium text-foreground">CHF {Number(a.balance).toLocaleString('de-CH')}</span>
              </div>
            )
          ))}
          {Array.isArray(data.investment_positions) && data.investment_positions.map((inv: any, i: number) => (
            n(inv.value) > 0 && (
              <div key={`inv-${i}`} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  📊 {inv.name || 'Investment'}
                  {inv.link && (
                    <button onClick={() => window.open(inv.link, '_blank', 'noopener,noreferrer')} className="p-0.5 rounded hover:bg-primary/10">
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </span>
                <span className="font-medium text-foreground">CHF {Number(inv.value).toLocaleString('de-CH')}</span>
              </div>
            )
          ))}
          {Array.isArray(data.crypto_positions) && data.crypto_positions.map((c: any, i: number) => (
            n(c.value) > 0 && (
              <div key={`cry-${i}`} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  🪙 {c.name || 'Krypto'}
                  {c.link && (
                    <button onClick={() => window.open(c.link, '_blank', 'noopener,noreferrer')} className="p-0.5 rounded hover:bg-primary/10">
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </span>
                <span className="font-medium text-foreground">CHF {Number(c.value).toLocaleString('de-CH')}</span>
              </div>
            )
          ))}
          {Array.isArray(data.properties) && data.properties.map((p: any, i: number) => (
            n(p.market_value) > 0 && (
              <div key={`p-${i}`} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  🏠 {p.description || 'Immobilie'}
                  {p.link && (
                    <button onClick={() => window.open(p.link, '_blank', 'noopener,noreferrer')} className="p-0.5 rounded hover:bg-primary/10">
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </span>
                <span className="font-medium text-foreground">CHF {Number(p.market_value).toLocaleString('de-CH')}</span>
              </div>
            )
          ))}
          {Array.isArray(data.credits) && data.credits.map((c: any, i: number) => (
            n(c.remaining) > 0 && (
              <div key={`cr-${i}`} className="flex justify-between text-sm">
                <span className="text-muted-foreground">💳 {c.name || 'Kredit'}</span>
                <span className="font-medium text-destructive">-CHF {Number(c.remaining).toLocaleString('de-CH')}</span>
              </div>
            )
          ))}
          {Array.isArray(data.debts) && data.debts.map((d: any, i: number) => (
            n(d.amount) > 0 && (
              <div key={`db-${i}`} className="flex justify-between text-sm">
                <span className="text-muted-foreground">📋 {d.description || 'Schuld'}</span>
                <span className="font-medium text-destructive">-CHF {Number(d.amount).toLocaleString('de-CH')}</span>
              </div>
            )
          ))}
          {snapshot.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">📝 {snapshot.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5 mr-1" /> Snapshot löschen
      </Button>
    </div>
  );
}

// ── Snapshot Comparison ────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SnapshotComparison({ older, newer }: { older: any; newer: any }) {
  const olderData = older.snapshot_data || {};
  const newerData = newer.snapshot_data || {};
  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH')}`;

  // Freedom impact: net worth delta / monthly expenses
  const netWorthDelta = (Number(newer.net_worth) || 0) - (Number(older.net_worth) || 0);
  const monthlyExp = n(newerData.monthly_expenses?.amount) || n(olderData.monthly_expenses?.amount);
  const freedomMonths = monthlyExp > 0 ? netWorthDelta / monthlyExp : 0;

  const categories = [
    { label: 'Nettovermögen', oldVal: Number(older.net_worth) || 0, newVal: Number(newer.net_worth) || 0 },
    { label: '3a Guthaben', oldVal: n(olderData.pillar_3a?.amount), newVal: n(newerData.pillar_3a?.amount) },
    { label: 'Freizügigkeit', oldVal: n(olderData.freizuegigkeit?.amount), newVal: n(newerData.freizuegigkeit?.amount) },
    { label: 'Pensionskasse', oldVal: n(olderData.pensionskasse?.amount), newVal: n(newerData.pensionskasse?.amount) },
    { label: 'Bankkonten', oldVal: Array.isArray(olderData.bank_accounts) ? sumBankAccounts(olderData.bank_accounts) : 0, newVal: Array.isArray(newerData.bank_accounts) ? sumBankAccounts(newerData.bank_accounts) : 0 },
    { label: 'Bargeld', oldVal: n(olderData.cash?.amount), newVal: n(newerData.cash?.amount) },
    { label: 'Investments', oldVal: Array.isArray(olderData.investment_positions) ? sumInvestments(olderData.investment_positions) : 0, newVal: Array.isArray(newerData.investment_positions) ? sumInvestments(newerData.investment_positions) : 0 },
    { label: 'Krypto', oldVal: Array.isArray(olderData.crypto_positions) ? sumCrypto(olderData.crypto_positions) : 0, newVal: Array.isArray(newerData.crypto_positions) ? sumCrypto(newerData.crypto_positions) : 0 },
    { label: 'Kredite', oldVal: Array.isArray(olderData.credits) ? sumCredits(olderData.credits) : 0, newVal: Array.isArray(newerData.credits) ? sumCredits(newerData.credits) : 0 },
    { label: 'Einkommen mtl.', oldVal: n(olderData.monthly_income?.amount), newVal: n(newerData.monthly_income?.amount) },
    { label: 'Ausgaben mtl.', oldVal: n(olderData.monthly_expenses?.amount), newVal: n(newerData.monthly_expenses?.amount) },
  ];

  return (
    <div className="space-y-3">
      {/* Freedom impact summary */}
      {monthlyExp > 0 && freedomMonths !== 0 && (
        <div className={cn(
          'p-3 rounded-xl text-xs font-medium text-center',
          freedomMonths > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
        )}>
          {formatSnapshotTrend(freedomMonths)}
        </div>
      )}

      {/* Header row */}
      <div className="grid grid-cols-4 gap-2 text-[10px] font-medium text-muted-foreground px-2">
        <span>Kategorie</span>
        <span className="text-right">{format(new Date(String(older.created_at)), 'dd.MM.yy')}</span>
        <span className="text-right">{format(new Date(String(newer.created_at)), 'dd.MM.yy')}</span>
        <span className="text-right">Δ</span>
      </div>

      {categories.map(cat => {
        const delta = cat.newVal - cat.oldVal;
        if (cat.oldVal === 0 && cat.newVal === 0) return null;
        return (
          <Card key={cat.label} className="overflow-hidden">
            <CardContent className="p-3 grid grid-cols-4 gap-2 items-center">
              <span className="text-xs font-medium text-foreground">{cat.label}</span>
              <span className="text-xs text-muted-foreground text-right">{fmtCHF(cat.oldVal)}</span>
              <span className="text-xs text-foreground font-medium text-right">{fmtCHF(cat.newVal)}</span>
              <span className={cn("text-xs font-semibold text-right",
                delta > 0 ? "text-primary" : delta < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {delta > 0 ? '+' : ''}{fmtCHF(delta)}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
