import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { useLastPlan, calculateCompleteness } from '@/hooks/useLastPlan';

export function LastPlanDashboardCard() {
  const { data: plan, isLoading } = useLastPlan();

  // Don't show if not opted in or still loading
  if (isLoading || !plan?.opted_in) return null;

  const completeness = calculateCompleteness(plan);

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completeness / 100) * circumference;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
      <Link to="/app/client-portal/last-plan">
        <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative size-9 grid place-content-center">
                <svg width="36" height="36" className="-rotate-90">
                  <circle cx="18" cy="18" r={radius} stroke="hsl(var(--muted))" strokeWidth="3" fill="none" />
                  <circle
                    cx="18" cy="18" r={radius}
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>
                <FileText className="h-3.5 w-3.5 text-primary absolute inset-0 m-auto" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Mein letzter Plan</p>
                <p className="text-[11px] text-muted-foreground">
                  Vorsorge: {completeness}% vollständig
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
