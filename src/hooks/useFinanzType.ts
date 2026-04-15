import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FinanzTypeData {
  finanz_type: string;
  completed: boolean;
  answers: Record<string, string>;
}

const TYPE_INFO: Record<string, { emoji: string; title: string; shortTitle: string }> = {
  skeptiker: { emoji: '🏦', title: 'Der Sparsame Skeptiker', shortTitle: 'Sparsamer Skeptiker' },
  geniesser: { emoji: '🎢', title: 'Der Planlose Geniesser', shortTitle: 'Planloser Geniesser' },
  pflichterfueller: { emoji: '✅', title: 'Der Pflichterfüller', shortTitle: 'Pflichterfüller' },
};

/**
 * Module keys recommended per Finanz-Typ.
 * These get "Empfohlen für dich" badges in the coach.
 */
const TYPE_MODULE_PRIORITY: Record<string, string[]> = {
  skeptiker: ['investment', 'absicherung', 'skalierung'],
  geniesser: ['struktur', 'klarheit', 'ziele'],
  pflichterfueller: ['optimierung', 'review', 'freiheit'],
};

export function useFinanzType() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['finanz-type-global', user?.id],
    queryFn: async (): Promise<FinanzTypeData | null> => {
      if (!user) return null;
      const { data } = await supabase
        .from('finanz_type_results')
        .select('finanz_type, completed, answers')
        .eq('user_id', user.id)
        .maybeSingle();
      return data as FinanzTypeData | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const completed = !!data?.completed;
  const typeKey = data?.finanz_type || null;
  const info = typeKey ? TYPE_INFO[typeKey] : null;
  const recommendedModules = typeKey ? (TYPE_MODULE_PRIORITY[typeKey] || []) : [];

  return {
    data,
    isLoading,
    completed,
    typeKey,
    info,
    recommendedModules,
    TYPE_INFO,
  };
}
