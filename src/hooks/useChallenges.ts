import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  start_date: string;
  end_date: string;
  status: string;
  winner_id: string | null;
  challenger_start_score: number;
  challenged_start_score: number;
  challenger_end_score: number | null;
  challenged_end_score: number | null;
  created_at: string;
}

export function getMonthEnd(): string {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return lastDay.toISOString().slice(0, 10);
}

export function useChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      return (data || []) as Challenge[];
    },
    enabled: !!user?.id,
  });

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const pendingChallenges = challenges.filter(c => c.status === 'pending');
  const pendingForMe = pendingChallenges.filter(c => c.challenged_id === user?.id);

  const canCreateChallenge = activeChallenges.length + pendingChallenges.filter(c => c.challenger_id === user?.id).length < 3;

  const createChallenge = useMutation({
    mutationFn: async ({ friendId, myScore, friendScore }: { friendId: string; myScore: number; friendScore: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      // Check both users allow challenges
      const { data: myProfile } = await supabase.from('profiles').select('challenges_allowed').eq('id', user.id).maybeSingle();
      if (myProfile?.challenges_allowed === false) throw new Error('Du hast Challenges deaktiviert.');
      const { data: friendProfile } = await supabase.from('profiles').select('challenges_allowed').eq('id', friendId).maybeSingle();
      if (friendProfile?.challenges_allowed === false) throw new Error('Dein Freund hat Challenges deaktiviert.');

      const { error } = await supabase.from('challenges').insert({
        challenger_id: user.id,
        challenged_id: friendId,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: getMonthEnd(),
        status: 'pending',
        challenger_start_score: myScore,
        challenged_start_score: friendScore,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Challenge gesendet! ⚔️');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Challenge konnte nicht erstellt werden.'),
  });

  const respondChallenge = useMutation({
    mutationFn: async ({ challengeId, accept }: { challengeId: string; accept: boolean }) => {
      const { error } = await supabase
        .from('challenges')
        .update({ status: accept ? 'active' : 'declined' })
        .eq('id', challengeId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.accept ? 'Challenge angenommen! 🔥' : 'Challenge abgelehnt.');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: () => toast.error('Fehler beim Aktualisieren.'),
  });

  return {
    challenges,
    activeChallenges,
    pendingChallenges,
    pendingForMe,
    canCreateChallenge,
    isLoading,
    createChallenge,
    respondChallenge,
  };
}
