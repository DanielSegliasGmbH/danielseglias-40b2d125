import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, Lock, Check } from 'lucide-react';
import { HamsterAvatar } from '@/components/client-portal/HamsterAvatar';
import { useHamster } from '@/hooks/useHamster';
import { useGoldNuts } from '@/hooks/useGoldNuts';
import { useHamsterSheets } from '@/hooks/useHamsterSheets';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GOLD_NUT_TOTAL } from '@/config/goldNuts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShopItem {
  id: string;
  type: 'skin' | 'hat' | 'item';
  emoji: string;
  label: string;
  cost: number;
  costType: 'free' | 'coins' | 'goldnuts';
  locked?: boolean;
  comingSoon?: boolean;
}

const SHOP_SKINS: ShopItem[] = [
  { id: 'classic',  type: 'skin', emoji: '🐹', label: 'Klassisch',         cost: 0,   costType: 'free' },
  { id: 'female',   type: 'skin', emoji: '🐹', label: 'Weiblich',          cost: 0,   costType: 'free' },
  { id: 'ninja',    type: 'skin', emoji: '🥷', label: 'Ninja',             cost: 200, costType: 'coins',    comingSoon: true, locked: true },
  { id: 'royal',    type: 'skin', emoji: '👑', label: 'Königlich',         cost: 5,   costType: 'goldnuts', comingSoon: true, locked: true },
];

const SHOP_HATS: ShopItem[] = [
  { id: 'cap',      type: 'hat', emoji: '🧢', label: 'Cap',                cost: 100, costType: 'coins',    comingSoon: true, locked: true },
  { id: 'crown',    type: 'hat', emoji: '👑', label: 'Krone',              cost: 3,   costType: 'goldnuts', comingSoon: true, locked: true },
];

