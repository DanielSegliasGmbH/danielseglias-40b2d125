import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Landmark, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function NetWorthWidget() {
  const { user } = useAuth();

  const { data: assets = [] } = useQuery({
    queryKey: ['net-worth-assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('net_worth_assets')
        .select('value')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: liabilities = [] } = useQuery({
    queryKey: ['net-worth-liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('net_worth_liabilities')
        .select('amount')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const totalAssets = useMemo(() => assets.reduce((s: number, a: any) => s + Number(a.value), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s: number, l: any) => s + Number(l.amount), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  const hasData = assets.length > 0 || liabilities.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
    >
      <Link to="/app/client-portal/net-worth">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center justify-between py-3.5 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Landmark className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Mein Vermögen</p>
                {hasData ? (
                  <PrivateValue className="text-lg font-bold text-primary">
                    CHF {netWorth.toLocaleString('de-CH')}
                  </PrivateValue>
                ) : (
                  <p className="text-xs text-muted-foreground">Noch keine Einträge</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
