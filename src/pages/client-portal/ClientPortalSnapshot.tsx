import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { toast } from '@/hooks/use-toast';
import { Camera, History, TrendingUp, TrendingDown, Minus, ArrowLeft, Loader2, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SnapshotFormData {
  monthly_income: string;
  monthly_expenses: string;
  total_savings: string;
  total_investments: string;
  total_debt: string;
  real_estate_value: string;
  pension_1st_pillar: string;
  pension_2nd_pillar: string;
  pension_3a: string;
  insurance_monthly: string;
  emergency_fund: string;
  notes: string;
}

const EMPTY_FORM: SnapshotFormData = {
  monthly_income: '',
  monthly_expenses: '',
  total_savings: '',
  total_investments: '',
  total_debt: '',
  real_estate_value: '',
  pension_1st_pillar: '',
  pension_2nd_pillar: '',
  pension_3a: '',
  insurance_monthly: '',
  emergency_fund: '',
  notes: '',
};

const FIELD_LABELS: Record<keyof Omit<SnapshotFormData, 'notes'>, { label: string; emoji: string; group: string }> = {
  monthly_income: { label: 'Monatliches Einkommen', emoji: '💰', group: 'Einkommen & Ausgaben' },
  monthly_expenses: { label: 'Monatliche Ausgaben', emoji: '🛒', group: 'Einkommen & Ausgaben' },
  total_savings: { label: 'Ersparnisse (Konten)', emoji: '🏦', group: 'Vermögen' },
  total_investments: { label: 'Investitionen (Aktien, ETFs etc.)', emoji: '📈', group: 'Vermögen' },
  real_estate_value: { label: 'Immobilien (Marktwert)', emoji: '🏠', group: 'Vermögen' },
  emergency_fund: { label: 'Notgroschen', emoji: '🛡️', group: 'Vermögen' },
  total_debt: { label: 'Schulden & Hypothek', emoji: '📉', group: 'Verbindlichkeiten' },
  pension_1st_pillar: { label: '1. Säule (AHV geschätzt)', emoji: '🇨🇭', group: 'Vorsorge' },
  pension_2nd_pillar: { label: '2. Säule (Pensionskasse)', emoji: '🏛️', group: 'Vorsorge' },
  pension_3a: { label: '3a Guthaben', emoji: '💎', group: 'Vorsorge' },
  insurance_monthly: { label: 'Versicherungen (monatlich)', emoji: '🔒', group: 'Versicherungen' },
};

function computeNetWorth(data: SnapshotFormData): number {
  const n = (v: string) => Number(v) || 0;
  return n(data.total_savings) + n(data.total_investments) + n(data.real_estate_value) + n(data.emergency_fund) + n(data.pension_3a) - n(data.total_debt);
}

function computeSavingsRate(data: SnapshotFormData): number {
  const income = Number(data.monthly_income) || 0;
  const expenses = Number(data.monthly_expenses) || 0;
  if (income <= 0) return 0;
  return Math.round(((income - expenses) / income) * 100);
}

export default function ClientPortalSnapshot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const [form, setForm] = useState<SnapshotFormData>(EMPTY_FORM);
  const [tab, setTab] = useState('new');
  const [saving, setSaving] = useState(false);

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

  const lastSnapshot = snapshots[0] || null;

  const handleChange = (field: keyof SnapshotFormData, value: string) => {
    if (field === 'notes') {
      setForm(prev => ({ ...prev, notes: value }));
      return;
    }
    // Allow only numbers and dots
    const cleaned = value.replace(/[^0-9.]/g, '');
    setForm(prev => ({ ...prev, [field]: cleaned }));
  };

  const handleSave = async () => {
    if (!user) return;
    const netWorth = computeNetWorth(form);
    setSaving(true);
    try {
      const { error } = await supabase.from('financial_snapshots').insert({
        user_id: user.id,
        snapshot_data: form as any,
        net_worth: netWorth,
        notes: form.notes || null,
      });
      if (error) throw error;

      await awardPoints('snapshot_completed', 'snapshot_' + Date.now());
      queryClient.invalidateQueries({ queryKey: ['financial-snapshots'] });
      toast({ title: 'Snapshot gespeichert! 📸', description: '+100 XP verdient' });
      setForm(EMPTY_FORM);
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

  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH', { minimumFractionDigits: 0 })}`;

  // Group fields for the form
  const groups = useMemo(() => {
    const g: Record<string, (keyof Omit<SnapshotFormData, 'notes'>)[]> = {};
    for (const [key, meta] of Object.entries(FIELD_LABELS)) {
      if (!g[meta.group]) g[meta.group] = [];
      g[meta.group].push(key as keyof Omit<SnapshotFormData, 'notes'>);
    }
    return g;
  }, []);

  const netWorth = computeNetWorth(form);
  const savingsRate = computeSavingsRate(form);
  const hasData = Object.entries(form).some(([k, v]) => k !== 'notes' && v !== '');

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

          {/* Tab 1: New Snapshot */}
          <TabsContent value="new" className="space-y-4 mt-4">
            {/* Live preview */}
            {hasData && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Live-Vorschau</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Nettovermögen</p>
                        <p className={cn("text-lg font-bold", netWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                          {fmtCHF(netWorth)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Sparquote</p>
                        <p className="text-lg font-bold text-foreground">{savingsRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Form groups */}
            {Object.entries(groups).map(([groupName, fields]) => (
              <Card key={groupName}>
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{groupName}</h3>
                  {fields.map((field) => {
                    const meta = FIELD_LABELS[field];
                    return (
                      <div key={field} className="space-y-1">
                        <Label className="text-xs flex items-center gap-1.5">
                          <span>{meta.emoji}</span> {meta.label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">CHF</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={form[field]}
                            onChange={(e) => handleChange(field, e.target.value)}
                            placeholder="0"
                            className="pl-11 text-right"
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Notes */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Label className="text-xs">📝 Notizen (optional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="z.B. Bonus erhalten, Hypothek abgeschlossen..."
                  rows={3}
                  maxLength={500}
                />
              </CardContent>
            </Card>

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={saving || !hasData}
              className="w-full h-12 text-base font-semibold"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gespeichert...</>
              ) : (
                <>📸 Snapshot speichern · +100 XP</>
              )}
            </Button>
          </TabsContent>

          {/* Tab 2: History */}
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
                  <Button variant="outline" onClick={() => setTab('new')}>
                    Jetzt starten
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Comparison banner if 2+ snapshots */}
                {snapshots.length >= 2 && (
                  <ComparisonBanner current={snapshots[0]} previous={snapshots[1]} />
                )}

                {snapshots.map((snap: any, idx: number) => (
                  <SnapshotCard
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

function ComparisonBanner({ current, previous }: { current: any; previous: any }) {
  const diff = (current.net_worth || 0) - (previous.net_worth || 0);
  const positive = diff >= 0;
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("border-0", positive ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30")}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            positive ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50"
          )}>
            <Icon className={cn("h-5 w-5", positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seit letztem Snapshot</p>
            <p className={cn("font-bold", positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
              {positive ? '+' : ''}CHF {diff.toLocaleString('de-CH')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SnapshotCard({ snapshot, previous, onDelete }: { snapshot: any; previous: any; onDelete: () => void }) {
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
                <span className={cn("text-[10px] font-medium", diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
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
              {Object.entries(FIELD_LABELS).map(([key, meta]) => {
                const val = data[key];
                if (!val && val !== 0) return null;
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{meta.emoji} {meta.label}</span>
                    <span className="font-medium text-foreground">CHF {Number(val).toLocaleString('de-CH')}</span>
                  </div>
                );
              })}
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
