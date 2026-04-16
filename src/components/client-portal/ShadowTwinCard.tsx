import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { useShadowTwin, useShadowTwinFallback, type ShadowTwinData } from '@/hooks/useShadowTwin';

interface MetricRowProps {
  label: string;
  you: string;
  twin: string;
  delta?: string;
  positive?: boolean;
}

function MetricRow({ label, you, twin, delta, positive }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-[11px] text-muted-foreground flex-1">{label}</span>
      <span className="text-xs font-semibold text-foreground w-16 text-center">{you}</span>
      <span className="text-xs font-semibold text-primary w-16 text-center">{twin}</span>
    </div>
  );
}

// Rotating 4th metric based on the week
const ROTATING_METRICS: { key: keyof ShadowTwinData; label: string }[] = [
  { key: 'tasks_completed', label: 'Aufgaben erledigt' },
  { key: 'articles_read', label: 'Artikel gelesen' },
  { key: 'coach_modules', label: 'Coach-Module' },
  { key: 'xp_earned', label: 'XP gesammelt' },
];

interface ShadowTwinCardProps {
  userMetrics?: {
    peakscore: number;
    savings_rate: number;
    tools_used: number;
    tasks_completed: number;
    articles_read: number;
    coach_modules: number;
    xp_earned: number;
  };
}

export function ShadowTwinCard({ userMetrics }: ShadowTwinCardProps) {
  const { data: snapshot } = useShadowTwin();
  const fallback = useShadowTwinFallback();
  const twin = snapshot || fallback;
  const twinData = twin.aggregated_data;

  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const rotatingMetric = ROTATING_METRICS[weekNum % ROTATING_METRICS.length];

  const you = userMetrics || {
    peakscore: 0,
    savings_rate: 0,
    tools_used: 0,
    tasks_completed: 0,
    articles_read: 0,
    coach_modules: 0,
    xp_earned: 0,
  };

  const delta = twinData.peakscore - you.peakscore;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-4 py-3 bg-primary/5 border-b border-border/50 flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 grid place-content-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">Dein Schatten-Zwilling</p>
              <p className="text-[10px] text-muted-foreground">Top 10% mit ähnlichem Profil</p>
            </div>
            <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary">
              Diese Woche
            </Badge>
          </div>

          {/* Metrics */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between pb-1 mb-1">
              <span className="text-[10px] text-muted-foreground flex-1" />
              <span className="text-[10px] font-medium text-muted-foreground w-16 text-center">Du</span>
              <span className="text-[10px] font-medium text-primary w-16 text-center">Zwilling</span>
            </div>

            <MetricRow label="PeakScore" you={`${you.peakscore.toFixed(1)}`} twin={`${twinData.peakscore.toFixed(1)}`} />
            <MetricRow label="Sparquote" you={`${you.savings_rate}%`} twin={`${twinData.savings_rate}%`} />
            <MetricRow label="Tools genutzt" you={`${you.tools_used}`} twin={`${twinData.tools_used}`} />
            <MetricRow
              label={rotatingMetric.label}
              you={`${you[rotatingMetric.key]}`}
              twin={`${twinData[rotatingMetric.key]}`}
            />
          </div>

          {/* Delta */}
          {delta > 0 && (
            <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-primary/5 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-primary font-medium">
                Zwilling ist {delta.toFixed(1)} Punkte voraus
              </p>
            </div>
          )}

          {/* Twin Actions */}
          {twin.twin_actions.length > 0 && (
            <div className="px-4 pb-3 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Was dein Zwilling diese Woche macht:
              </p>
              {twin.twin_actions.map((action, i) => (
                <Link
                  key={i}
                  to={action.link}
                  className="flex items-center gap-2 py-1 group"
                >
                  <Zap className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-[11px] text-foreground group-hover:text-primary transition-colors flex-1">
                    {action.text}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <Link
            to="/app/client-portal/tools"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary/5 border-t border-border/50 hover:bg-primary/10 transition-colors"
          >
            <span className="text-[11px] font-medium text-primary">Mach's ihm/ihr nach</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
