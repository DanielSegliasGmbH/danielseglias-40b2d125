import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUp, ArrowDown, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePeakScore, getPeakScoreGradient, getPeakScoreBorderColor } from '@/hooks/usePeakScore';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function ClientPortalPeakScore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { score, totalAssets, totalLiabilities, monthlyExpenses, trend, hasData, rank } = usePeakScore();

  const { data: history = [] } = useQuery({
    queryKey: ['peak-score-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('peak_scores')
        .select('score, calculated_at')
        .eq('user_id', user.id)
        .eq('is_snapshot', true)
        .order('calculated_at', { ascending: true })
        .limit(6);
      return data || [];
    },
    enabled: !!user,
  });

  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`;
  const displayScore = score !== null;

  const breakdownItems = [
    { label: 'Vermögen', value: fmtCHF(totalAssets), color: 'text-emerald-600' },
    { label: 'Verbindlichkeiten', value: `- ${fmtCHF(totalLiabilities)}`, color: 'text-red-500' },
    { label: 'Netto', value: fmtCHF(totalAssets - totalLiabilities), color: 'text-foreground' },
    { label: 'Mtl. Ausgaben', value: fmtCHF(monthlyExpenses), color: 'text-muted-foreground' },
  ];

  const maxScore = Math.max(...history.map((h: any) => Number(h.score)), score || 0, 1);

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/client-portal')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">PeakScore</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cn(
            'rounded-2xl border overflow-hidden',
            displayScore ? `bg-gradient-to-br ${getPeakScoreGradient(score)} ${getPeakScoreBorderColor(score)}` : ''
          )}>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Shield className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <span className="text-[56px] leading-none font-extrabold tracking-tight text-foreground">
                {displayScore ? score.toFixed(1) : '–'}
              </span>
              <span className="text-sm text-muted-foreground mt-1">Monate</span>
              {displayScore && (
                <span className="text-lg font-bold text-foreground/80 mt-1">
                  {rank.emoji} {rank.name}
                </span>
              )}
              {trend !== null && trend !== 0 && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-sm font-medium',
                  trend > 0 ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {trend > 0 ? '+' : ''}{trend} seit letztem Monat
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Score-Zusammensetzung</h3>
            <div className="space-y-2.5">
              {breakdownItems.map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={cn('text-sm font-semibold', item.color)}>{item.value}</span>
                </div>
              ))}
              {displayScore && (
                <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">PeakScore</span>
                  <span className="text-sm font-bold text-foreground">
                    {fmtCHF(totalAssets - totalLiabilities)} ÷ {fmtCHF(monthlyExpenses)} = {score.toFixed(1)} Mt.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {history.length > 1 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Verlauf (letzte Monate)</h3>
              <div className="flex items-end gap-2 h-24">
                {history.map((h: any, i: number) => {
                  const pct = Math.max(8, (Number(h.score) / maxScore) * 100);
                  const date = new Date(h.calculated_at);
                  const label = `${date.getMonth() + 1}/${String(date.getFullYear()).slice(2)}`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-foreground">
                        {Number(h.score).toFixed(1)}
                      </span>
                      <motion.div
                        className="w-full bg-primary/70 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                      />
                      <span className="text-[9px] text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
          onClick={() => navigate('/app/client-portal/coach')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Wie verbessere ich meinen Score?</p>
              <p className="text-[11px] text-muted-foreground">Dein Finanz-Coach hilft dir weiter</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}
