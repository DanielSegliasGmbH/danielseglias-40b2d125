import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ShadowTwinData {
  peakscore: number;
  savings_rate: number;
  tools_used: number;
  tasks_completed: number;
  articles_read: number;
  coach_modules: number;
  xp_earned: number;
}

export interface TwinAction {
  text: string;
  link: string;
}

export interface ShadowTwinSnapshot {
  id: string;
  week_key: string;
  demographic_key: string;
  aggregated_data: ShadowTwinData;
  twin_actions: TwinAction[];
  sample_size: number;
}

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function buildDemographicKey(age: number | null, canton: string | null, incomeRange: string | null): string {
  const ageGroup = age ? `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}` : 'unknown';
  return `${ageGroup}|${canton || 'unknown'}|${incomeRange || 'unknown'}`;
}

export function useShadowTwin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['shadow-twin', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const weekKey = getMonday(new Date());

      // Get user's demographic info
      const { data: customerUser } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let demographicKey = 'unknown|unknown|unknown';

      if (customerUser?.customer_id) {
        // ARCHIVED: customer_profiles - use profiles instead.
        // Canton now lives directly on the profiles table for the logged-in user.
        const [customerRes, economicsRes, profileRes] = await Promise.all([
          supabase.from('customers').select('date_of_birth').eq('id', customerUser.customer_id).maybeSingle(),
          supabase.from('customer_economics').select('income_range').eq('customer_id', customerUser.customer_id).maybeSingle(),
          supabase.from('profiles').select('canton').eq('id', user.id).maybeSingle(),
        ]);

        const age = customerRes.data?.date_of_birth
          ? Math.floor((Date.now() - new Date(customerRes.data.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        demographicKey = buildDemographicKey(age, (profileRes.data as any)?.canton || null, economicsRes.data?.income_range || null);
      }

      const { data, error } = await supabase
        .from('shadow_twin_snapshots')
        .select('*')
        .eq('week_key', weekKey)
        .eq('demographic_key', demographicKey)
        .maybeSingle();

      if (error) throw error;

      // If no exact match, try a fallback with just age group
      if (!data) {
        const { data: fallback } = await supabase
          .from('shadow_twin_snapshots')
          .select('*')
          .eq('week_key', weekKey)
          .like('demographic_key', demographicKey.split('|')[0] + '%')
          .limit(1)
          .maybeSingle();

        return (fallback as unknown as ShadowTwinSnapshot) || null;
      }

      return data as unknown as ShadowTwinSnapshot;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

// Fallback data for when no real twin snapshot exists
export function useShadowTwinFallback(): ShadowTwinSnapshot {
  const ROTATING_ACTIONS: TwinAction[] = [
    { text: 'Zahlt heute in die Säule 3a ein', link: '/app/client-portal/tools' },
    { text: 'Hat diese Woche ein Abo gekündigt', link: '/app/client-portal/tools' },
    { text: 'Liest gerade den Artikel über ETFs', link: '/app/client-portal/library' },
    { text: 'Hat den Finanz-Coach Modul 3 abgeschlossen', link: '/app/client-portal/coach' },
    { text: 'Hat ein neues Sparziel erstellt', link: '/app/client-portal/goals' },
    { text: 'Nutzt das Budgetplaner-Tool', link: '/app/client-portal/budget' },
  ];

  // Pick 3 random actions based on the current week
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const actions = ROTATING_ACTIONS
    .sort((a, b) => {
      const ha = (weekNum * 31 + ROTATING_ACTIONS.indexOf(a)) % 97;
      const hb = (weekNum * 31 + ROTATING_ACTIONS.indexOf(b)) % 97;
      return ha - hb;
    })
    .slice(0, 3);

  return {
    id: 'fallback',
    week_key: new Date().toISOString().split('T')[0],
    demographic_key: 'fallback',
    aggregated_data: {
      peakscore: 14.2,
      savings_rate: 28,
      tools_used: 4,
      tasks_completed: 6,
      articles_read: 3,
      coach_modules: 2,
      xp_earned: 480,
    },
    twin_actions: actions,
    sample_size: 0,
  };
}
