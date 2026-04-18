import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useHamsterSheets } from '@/hooks/useHamsterSheets';

const BUDGET_CATEGORIES = [
  'Wohnen', 'Essen', 'Transport', 'Versicherungen', 'Gesundheit',
  'Freizeit', 'Kleidung', 'Bildung', 'Abos', 'Sonstiges',
];

type ActiveAction = null | 'expense';

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function QuickActionFAB() {
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [xpAnim, setXpAnim] = useState<number | null>(null);
  const navigate = useNavigate();
  const { openInventory, openAchievements } = useHamsterSheets();

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
            className="fixed bottom-28 right-6 z-[60] pointer-events-none"
          >
            <span className="text-lg font-bold text-primary drop-shadow-md">
              +{xpAnim} XP ✨
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button — sits above bottom nav (~64px) + "Mehr entdecken" button (~56px) */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed z-50 bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] right-6',
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
              <ActionTile
                emoji="🗺️"
                label="Life Map"
                onClick={() => {
                  handleClose();
                  navigate('/app/client-portal');
                  setTimeout(() => {
                    document.getElementById('life-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 200);
                }}
              />
              <ActionTile
                emoji="🎒"
                label="Inventar"
                onClick={() => { handleClose(); openInventory(); }}
              />
              <ActionTile
                emoji="🏆"
                label="Errungenschaften"
                onClick={() => { handleClose(); openAchievements(); }}
              />
              <ActionTile
                emoji="💸"
                label="Ausgabe erfassen"
                onClick={() => setActiveAction('expense')}
              />
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

// Other quick actions (Aufgabe / Ziel / Erkenntnis) sind in dieser Iteration
// entfernt — Inventar / Errungenschaften / Life Map ersetzen sie. Bei Bedarf
// können die alten Form-Komponenten aus der Git-Historie wiederhergestellt werden.
