/**
 * CUSTOMER DASHBOARD DATA HOOKS
 * 
 * Hooks für Cases, Tasks, Meetings, Notes eines Customers.
 * Nutzt customer_id statt client_id (Phase 2 Migration).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TaskPriority = Database['public']['Enums']['task_priority'];
type MeetingType = Database['public']['Enums']['meeting_type'];
type CaseStatus = Database['public']['Enums']['case_status'];

const STALE_TIME = 30 * 1000;

/**
 * Fetch cases for a customer (via customer_id)
 */
export function useCustomerCases(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('customer_id', customerId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(`Fehler beim Laden der Projekte: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    enabled: !!customerId,
    staleTime: STALE_TIME,
  });
}

/**
 * Fetch open tasks for a customer (via cases.customer_id)
 */
export function useCustomerOpenTasks(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'open-tasks'],
    queryFn: async () => {
      // Get cases for this customer
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('customer_id', customerId)
        .is('deleted_at', null);
      
      if (casesError) {
        toast.error(`Fehler beim Laden der Aufgaben: ${casesError.message}`);
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
        toast.error(`Fehler beim Laden der Aufgaben: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    enabled: !!customerId,
    staleTime: STALE_TIME,
  });
}

/**
 * Fetch meetings for a customer (via cases.customer_id)
 */
export function useCustomerMeetings(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'meetings'],
    queryFn: async () => {
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('customer_id', customerId)
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
      return data || [];
    },
    enabled: !!customerId,
    staleTime: STALE_TIME,
  });
}

/**
 * Fetch notes for a customer (via cases.customer_id)
 */
export function useCustomerNotes(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'notes'],
    queryFn: async () => {
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('customer_id', customerId)
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
      return data || [];
    },
    enabled: !!customerId,
    staleTime: STALE_TIME,
  });
}

/**
 * Create a case for a customer (sets customer_id)
 */
export function useCreateCaseForCustomer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      customer_id: string;
      title: string;
      description?: string;
      due_date?: string;
    }) => {
      const { error } = await supabase
        .from('cases')
        .insert({
          customer_id: data.customer_id,
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
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * Create a task for a case
 */
export function useCreateTaskForCustomer() {
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
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Create a meeting for a case
 */
export function useCreateMeetingForCustomer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      case_id: string;
      scheduled_at: string;
      meeting_type: MeetingType;
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
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

/**
 * Create a note for a case
 */
export function useCreateNoteForCustomer() {
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
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

/**
 * Mark a task as done
 */
export function useMarkCustomerTaskDone() {
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
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Delete a task (soft delete)
 */
export function useDeleteCustomerTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
        .eq('id', taskId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
