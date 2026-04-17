import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';
import { useGoldNuts } from '@/hooks/useGoldNuts';
import { useHamsterSheets } from '@/hooks/useHamsterSheets';
import { GOLD_NUTS, GOLD_NUT_TOTAL, type GoldNutCategory, type GoldNutDef } from '@/config/goldNuts';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<GoldNutCategory, string> = {
  onboarding: 'Onboarding',
  wissen: 'Wissen',
  finanzen: 'Finanzen',
  peakscore: 'PeakScore',
  konstanz: 'Konstanz',
  social: 'Social',
  tools: 'Tools',
};

const CATEGORY_ORDER: GoldNutCategory[] = [
  'onboarding', 'wissen', 'finanzen', 'peakscore', 'konstanz', 'social', 'tools',
];

export function AchievementsSheet() {
  const { open, close } = useHamsterSheets();
  const isOpen = open === 'achievements';
  const { collectedCount, totalPossible, hasGoldNut, catalogCount } = useGoldNuts();
  const [selected, setSelected] = useState<GoldNutDef | null>(null);

  const pct = Math.min(100, Math.round((collectedCount / totalPossible) * 100));
  const remainingFuture = GOLD_NUT_TOTAL - catalogCount;

  // Group by category preserving definition order.
  const byCategory: Record<GoldNutCategory, GoldNutDef[]> = {
    onboarding: [], wissen: [], finanzen: [], peakscore: [], konstanz: [], social: [], tools: [],
  };
  GOLD_NUTS.forEach(n => byCategory[n.category].push(n));

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (!o) close(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-center text-base font-bold">Deine Errungenschaften</SheetTitle>
        </SheetHeader>

        {/* HEADER */}
        <div className="text-center space-y-2 pb-4 border-b border-border">
          <p className="text-3xl">🥜</p>
          <p className="text-sm font-semibold text-foreground">
            <span className="text-warning">{collectedCount}</span>
            <span className="text-muted-foreground"> von {totalPossible} Goldnüssen gefunden</span>
          </p>
          <Progress
            value={pct}
            className="h-2.5 [&>div]:bg-warning"
          />
          <p className="text-[11px] text-muted-foreground">{pct}% gesammelt</p>
        </div>

        {/* SECTIONS */}
        <div className="mt-4 space-y-6 pb-4">
          {CATEGORY_ORDER.map(cat => {
            const items = byCategory[cat];
            if (items.length === 0) return null;
            const earned = items.filter(i => hasGoldNut(i.key)).length;
            return (
              <section key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground">{CATEGORY_LABELS[cat]}</h3>
                  <span className="text-[11px] text-muted-foreground">{earned}/{items.length} gefunden</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {items.map(nut => {
                    const owned = hasGoldNut(nut.key);
                    return (
                      <button
                        key={nut.key}
                        onClick={() => setSelected(nut)}
                        className={cn(
                          'rounded-xl aspect-square flex flex-col items-center justify-center p-1.5 text-center transition-all active:scale-95',
                          owned
                            ? 'bg-warning/15 ring-1 ring-warning/40 hover:ring-warning/70'
                            : 'bg-muted ring-1 ring-border hover:ring-foreground/20',
                        )}
                      >
                        {owned ? (
                          <>
                            <span className="text-xl" aria-hidden>🥜</span>
                            <span className="text-[9px] font-medium text-foreground leading-tight mt-0.5 line-clamp-2">
                              {nut.label}
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 text-muted-foreground/60" />
                            <span className="text-[9px] text-muted-foreground mt-0.5">???</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Locked future section */}
          {remainingFuture > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Weitere kommen…
                </h3>
                <span className="text-[11px] text-muted-foreground">+{remainingFuture}</span>
              </div>
              <div className="rounded-xl bg-muted/40 border border-dashed border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Es warten noch {remainingFuture} weitere Goldnüsse darauf, freigeschaltet zu werden.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Detail popover */}
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[110] bg-background/70 backdrop-blur-sm flex items-end justify-center p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 text-center"
            >
              <div className="text-4xl mb-2">{hasGoldNut(selected.key) ? '🥜' : '🔒'}</div>
              {hasGoldNut(selected.key) ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                    {CATEGORY_LABELS[selected.category]}
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">{selected.label}</p>
                  <p className="text-sm text-muted-foreground mt-1.5">{selected.description}</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABELS[selected.category]}
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">???</p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Diese Goldnuss wartet noch darauf, von dir gefunden zu werden.
                  </p>
                </>
              )}
            </div>
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
}