export function HamsterInventorySheet() {
  const { open, close } = useHamsterSheets();
  const isOpen = open === 'inventory';
  const { user } = useAuth();
  const {
    rankName, rankDescription, equippedSkin, equippedHat, equippedItem,
    coins, updateEquipment,
  } = useHamster();
  const { collectedCount, totalPossible } = useGoldNuts();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (!o) close(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-2 text-center">
          <SheetTitle className="sr-only">Hamster Inventar</SheetTitle>
        </SheetHeader>

        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-border">
          <HamsterAvatar size="lg" />
          <div>
            <p className="text-base font-bold text-foreground">{rankName}</p>
            <p className="text-xs text-muted-foreground italic max-w-[280px]">{rankDescription}</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
              <span aria-hidden>🪙</span>{coins}
              <span className="text-muted-foreground font-normal text-xs">Münzen</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-semibold text-foreground">
              <span aria-hidden>🥜</span>{collectedCount}
              <span className="text-muted-foreground font-normal text-xs">/ {totalPossible}</span>
            </span>
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue="hamster" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="hamster">Mein Hamster</TabsTrigger>
            <TabsTrigger value="currency">Münzen & Nüsse</TabsTrigger>
          </TabsList>

          {/* TAB 1 — Mein Hamster */}
          <TabsContent value="hamster" className="space-y-4 mt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Aktuell ausgerüstet
              </p>
              <div className="grid grid-cols-3 gap-2">
                <EquippedSlot label="Skin" emoji="🐹" value={equippedSkin} />
                <EquippedSlot label="Hut" emoji="🎩" value={equippedHat ?? 'Keine'} />
                <EquippedSlot label="Item" emoji="✨" value={equippedItem ?? 'Keins'} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Skins
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SHOP_SKINS.map(item => (
                  <ShopTile
                    key={item.id}
                    item={item}
                    isEquipped={item.type === 'skin' && equippedSkin === item.id}
                    onEquip={() => {
                      if (item.locked) return;
                      updateEquipment.mutate({ skin: item.id }, {
                        onSuccess: () => toast.success(`${item.label} ausgerüstet`),
                        onError: () => toast.error('Fehler beim Ausrüsten'),
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Hüte
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SHOP_HATS.map(item => (
                  <ShopTile key={item.id} item={item} isEquipped={false} onEquip={() => {}} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2 — Münzen & Nüsse */}
          <TabsContent value="currency" className="space-y-5 mt-4">
            <CoinSection coins={coins} userId={user?.id} />
            <NutSection collectedCount={collectedCount} totalPossible={totalPossible} />
            <HowToEarnExpandable />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function EquippedSlot({ label, emoji, value }: { label: string; emoji: string; value: string }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-3 text-center">
        <div className="text-2xl mb-1">{emoji}</div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground capitalize truncate">{value}</p>
      </CardContent>
    </Card>
  );
}

function ShopTile({
  item, isEquipped, onEquip,
}: { item: ShopItem; isEquipped: boolean; onEquip: () => void }) {
  return (
    <button
      onClick={onEquip}
      disabled={item.locked || isEquipped}
      className={cn(
        'rounded-xl border p-3 text-left transition-all relative overflow-hidden',
        isEquipped && 'border-primary bg-primary/5 ring-2 ring-primary/40',
        !isEquipped && !item.locked && 'border-border bg-card hover:border-primary/40 active:scale-[0.97] cursor-pointer',
        item.locked && 'border-border bg-muted/30 opacity-60 cursor-not-allowed',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{item.emoji}</span>
        {isEquipped && <Check className="h-4 w-4 text-primary" />}
        {item.locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <p className="text-sm font-semibold text-foreground mt-1.5">{item.label}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        {item.comingSoon
          ? 'Bald verfügbar'
          : item.costType === 'free'
            ? 'Gratis'
            : item.costType === 'coins'
              ? `🪙 ${item.cost} Münzen`
              : `🥜 ${item.cost} Goldnüsse`}
      </p>
    </button>
  );
}

// ── Currency tab pieces ───────────────────────────
function CoinSection({ coins, userId }: { coins: number; userId?: string }) {
  const [history, setHistory] = useState<Array<{ action_type: string; points_awarded: number; created_at: string }>>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('gamification_actions')
        .select('action_type, points_awarded, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!cancelled) setHistory(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Münzen</p>
        <span className="text-2xl font-extrabold text-foreground">🪙 {coins}</span>
      </div>
      <Card>
        <CardContent className="p-3 space-y-1.5">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Noch keine Aktivität.</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{labelForAction(h.action_type)}</span>
                <span className="text-muted-foreground shrink-0 ml-2">+{h.points_awarded} XP</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NutSection({ collectedCount, totalPossible }: { collectedCount: number; totalPossible: number }) {
  const pct = Math.min(100, Math.round((collectedCount / totalPossible) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goldnüsse</p>
        <span className="text-2xl font-extrabold text-foreground">🥜 {collectedCount}<span className="text-sm font-normal text-muted-foreground">/{totalPossible}</span></span>
      </div>
      <Progress value={pct} className="h-2.5" />
      <p className="text-[11px] text-muted-foreground mt-1.5">
        {pct}% deiner Sammlung — jede Goldnuss ist einzigartig.
      </p>
    </div>
  );
}

function HowToEarnExpandable() {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full p-3 flex items-center justify-between text-sm font-semibold text-foreground"
      >
        <span>Wie verdiene ich mehr?</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <CardContent className="pt-0 pb-3 space-y-3 text-xs text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">🪙 Münzen</p>
            <p>Verdienst du täglich durch Aktionen — Login (5), Aufgabe erledigen (15), Coach-Modul (30), Versicherung erfassen (12), Ziel setzen (10) und mehr. Unbegrenzt sammelbar.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">🥜 Goldnüsse</p>
            <p>Selten und einmalig — jede Goldnuss steht für ein bestimmtes Achievement (z. B. „Erste Versicherung erfasst"). Maximal {GOLD_NUT_TOTAL} im Spiel. Beim Finden gibt es +50 Bonus-Münzen.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function labelForAction(action: string): string {
  const map: Record<string, string> = {
    daily_login: 'Tägliches Login',
    task_completed: 'Aufgabe erledigt',
    goal_added: 'Ziel hinzugefügt',
    coach_module_completed: 'Coach-Modul',
    profile_completed: 'Profil komplett',
    insurance_added: 'Versicherung',
    tool_used: 'Tool genutzt',
    expense_added: 'Ausgabe erfasst',
    asset_added: 'Vermögenswert',
    snapshot_completed: 'Snapshot',
    rank_up: 'Rang aufgestiegen',
  };
  return map[action] ?? action;
}
