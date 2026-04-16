import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStreakRescue } from '@/hooks/useRitualSystem';
import { useGamification } from '@/hooks/useGamification';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { X, LifeBuoy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'streak-rescue-dismissed';

function isDismissedToday(): boolean {
  const stored = sessionStorage.getItem(DISMISS_KEY);
  if (!stored) return false;
  return stored === new Date().toISOString().slice(0, 10);
}

function dismissToday(): void {
  sessionStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
}

export function StreakRescueOverlay() {
  const { user } = useAuth();
  const { streakDays } = useGamification();
  const { canSelfRescue, performSelfRescue, requestFriendRescue, enabled } = useStreakRescue();
  const [dismissed, setDismissed] = useState(isDismissedToday);
  const [mode, setMode] = useState<'main' | 'friends'>('main');
  const [rescuing, setRescuing] = useState(false);

  // Check if streak was broken: user logged in 2 days ago but NOT yesterday, and streakDays is 0
  const { data: streakBrokenYesterday = false } = useQuery({
    queryKey: ['streak-broken-check', user?.id, streakDays],
    queryFn: async () => {
      if (!user || streakDays > 0) return false;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Check login 2 days ago
      const { data: twoDaysAgoLogins } = await supabase
        .from('gamification_actions')
        .select('id')
        .eq('user_id', user.id)
        .eq('action_type', 'daily_login')
        .gte('created_at', twoDaysAgo.toISOString().slice(0, 10))
        .lt('created_at', yesterday.toISOString().slice(0, 10))
        .limit(1);

      if (!twoDaysAgoLogins?.length) return false;

      // Check NO login yesterday
      const { data: yesterdayLogins } = await supabase
        .from('gamification_actions')
        .select('id')
        .eq('user_id', user.id)
        .eq('action_type', 'daily_login')
        .gte('created_at', yesterday.toISOString().slice(0, 10))
        .lt('created_at', today.toISOString().slice(0, 10))
        .limit(1);

      return !yesterdayLogins?.length;
    },
    enabled: !!user && enabled && !dismissed && streakDays === 0,
  });

  // Fetch friends for friend rescue
  const { data: friends = [] } = useQuery({
    queryKey: ['rescue-friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('friends')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(10);
      if (!data) return [];
      const friendIds = data.map(f => f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1);
      if (!friendIds.length) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', friendIds);
      return profiles || [];
    },
    enabled: !!user && mode === 'friends',
  });

  if (!enabled || !streakBrokenYesterday || dismissed) return null;

  const handleDismiss = () => {
    dismissToday();
    setDismissed(true);
  };

  const handleSelfRescue = async () => {
    setRescuing(true);
    try {
      await performSelfRescue.mutateAsync();
      toast.success('Streak gerettet! 🛟');
      setDismissed(true);
    } catch {
      toast.error('Fehler');
    } finally {
      setRescuing(false);
    }
  };

  const handleFriendRescue = async (friendId: string) => {
    setRescuing(true);
    try {
      await requestFriendRescue.mutateAsync(friendId);
      toast.success('Anfrage gesendet! Dein Freund wird benachrichtigt.');
      setDismissed(true);
    } catch {
      toast.error('Fehler');
    } finally {
      setRescuing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-background/95 flex items-center justify-center"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-w-sm mx-auto px-6 text-center">
          {mode === 'main' ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <p className="text-4xl">😱</p>
              <div>
                <p className="text-xl font-bold text-foreground">Du hast einen Tag verpasst!</p>
                <p className="text-sm text-muted-foreground mt-1">Dein Streak ist in Gefahr.</p>
              </div>

              {canSelfRescue ? (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleSelfRescue}
                  disabled={rescuing}
                >
                  <LifeBuoy className="h-4 w-4" /> Streak retten 🛟
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Du hast deinen Notfall-Rescue schon verwendet diesen Monat.
                  </p>
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => setMode('friends')}
                  >
                    <Users className="h-4 w-4" /> Freund anfragen
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="text-muted-foreground">
                Streak akzeptieren
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-lg font-bold text-foreground">Freund um Hilfe bitten</p>
              <p className="text-sm text-muted-foreground">
                Wähle einen Freund — ihr bekommt beide +20 XP!
              </p>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Keine Freunde gefunden.</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((f: any) => (
                    <Card key={f.id} className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => handleFriendRescue(f.id)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {(f.first_name || '?')[0]}
                        </div>
                        <span className="text-sm text-foreground">
                          {f.first_name} {f.last_name}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => setMode('main')} className="text-muted-foreground">
                ← Zurück
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
