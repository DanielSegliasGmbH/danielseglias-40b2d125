import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
