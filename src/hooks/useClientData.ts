import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useClientCases(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useClientOpenTasks(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'open-tasks'],
    queryFn: async () => {
      // First get cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId);
      
      if (casesError) throw casesError;
      if (!cases || cases.length === 0) return [];

      const caseIds = cases.map(c => c.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases(id, title)
        `)
        .in('case_id', caseIds)
        .neq('status', 'erledigt')
        .order('due_date', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useClientMeetings(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'meetings'],
    queryFn: async () => {
      // First get cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId);
      
      if (casesError) throw casesError;
      if (!cases || cases.length === 0) return [];

      const caseIds = cases.map(c => c.id);
      
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          case:cases(id, title)
        `)
        .in('case_id', caseIds)
        .order('scheduled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useClientNotes(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'notes'],
    queryFn: async () => {
      // First get cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId);
      
      if (casesError) throw casesError;
      if (!cases || cases.length === 0) return [];

      const caseIds = cases.map(c => c.id);
      
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          case:cases(id, title)
        `)
        .in('case_id', caseIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: Record<string, any> }) => {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', clientId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useMarkTaskDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'erledigt', completed_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      case_id: string;
      scheduled_at: string;
      meeting_type: 'erstberatung' | 'folgeberatung' | 'check_in' | 'telefonat' | 'video_call';
      duration_minutes?: number;
      location?: string;
      summary?: string;
    }) => {
      const { error } = await supabase.from('meetings').insert({
        case_id: data.case_id,
        scheduled_at: data.scheduled_at,
        meeting_type: data.meeting_type,
        duration_minutes: data.duration_minutes,
        location: data.location,
        summary: data.summary,
        created_by: user?.id,
      });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { case_id: string; content: string }) => {
      const { error } = await supabase.from('notes').insert({
        case_id: data.case_id,
        content: data.content,
        author_id: user?.id,
      });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useCreateCaseForClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      client_id: string;
      title: string;
      description?: string;
      due_date?: string;
    }) => {
      const { error } = await supabase.from('cases').insert({
        client_id: data.client_id,
        title: data.title,
        description: data.description || null,
        due_date: data.due_date || null,
        assigned_to: user?.id,
        created_by: user?.id,
      });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}
