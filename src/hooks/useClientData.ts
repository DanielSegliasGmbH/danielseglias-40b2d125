/**
 * CLIENT DATA HOOKS
 * 
 * Task-Queries:
 * - useClientOpenTasks: holt offene Tasks über Cases eines Clients
 * - useCreateTaskForClient: erstellt Task für einen Case
 * - useMarkTaskDone: markiert Task als erledigt
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TaskPriority = Database['public']['Enums']['task_priority'];

// Performance: 30s staleTime um häufige Refetches zu vermeiden
const STALE_TIME = 30 * 1000;

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      if (error) {
        toast.error(`Fehler beim Laden: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!clientId,
    staleTime: STALE_TIME,
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
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) {
        toast.error(`Fehler beim Laden der Cases: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!clientId,
    staleTime: STALE_TIME,
  });
}

export function useClientOpenTasks(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'open-tasks'],
    queryFn: async () => {
      // First get non-deleted cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId)
        .is('deleted_at', null);
      
      if (casesError) {
        toast.error(`Fehler beim Laden der Tasks: ${casesError.message}`);
        throw casesError;
      }
      if (!cases || cases.length === 0) return [];

      const caseIds = cases.map(c => c.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases!fk_tasks_case_id(id, title)
        `)
        .in('case_id', caseIds)
        .is('deleted_at', null)
        .neq('status', 'erledigt')
        .order('due_date', { ascending: true, nullsFirst: false });
      
      if (error) {
        toast.error(`Fehler beim Laden der Tasks: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!clientId,
    staleTime: STALE_TIME,
  });
}

export function useCreateTaskForClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: {
      case_id: string;
      title: string;
      description?: string;
      priority?: TaskPriority;
      due_date?: string;
    }) => {
      const { error } = await supabase.from('tasks').insert({
        case_id: task.case_id,
        title: task.title,
        description: task.description || null,
        priority: task.priority || 'mittel',
        due_date: task.due_date || null,
        created_by: user?.id,
      });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useClientMeetings(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'meetings'],
    queryFn: async () => {
      // Get non-deleted cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId)
        .is('deleted_at', null);
      
      if (casesError) {
        toast.error(`Fehler beim Laden der Meetings: ${casesError.message}`);
        throw casesError;
      }
      if (!cases || cases.length === 0) return [];

      const caseIds = cases.map(c => c.id);
      
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          case:cases!fk_meetings_case_id(id, title)
        `)
        .in('case_id', caseIds)
        .order('scheduled_at', { ascending: false });
      
      if (error) {
        toast.error(`Fehler beim Laden der Meetings: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!clientId,
    staleTime: STALE_TIME,
  });
}

export function useClientNotes(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId, 'notes'],
    queryFn: async () => {
      // Get non-deleted cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId)
        .is('deleted_at', null);
      
      if (casesError) {
        toast.error(`Fehler beim Laden der Notizen: ${casesError.message}`);
        throw casesError;
      }
      if (!cases || cases.length === 0) return [];

      const caseIds = cases.map(c => c.id);
      
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          case:cases!fk_notes_case_id(id, title)
        `)
        .in('case_id', caseIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(`Fehler beim Laden der Notizen: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!clientId,
    staleTime: STALE_TIME,
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

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('clients')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
        .eq('id', clientId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}
