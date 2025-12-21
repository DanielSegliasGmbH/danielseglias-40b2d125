import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveClientsCount() {
  return useQuery({
    queryKey: ['clients', 'active-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aktiv');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

const CASES_PAGE_SIZE = 25;

type CaseWithClient = Tables<'cases'> & {
  client: { id: string; first_name: string; last_name: string } | null;
};

interface InfiniteCasesPage {
  items: CaseWithClient[];
  totalCount: number;
  pageParam: number;
}

export function useInfiniteCases() {
  return useInfiniteQuery<InfiniteCasesPage, Error>({
    queryKey: ['cases', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * CASES_PAGE_SIZE;
      const to = from + CASES_PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(id, first_name, last_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        items: (data ?? []) as CaseWithClient[],
        totalCount: count ?? 0,
        pageParam: pageParam as number,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      if (loadedCount < lastPage.totalCount) {
        return lastPage.pageParam + 1;
      }
      return undefined;
    },
  });
}

export function useActiveCases() {
  return useQuery({
    queryKey: ['cases', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(id, first_name, last_name)
        `)
        .neq('status', 'abgeschlossen')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveCasesCount() {
  return useQuery({
    queryKey: ['cases', 'active-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'abgeschlossen');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useOpenTasks() {
  return useQuery({
    queryKey: ['tasks', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases(id, title, client:clients(id, first_name, last_name))
        `)
        .neq('status', 'erledigt')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOpenTasksCount() {
  return useQuery({
    queryKey: ['tasks', 'open-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'erledigt');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}
