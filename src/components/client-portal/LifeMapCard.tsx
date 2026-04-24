import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Clock } from 'lucide-react';
import { useLifeMapData, LifeMapTerritory } from '@/hooks/useLifeMapData';

import { cn } from '@/lib/utils';

const COMING_SOON_TERRITORIES: LifeMapTerritory['key'][] = ['vermoegen', 'vorsorge'];

const UNLOCK_INFO: Record<LifeMapTerritory['key'], { description: string; howTo: string; ctaLabel: string; ctaPath: string }> = {
  vermoegen: {
    description: 'Hier siehst du dein Vermögen wachsen — Konten, Investments, 3a, Immobilien — und führst dein Budget.',
    howTo: 'Erfasse deinen ersten Vermögenswert oder eine Ausgabe, um dieses Gebiet zu erschliessen.',
    ctaLabel: 'Zu Mein Budget',
    ctaPath: '/app/client-portal/budget',
  },
  absicherung: {
    description: 'Dein Schutz gegen Lebensrisiken — Versicherungen, Notgroschen, Vorsorgevollmachten.',
    howTo: 'Hinterlege dein erstes Produkt in «Meine Produkte», um dieses Gebiet zu erschliessen.',
    ctaLabel: 'Zu Meine Produkte',
    ctaPath: '/app/client-portal/insurances',
  },
  vorsorge: {
    description: 'Dein Plan für später — Säule 3a, Pensionskasse, AHV.',
    howTo: 'Erfasse deine Säule 3a im Snapshot, um dieses Gebiet zu erschliessen.',
    ctaLabel: 'Zum Snapshot',
    ctaPath: '/app/client-portal/snapshot',
  },
  ziele: {
    description: 'Deine finanziellen Ziele — vom Notgroschen bis zum Eigenheim. Hier hältst du Kurs.',
    howTo: 'Erfasse dein erstes Ziel, um dieses Gebiet zu erschliessen.',
    ctaLabel: 'Zu Meine Ziele',
    ctaPath: '/app/client-portal/goals',
  },
  wissen: {
    description: 'Dein Finanzwissen wächst mit jedem Artikel, jedem Kurs.',
    howTo: 'Lies deinen ersten Artikel in der Bibliothek, um dieses Gebiet zu erschliessen.',
    ctaLabel: 'Zur Bibliothek',
    ctaPath: '/app/client-portal/library',
  },
  anlagestrategie: {
    description: 'Deine persönliche Anlagestrategie — strukturiert investieren mit klarem Risiko-Profil.',
    howTo: 'Erfasse einen Vermögenswert, um deine Anlagestrategie freizuschalten.',
    ctaLabel: 'Zu Anlagestrategie',
    ctaPath: '/app/client-portal/strategies',
  },
};

/**
 * Visual "fog-of-war" map of the user's financial life.
 * Six hexagonal territories light up as the user makes progress.
 */
