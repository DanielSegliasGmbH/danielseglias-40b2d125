import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const INFLATION_RATE = 0.02; // 2% annual
const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

export function InflationTickerCard() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionStart = useRef(Date.now());

  // Check if user has opted out
  const { data: profile } = useQuery({
    queryKey: ['profile-truth-moments', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('show_truth_moments')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Get liquid cash: cash + savings from net_worth_assets
  const { data: liquidCash = 0 } = useQuery({
    queryKey: ['liquid-cash', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from('net_worth_assets')
        .select('value, category')
        .eq('user_id', user.id)
        .in('category', ['cash', 'savings', 'Bargeld', 'Sparkonto', 'Bankkonto']);
      return (data || []).reduce((s, a) => s + Number(a.value), 0);
    },
    enabled: !!user,
  });

  // Live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStart.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const lossPerSecond = (liquidCash * INFLATION_RATE) / SECONDS_PER_YEAR;
  const currentLoss = lossPerSecond * elapsedSeconds;
  const dailyLoss = lossPerSecond * 86400;
  const yearlyLoss = liquidCash * INFLATION_RATE;

  const fmtCHF = (v: number) => {
    if (v < 0.01) return 'CHF 0.00';
    return `CHF ${v.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Don't show if opted out, no user, or no liquid cash
  if (!user || (profile && !(profile as any).show_truth_moments) || liquidCash <= 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
      <Card
        className={cn(
          "overflow-hidden cursor-pointer active:scale-[0.99] transition-all border-destructive/20",
          expanded ? "bg-destructive/5" : ""
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-3">
          {/* Ticker strip */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">
                Seit du die App geöffnet hast
              </p>
              <p className="text-sm font-mono font-bold text-destructive">
                <PrivateValue>−{fmtCHF(currentLoss)}</PrivateValue>
                <span className="text-[10px] font-normal text-muted-foreground ml-1">Kaufkraft</span>
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>

          {/* Expanded detail */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Was passiert hier?</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Inflation frisst jede Sekunde einen kleinen Teil deines Geldes.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Bargeld</p>
                      <p className="text-xs font-bold text-foreground">
                        <PrivateValue>{fmtCHF(liquidCash)}</PrivateValue>
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Pro Tag</p>
                      <p className="text-xs font-bold text-destructive">
                        <PrivateValue>−{fmtCHF(dailyLoss)}</PrivateValue>
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Pro Jahr</p>
                      <p className="text-xs font-bold text-destructive">
                        <PrivateValue>−{fmtCHF(yearlyLoss)}</PrivateValue>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Bei {(INFLATION_RATE * 100).toFixed(0)}% Inflation verlierst du real Geld.
                    Die Lösung: <span className="font-semibold text-foreground">Investieren.</span>
                  </p>

                  <Link
                    to="/app/client-portal/tools"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Konten-Modell & Investment-Tools
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
