import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy } from 'lucide-react';
import { Challenge, useChallenges } from '@/hooks/useChallenges';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ActiveChallengeCards() {
  const { user } = useAuth();
  const { activeChallenges, pendingForMe, respondChallenge } = useChallenges();

  // Gather opponent IDs
  const opponentIds = [...activeChallenges, ...pendingForMe].map(c =>
    c.challenger_id === user?.id ? c.challenged_id : c.challenger_id
  );

  const { data: profiles } = useQuery({
    queryKey: ['challenge-profiles', opponentIds.join(',')],
    queryFn: async () => {
      if (opponentIds.length === 0) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name')
        .in('id', opponentIds);
      return data || [];
    },
    enabled: opponentIds.length > 0,
  });

  // Get current scores for active challenges
  const { data: currentScores } = useQuery({
    queryKey: ['challenge-scores', user?.id, activeChallenges.map(c => c.id).join(',')],
    queryFn: async () => {
      if (!user?.id || activeChallenges.length === 0) return {};
      const allIds = [...new Set(activeChallenges.flatMap(c => [c.challenger_id, c.challenged_id]))];
      const { data } = await supabase
        .from('peak_scores')
        .select('user_id, score')
        .in('user_id', allIds)
        .eq('is_snapshot', false);
      const map: Record<string, number> = {};
      (data || []).forEach((s: any) => { map[s.user_id] = s.score; });
      return map;
    },
    enabled: activeChallenges.length > 0,
  });

  const getName = (id: string) => {
    const p = profiles?.find((pr: any) => pr.id === id);
    return p?.first_name || 'Freund';
  };

  if (activeChallenges.length === 0 && pendingForMe.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Pending invites */}
      {pendingForMe.map(challenge => {
        const opName = getName(challenge.challenger_id);
        return (
          <motion.div key={challenge.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Challenge von {opName}</span>
                  <Badge variant="outline" className="text-[10px]">Einladung</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Wer verbessert seinen PeakScore mehr bis Ende des Monats?
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => respondChallenge.mutate({ challengeId: challenge.id, accept: true })}
                  >
                    Annehmen
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => respondChallenge.mutate({ challengeId: challenge.id, accept: false })}
                  >
                    Ablehnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Active challenges */}
      {activeChallenges.map(challenge => {
        const isChallenger = challenge.challenger_id === user?.id;
        const opponentId = isChallenger ? challenge.challenged_id : challenge.challenger_id;
        const opName = getName(opponentId);

        const myStartScore = isChallenger ? challenge.challenger_start_score : challenge.challenged_start_score;
        const theirStartScore = isChallenger ? challenge.challenged_start_score : challenge.challenger_start_score;

        const myCurrentScore = currentScores?.[user?.id || ''] ?? myStartScore;
        const theirCurrentScore = currentScores?.[opponentId] ?? theirStartScore;

        const myImprovement = Math.round((myCurrentScore - myStartScore) * 10) / 10;
        const theirImprovement = Math.round((theirCurrentScore - theirStartScore) * 10) / 10;
        const leading = myImprovement > theirImprovement;
        const tied = myImprovement === theirImprovement;

        return (
          <motion.div key={challenge.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">vs. {opName}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    bis {new Date(challenge.end_date).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' })}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={cn(
                    "rounded-lg p-2.5 text-center",
                    leading && !tied ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/50"
                  )}>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Du</p>
                    <p className={cn(
                      "text-lg font-bold",
                      myImprovement > 0 ? "text-emerald-600" : myImprovement < 0 ? "text-red-500" : "text-foreground"
                    )}>
                      {myImprovement > 0 ? '+' : ''}{myImprovement}
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-lg p-2.5 text-center",
                    !leading && !tied ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/50"
                  )}>
                    <p className="text-[10px] text-muted-foreground mb-0.5">{opName}</p>
                    <p className={cn(
                      "text-lg font-bold",
                      theirImprovement > 0 ? "text-emerald-600" : theirImprovement < 0 ? "text-red-500" : "text-foreground"
                    )}>
                      {theirImprovement > 0 ? '+' : ''}{theirImprovement}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center font-medium">
                  {tied ? '⚖️ Gleichstand!' : leading ? '🏆 Du führst!' : '💪 Du liegst zurück!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