export function LifeMapCard() {
  const navigate = useNavigate();
  const { territories } = useLifeMapData();
  // ARCHIVED v1.0: progress percent + activeUnlocked footer removed
  // const activeTerritories = territories.filter((t) => !COMING_SOON_TERRITORIES.includes(t.key));
  // const exploredPercent = activeTerritories.length
  //   ? Math.round((activeTerritories.reduce((acc, t) => acc + Math.min(1, t.progress), 0) / activeTerritories.length) * 100)
  //   : 0;
  // const activeTotal = activeTerritories.length;
  // const activeUnlocked = activeTerritories.filter((t) => t.progress > 0).length;
  const [lockedInfo, setLockedInfo] = useState<LifeMapTerritory | null>(null);
  

  // ARCHIVED v1.0: territory unlock toast removed
  // const prevUnlockedRef = useRef<Set<string> | null>(null);
  // useEffect(() => {
  //   const currentUnlocked = new Set(
  //     territories.filter((t) => t.progress > 0).map((t) => t.key),
  //   );
  //   if (prevUnlockedRef.current) {
  //     for (const t of territories) {
  //       if (t.progress > 0 && !prevUnlockedRef.current.has(t.key)) {
  //         toast.success(`+1 Gebiet entdeckt: ${t.label}!`, {
  //           description: 'Deine Finanz-Welt wächst. Mach weiter so!',
  //           duration: 4000,
  //         });
  //       }
  //     }
  //   }
  //   prevUnlockedRef.current = currentUnlocked;
  // }, [territories]);

  const lockedDetails = lockedInfo ? UNLOCK_INFO[lockedInfo.key] : null;

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold tracking-tight">Deine Finanz-Welt</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Entdecke und erschliesse deine Bereiche.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
          {territories.map((t, i) => {
            const isComingSoon = COMING_SOON_TERRITORIES.includes(t.key);
            // Active territories always render as fully discovered
            const displayTerritory: LifeMapTerritory = isComingSoon
              ? t
              : { ...t, progress: 1 };
            return (
              <motion.button
                key={t.key}
                type="button"
                disabled={isComingSoon}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35, ease: 'easeOut' }}
                onClick={() => {
                  if (isComingSoon) return;
                  navigate(t.path);
                }}
                className={cn(
                  'group relative aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl',
                  isComingSoon && 'cursor-not-allowed'
                )}
                aria-label={
                  isComingSoon
                    ? `${t.label} – bald verfügbar`
                    : t.label
                }
              >
                {isComingSoon ? <ComingSoonHexagon label={t.label} /> : <Hexagon territory={displayTerritory} />}
              </motion.button>
            );
          })}
        </div>
      </CardContent>

      <Sheet open={!!lockedInfo} onOpenChange={(open) => !open && setLockedInfo(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {lockedInfo && lockedDetails && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{lockedInfo.emoji}</span>
                  {lockedInfo.label}
                  <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
                </SheetTitle>
                <SheetDescription className="text-sm leading-relaxed pt-2">
                  {lockedDetails.description}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 p-3 rounded-xl bg-muted/60 text-sm text-foreground leading-relaxed">
                {lockedDetails.howTo}
              </div>
              <Button
                className="mt-5 w-full gap-2"
                onClick={() => {
                  navigate(lockedDetails.ctaPath);
                  setLockedInfo(null);
                }}
              >
                Jetzt starten <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

interface HexagonProps {
  territory: LifeMapTerritory;
}

function Hexagon({ territory }: HexagonProps) {
  const { progress, emoji, label, colorVar, glow } = territory;
  const pct = Math.round(progress * 100);

  // State buckets per spec
  const isFog = progress === 0;
  const isFull = progress >= 1;
  const isBright = progress >= 0.67;
  const isMedium = progress >= 0.34;

  // Dim/bright color computation: alpha increases with progress
  const fillAlpha = isFog ? 0 : 0.15 + progress * 0.55;
  const fillColor = isFog ? 'hsl(var(--muted))' : `hsl(${colorVar} / ${fillAlpha})`;
  const strokeColor = isFog ? 'hsl(var(--border))' : `hsl(${colorVar})`;
  const strokeWidth = isBright ? 2.5 : 1.5;

  // Hex points (pointy-top), centered in 100x100 viewBox
  const hexPath =
    'M50 4 L91 27 L91 73 L50 96 L9 73 L9 27 Z';

  return (
    <motion.div
      className="relative w-full h-full"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow layer for bright/full states */}
      {isBright && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ boxShadow: `0 0 20px 2px ${glow}` }}
          animate={isFull ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.7 }}
          transition={isFull ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
      )}

      <svg viewBox="0 0 100 100" className="w-full h-full relative">
        <defs>
          {isFog && (
            <pattern id={`fog-${territory.key}`} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="hsl(var(--muted))" />
              <circle cx="3" cy="3" r="1" fill="hsl(var(--muted-foreground) / 0.18)" />
            </pattern>
          )}
        </defs>
        <path
          d={hexPath}
          fill={isFog ? `url(#fog-${territory.key})` : fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          className={cn('transition-all', isFog && 'opacity-80')}
        />
      </svg>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 pointer-events-none">
        {isFog ? (
          <span className="text-2xl font-bold text-muted-foreground/60">?</span>
        ) : (
          <>
            <span className="text-xl sm:text-2xl leading-none">{emoji}</span>
            <span
              className="mt-1 text-[9px] sm:text-[10px] font-semibold leading-tight text-foreground/90"
              style={{ textShadow: '0 1px 2px hsl(var(--background) / 0.8)' }}
            >
              {label}
            </span>
          </>
        )}
      </div>

      {/* ARCHIVED: completion checkmark badge — hexagon shows only emoji */}
      {/* <AnimatePresence>
        {isFull && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shadow-lg"
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence> */}
      {isFull && (
        <motion.span
          className="absolute top-1 left-1 text-[10px]"
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6], rotate: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✨
        </motion.span>
      )}
    </motion.div>
  );
}

function ComingSoonHexagon({ label }: { label: string }) {
  const hexPath = 'M50 4 L91 27 L91 73 L50 96 L9 73 L9 27 Z';
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={hexPath}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--muted-foreground) / 0.2)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          className="opacity-80"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 pointer-events-none">
        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/70" />
        <span className="mt-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          Bald
        </span>
        <span className="mt-0.5 text-[8px] sm:text-[9px] leading-tight text-muted-foreground/80 line-clamp-2">
          {label}
        </span>
      </div>
    </div>
  );
}
