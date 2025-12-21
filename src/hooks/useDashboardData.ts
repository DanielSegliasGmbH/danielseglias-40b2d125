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
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Performance: 30s staleTime um häufige Refetches zu vermeiden
const STALE_TIME = 30 * 1000;

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        toast.error(`Fehler beim Laden der Clients: ${error.message}`);
        throw error;
      }
      return data;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

const CLIENTS_PAGE_SIZE = 25;

type ClientWithData = Tables<'clients'>;

interface InfiniteClientsPage {
  items: ClientWithData[];
  totalCount: number;
  pageParam: number;
}

// Escape special characters for Supabase ilike filter
function escapeSearchTerm(term: string): string {
  return term
    .trim()
    .replace(/%/g, '\\%')
    .replace(/,/g, '\\,')
    .replace(/_/g, '\\_');
}

export function useInfiniteClients(searchTerm?: string) {
  const cleanedTerm = searchTerm?.trim() || '';
  
  return useInfiniteQuery<InfiniteClientsPage, Error>({
    queryKey: ['clients', 'infinite', cleanedTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * CLIENTS_PAGE_SIZE;
      const to = from + CLIENTS_PAGE_SIZE - 1;

      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      // Apply search filter if term is provided
      if (cleanedTerm.length >= 1) {
        const escaped = escapeSearchTerm(cleanedTerm);
        query = query.or(
          `first_name.ilike.%${escaped}%,last_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
        );
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        toast.error(`Fehler beim Laden der Clients: ${error.message}`);
        throw error;
      }

      return {
        items: (data ?? []) as ClientWithData[],
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
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
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
      if (error) {
        toast.error(`Fehler beim Laden der Cases: ${error.message}`);
        throw error;
      }
      return data;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

const CASES_PAGE_SIZE = 25;

type CaseSortMode = 'created_desc' | 'created_asc' | 'due_asc' | 'title_asc' | 'status_asc';

type CaseWithClient = Tables<'cases'> & {
  client: { id: string; first_name: string; last_name: string } | null;
};

interface InfiniteCasesPage {
  items: CaseWithClient[];
  totalCount: number;
  pageParam: number;
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
          client:clients(id, first_name, last_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        toast.error(`Fehler beim Laden der Cases: ${error.message}`);
        throw error;
      }

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
          client:clients(id, first_name, last_name)
        `)
        .neq('status', 'abgeschlossen')
        .order('created_at', { ascending: false });
      if (error) {
        toast.error(`Fehler beim Laden der aktiven Cases: ${error.message}`);
        throw error;
      }
      return data;
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
        .neq('status', 'abgeschlossen');
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
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
      if (error) {
        toast.error(`Fehler beim Laden der Tasks: ${error.message}`);
        throw error;
      }
      return data;
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
        toast.error(`Fehler beim Laden der Profile: ${error.message}`);
        throw error;
      }
      return data;
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}
