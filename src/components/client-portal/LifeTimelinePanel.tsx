import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

const COLOR_HUMAN = 'hsl(42 92% 52%)';      // gold
const COLOR_ASSETS = 'hsl(142 71% 45%)';    // green
const COLOR_PENSION = 'hsl(212 92% 55%)';   // blue

const AHV_MONTHLY = 2450;
const PK_MONTHLY = Math.round(AHV_MONTHLY * 0.6); // ≈ 1470
const PENSION_TOTAL_MONTHLY = AHV_MONTHLY + PK_MONTHLY;
const PENSION_TOTAL_YEARLY = PENSION_TOTAL_MONTHLY * 12;

const fmtCHF = (n: number) =>
  `CHF ${Math.round(n).toLocaleString('de-CH')}`;

interface YearPoint {
  age: number;
  humankapital: number;
  vermoegen: number;
  rente: number;
}

export function LifeTimelinePanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const age = profile?.age ?? 30;
  const monthlyIncome = profile?.monthlyIncome ?? 0;
  const yearlyIncome = monthlyIncome * 12;
  const retirementAge = profile?.freedomTargetAge ?? 65;
  const lifeEnd = 100;

  // Real-time net worth from net_worth_assets (SST)
  const { data: assetsTotal = 0 } = useQuery({
    queryKey: ['life-timeline-assets', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from('net_worth_assets')
        .select('value')
        .eq('user_id', user.id);
      return (data || []).reduce((s, a: any) => s + Number(a.value || 0), 0);
    },
    enabled: !!user,
  });

  const currentNetWorth = assetsTotal > 0 ? assetsTotal : (profile?.wealth ?? 0);

  // ── Humankapital today (PV of remaining lifetime earnings) ──
  const humankapitalToday = useMemo(() => {
    const yearsLeft = Math.max(0, retirementAge - age);
    const growth = 0.02;
    let total = 0;
    for (let y = 0; y < yearsLeft; y++) {
      total += yearlyIncome * Math.pow(1 + growth, y);
    }
    return total;
  }, [age, retirementAge, yearlyIncome]);

  const data: YearPoint[] = useMemo(() => {
    const arr: YearPoint[] = [];
    const growth = 0.02;
    const assetReturn = 0.05;
    const drawdownRate = 0.04; // ~4% rule

    for (let a = 0; a <= lifeEnd; a++) {
      // Humankapital: only for current age → retirement
      let hk = 0;
      if (a >= age && a < retirementAge) {
        const yearsRemaining = retirementAge - a;
        for (let y = 0; y < yearsRemaining; y++) {
          hk += yearlyIncome * Math.pow(1 + growth, y);
        }
      }

      // Vermögen: grows from today to retirement, then drawdown
      let v = 0;
      if (a >= age) {
        if (a <= retirementAge) {
          v = currentNetWorth * Math.pow(1 + assetReturn, a - age);
        } else {
          const peak = currentNetWorth * Math.pow(1 + assetReturn, retirementAge - age);
          const yearsInRetirement = a - retirementAge;
          v = Math.max(0, peak * Math.pow(1 - drawdownRate, yearsInRetirement));
        }
      }

      // Rente: constant from retirement to end
      const r = a >= retirementAge ? PENSION_TOTAL_YEARLY : 0;

      arr.push({ age: a, humankapital: hk, vermoegen: v, rente: r });
    }
    return arr;
  }, [age, retirementAge, yearlyIncome, currentNetWorth]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold tracking-tight">Mein finanzielles Leben</h4>
          <span className="text-[10px] text-muted-foreground">Modellrechnung</span>
        </div>

        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="grad-human" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_HUMAN} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={COLOR_HUMAN} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="grad-assets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_ASSETS} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={COLOR_ASSETS} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="grad-pension" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_PENSION} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={COLOR_PENSION} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="age"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelFormatter={(v) => `Alter ${v}`}
                formatter={(value: number, name: string) => [fmtCHF(value), name]}
              />
              <ReferenceLine
                x={age}
                stroke="hsl(var(--foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                label={{
                  value: `Heute (${age})`,
                  position: 'insideTopLeft',
                  fill: 'hsl(var(--foreground))',
                  fontSize: 9,
                }}
              />
              <Area
                type="monotone"
                dataKey="humankapital"
                name="Humankapital"
                stroke={COLOR_HUMAN}
                strokeWidth={1.5}
                fill="url(#grad-human)"
                isAnimationActive={false}
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="vermoegen"
                name="Vermögen"
                stroke={COLOR_ASSETS}
                strokeWidth={1.5}
                fill="url(#grad-assets)"
                isAnimationActive={false}
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="rente"
                name="Rente"
                stroke={COLOR_PENSION}
                strokeWidth={1.5}
                fill="url(#grad-pension)"
                isAnimationActive={false}
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <Stat color={COLOR_HUMAN} label="Humankapital" value={fmtCHF(humankapitalToday)} />
          <Stat color={COLOR_ASSETS} label="Vermögen heute" value={fmtCHF(currentNetWorth)} />
          <Stat color={COLOR_PENSION} label="Rente ab 65" value={`${fmtCHF(PENSION_TOTAL_MONTHLY)}/Mt`} />
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/app/client-portal/tools/humankapital')}
        >
          Detailanalyse im Tool <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-muted-foreground truncate">{label}</span>
      </div>
      <p className="font-semibold text-foreground mt-0.5 truncate">{value}</p>
    </div>
  );
}
