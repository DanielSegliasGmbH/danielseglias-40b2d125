/**
 * DASHBOARD DATA HOOKS
 * 
 * Task-Queries:
 * - useOpenTasks: alle offenen Tasks (status != erledigt)
 * - useOpenTasksCount: Anzahl offener Tasks
 * 
 * Performance: staleTime 30s, refetchOnWindowFocus deaktiviert
 */
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Performance: 30s staleTime um häufige Refetches zu vermeiden
const STALE_TIME = 30 * 1000;

const CASES_PAGE_SIZE = 25;

type CaseSortMode = 'created_desc' | 'created_asc' | 'due_asc' | 'title_asc' | 'status_asc';

export type CaseWithCustomer = Tables<'cases'> & {
  customer: { id: string; first_name: string; last_name: string } | null;
};

interface InfiniteCasesPage {
  items: CaseWithCustomer[];
  totalCount: number;
  pageParam: number;
}

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          customer:customers!cases_customer_id_fkey(id, first_name, last_name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return (data ?? []) as CaseWithCustomer[];
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useInfiniteCases(sortMode?: CaseSortMode) {
  return useInfiniteQuery<InfiniteCasesPage, Error>({
    queryKey: ['cases', 'infinite', sortMode],
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * CASES_PAGE_SIZE;
      const to = from + CASES_PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('cases')
        .select(`
          *,
          customer:customers!cases_customer_id_fkey(id, first_name, last_name)
        `, { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        items: (data ?? []) as CaseWithCustomer[],
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
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
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
          customer:customers!cases_customer_id_fkey(id, first_name, last_name)
        `)
        .is('deleted_at', null)
        .neq('status', 'abgeschlossen')
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return (data ?? []) as CaseWithCustomer[];
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useActiveCasesCount() {
  return useQuery({
    queryKey: ['cases', 'active-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .neq('status', 'abgeschlossen');
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export type TaskWithCaseAndCustomer = Tables<'tasks'> & {
  case: (Tables<'cases'> & {
    customer: { id: string; first_name: string; last_name: string; deleted_at: string | null } | null;
  }) | null;
};

export function useOpenTasks() {
  return useQuery({
    queryKey: ['tasks', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases!fk_tasks_case_id(id, title, deleted_at, customer:customers!cases_customer_id_fkey(id, first_name, last_name, deleted_at))
        `)
        .is('deleted_at', null)
        .neq('status', 'erledigt')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      if (error) {
        throw error;
      }
      // Filter out tasks whose case or customer is deleted
      return (data ?? []).filter(task => 
        !task.case?.deleted_at && !task.case?.customer?.deleted_at
      ) as TaskWithCaseAndCustomer[];
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useOpenTasksCount() {
  return useQuery({
    queryKey: ['tasks', 'open-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .neq('status', 'erledigt');
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}
