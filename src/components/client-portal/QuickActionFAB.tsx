import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, DollarSign, CheckCircle2, Target, Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const BUDGET_CATEGORIES = [
  'Wohnen', 'Essen', 'Transport', 'Versicherungen', 'Gesundheit',
  'Freizeit', 'Kleidung', 'Bildung', 'Abos', 'Sonstiges',
];

type ActiveAction = null | 'expense' | 'task' | 'goal' | 'insight';

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function QuickActionFAB() {
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [xpAnim, setXpAnim] = useState<number | null>(null);

  const showXp = (amount: number) => {
    setXpAnim(amount);
    setTimeout(() => setXpAnim(null), 1500);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveAction(null);
  };

  const handleActionComplete = (xp?: number) => {
    if (xp) showXp(xp);
    handleClose();
  };

  return (
    <>
      {/* XP animation */}
      <AnimatePresence>
        {xpAnim !== null && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          >
            <span className="text-lg font-bold text-primary drop-shadow-md">
              +{xpAnim} XP ✨
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed z-50 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] left-1/2 -translate-x-1/2',
          'w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg',
          'flex items-center justify-center',
          'hover:bg-primary/90 active:scale-95 transition-all duration-150',
        )}
        aria-label="Schnellaktion"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base font-bold">Schnellaktion</SheetTitle>
          </SheetHeader>

          {!activeAction ? (
            <div className="grid grid-cols-2 gap-3 py-3">
              <ActionTile emoji="💸" label="Ausgabe erfassen" onClick={() => setActiveAction('expense')} />
              <ActionTile emoji="✅" label="Aufgabe erledigt" onClick={() => setActiveAction('task')} />
              <ActionTile emoji="🎯" label="Ziel aktualisieren" onClick={() => setActiveAction('goal')} />
              <ActionTile emoji="💡" label="Erkenntnis notieren" onClick={() => setActiveAction('insight')} />
            </div>
          ) : (
            <div className="py-2">
              <button
                onClick={() => setActiveAction(null)}
                className="text-xs text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1"
              >
                ← Zurück
              </button>
              {activeAction === 'expense' && <ExpenseForm onComplete={handleActionComplete} />}
              {activeAction === 'task' && <TaskForm onComplete={handleActionComplete} />}
              {activeAction === 'goal' && <GoalForm onComplete={handleActionComplete} />}
              {activeAction === 'insight' && <InsightForm onComplete={handleActionComplete} />}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ActionTile({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.97]"
    >
      <CardContent className="p-4 text-center space-y-1">
        <span className="text-2xl">{emoji}</span>
        <p className="text-sm font-medium text-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ─── Expense Form ───
function ExpenseForm({ onComplete }: { onComplete: (xp?: number) => void }) {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id || !amount || !category) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('budget_expenses').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        category,
        note: note || null,
        expense_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      await awardPoints('expense_added', `quick-${Date.now()}`);
      toast.success('Ausgabe gespeichert');
      onComplete(10);
    } catch {
      toast.error('Fehler beim Speichern');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Betrag (CHF)</Label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="z.B. 45.50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12 text-base"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label>Kategorie</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-12"><SelectValue placeholder="Wählen…" /></SelectTrigger>
          <SelectContent>
            {BUDGET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notiz (optional)</Label>
        <Input
          placeholder="z.B. Mittagessen"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-12 text-base"
        />
      </div>
      <Button
        className="w-full h-12 rounded-xl"
        onClick={handleSave}
        disabled={saving || !amount || !category}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Speichern'}
      </Button>
    </div>
  );
}

// ─── Task Form ───
function TaskForm({ onComplete }: { onComplete: (xp?: number) => void }) {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['quick-open-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('client_tasks')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleComplete = async (taskId: string) => {
    const { error } = await supabase
      .from('client_tasks')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', taskId);
    if (error) { toast.error('Fehler'); return; }
    await awardPoints('task_completed', taskId);
    queryClient.invalidateQueries({ queryKey: ['quick-open-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    toast.success('Aufgabe erledigt!');
    onComplete(50);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (!tasks?.length) return <p className="text-sm text-muted-foreground text-center py-6">Keine offenen Aufgaben 🎉</p>;

  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {tasks.map((t) => (
        <Card key={t.id} className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => handleComplete(t.id)}>
          <CardContent className="p-3 flex items-center gap-3">
            <Checkbox className="pointer-events-none" />
            <span className="text-sm text-foreground flex-1">{t.title}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Goal Form ───
function GoalForm({ onComplete }: { onComplete: (xp?: number) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['quick-active-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('client_goals')
        .select('id, title, current_amount, target_amount')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState('');

  const handleUpdate = async (goalId: string) => {
    if (!newAmount) return;
    const { error } = await supabase
      .from('client_goals')
      .update({ current_amount: parseFloat(newAmount) })
      .eq('id', goalId);
    if (error) { toast.error('Fehler'); return; }
    queryClient.invalidateQueries({ queryKey: ['quick-active-goals'] });
    queryClient.invalidateQueries({ queryKey: ['client-goals'] });
    toast.success('Ziel aktualisiert');
    onComplete();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (!goals?.length) return <p className="text-sm text-muted-foreground text-center py-6">Keine aktiven Ziele</p>;

  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {goals.map((g) => (
        <Card key={g.id} className="transition-all">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{g.title}</span>
              <span className="text-xs text-muted-foreground">
                CHF {g.current_amount?.toLocaleString('de-CH')}
                {g.target_amount ? ` / ${g.target_amount.toLocaleString('de-CH')}` : ''}
              </span>
            </div>
            {editingId === g.id ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Neuer Betrag"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="h-10 text-base flex-1"
                  autoFocus
                />
                <Button size="sm" className="h-10 rounded-xl" onClick={() => handleUpdate(g.id)}>
                  OK
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 rounded-xl text-xs"
                onClick={() => { setEditingId(g.id); setNewAmount(String(g.current_amount || '')); }}
              >
                Aktualisieren
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Insight Form ───
function InsightForm({ onComplete }: { onComplete: (xp?: number) => void }) {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id || !content.trim()) return;
    setSaving(true);
    try {
      const { error } = await (supabase as unknown as { from: (t: string) => { insert: (d: Record<string, unknown>) => Promise<{ error: unknown }> } })
        .from('user_insights')
        .insert({
          user_id: user.id,
          content: content.trim(),
          source: 'quick_action',
        });
      if (error) throw error;
      await awardPoints('tool_used', `insight-${Date.now()}`);
      toast.success('Erkenntnis gespeichert');
      onComplete(15);
    } catch {
      toast.error('Fehler beim Speichern');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Deine Erkenntnis</Label>
        <Textarea
          placeholder="Was hast du heute gelernt oder erkannt?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] text-base"
          autoFocus
        />
      </div>
      <Button
        className="w-full h-12 rounded-xl"
        onClick={handleSave}
        disabled={saving || !content.trim()}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Speichern'}
      </Button>
    </div>
  );
}
