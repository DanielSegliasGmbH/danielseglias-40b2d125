import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { getProfessionInfo } from '@/config/professionConfig';

export function ProfessionDashboardTips() {
  const { profile } = useMetaProfile();
  const info = getProfessionInfo(profile?.professional_status);

  if (!info || info.key === 'andere') return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card>
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">
              Für {info.emoji} {info.label} besonders wichtig:
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {info.dashboardHint}
          </p>
          {info.tips.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {info.tips.slice(0, 2).map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}
          {info.warnings.length > 0 && (
            <div className="space-y-1 pt-1">
              {info.warnings.slice(0, 1).map((w, i) => (
                <Badge key={i} variant="outline" className="text-[9px] border-destructive/30 text-destructive">
                  ⚠️ {w}
                </Badge>
              ))}
            </div>
          )}
          {info.saeule3aLimit !== 7258 && info.saeule3aLimit > 0 && (
            <Badge variant="outline" className="text-[9px]">
              Dein 3a-Limit: CHF {info.saeule3aLimit.toLocaleString('de-CH')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
