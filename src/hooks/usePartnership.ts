import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Partnership {
  id: string;
  user_id_1: string;
  user_id_2: string | null;
  invite_email: string | null;
  status: 'pending' | 'active' | 'dissolved';
  sharing_settings: {
    tasks: boolean;
    peakscore: boolean;
    goals: boolean;
    reports: boolean;
  };
  started_at: string | null;
  dissolved_at: string | null;
  created_at: string;
}

export interface JointGoal {
  id: string;
  partnership_id: string;
  title: string;
  target_amount: number | null;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  is_completed: boolean;
}

export interface ConflictEntry {
  id: string;
  partnership_id: string;
  user_id: string;
  round: number;
  what_happened: string | null;
  how_i_feel: string | null;
  what_i_wish: string | null;
  revealed_at: string | null;
  created_at: string;
}

export function usePartnership() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['partnership', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Partnership | null;
    },
    enabled: !!user,
  });
}

export function usePartnerProfile(partnerId: string | null | undefined) {
  return useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: async () => {
      if (!partnerId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', partnerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!partnerId,
  });
}

export function useInvitePartner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if partner already has an account
      // We just create the partnership with invite_email
      const { error } = await supabase.from('partnerships').insert({
        user_id_1: user.id,
        invite_email: email.toLowerCase().trim(),
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership'] });
      toast.success('Einladung gesendet! Dein Partner wird benachrichtigt.');
    },
    onError: () => toast.error('Einladung konnte nicht gesendet werden'),
  });
}

export function useAcceptPartnership() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnershipId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('partnerships')
        .update({
          user_id_2: user.id,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', partnershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership'] });
      toast.success('Partnerschaft aktiviert! 💕');
    },
    onError: () => toast.error('Fehler beim Akzeptieren'),
  });
}

export function useDissolvePartnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnershipId: string) => {
      const { error } = await supabase
        .from('partnerships')
        .update({
          status: 'dissolved',
          dissolved_at: new Date().toISOString(),
        })
        .eq('id', partnershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership'] });
      toast.success('Partnerschaft aufgelöst.');
    },
    onError: () => toast.error('Fehler beim Auflösen'),
  });
}

export function useJointGoals(partnershipId: string | undefined) {
  return useQuery({
    queryKey: ['joint-goals', partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_joint_goals')
        .select('*')
        .eq('partnership_id', partnershipId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as JointGoal[];
    },
    enabled: !!partnershipId,
  });
}

export function useSaveJointGoal(partnershipId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Partial<JointGoal>) => {
      if (!partnershipId) throw new Error('No partnership');
      if (goal.id) {
        const { error } = await supabase
          .from('partner_joint_goals')
          .update(goal as any)
          .eq('id', goal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('partner_joint_goals')
          .insert({ ...goal, partnership_id: partnershipId } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joint-goals'] });
      toast.success('Ziel gespeichert!');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });
}

export function useConflictEntries(partnershipId: string | undefined) {
  return useQuery({
    queryKey: ['conflict-entries', partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_conflict_entries')
        .select('*')
        .eq('partnership_id', partnershipId!)
        .order('round', { ascending: false });
      if (error) throw error;
      return (data || []) as ConflictEntry[];
    },
    enabled: !!partnershipId,
  });
}

export function useSubmitConflictEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: { partnership_id: string; round: number; what_happened: string; how_i_feel: string; what_i_wish: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('partner_conflict_entries')
        .insert({ ...entry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conflict-entries'] });
      toast.success('Deine Antworten wurden gespeichert.');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });
}

export function useUpdateSharingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partnershipId, settings }: { partnershipId: string; settings: Partnership['sharing_settings'] }) => {
      const { error } = await supabase
        .from('partnerships')
        .update({ sharing_settings: settings as any })
        .eq('id', partnershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership'] });
      toast.success('Einstellungen gespeichert');
    },
  });
}

// Check for pending invitations for current user's email
export function usePendingInvitation() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-invitation', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .eq('invite_email', user.email.toLowerCase())
        .eq('status', 'pending')
        .is('user_id_2', null)
        .maybeSingle();
      if (error) throw error;
      return data as Partnership | null;
    },
    enabled: !!user?.email,
  });
}
