import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type CaseStatus = Database['public']['Enums']['case_status'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];
type MeetingType = Database['public']['Enums']['meeting_type'];

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(id, first_name, last_name, email, phone)
        `)
        .eq('id', caseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
}

export function useCaseTasks(caseId: string, statusFilter?: TaskStatus | 'all') {
  return useQuery({
    queryKey: ['case-tasks', caseId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('case_id', caseId)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
}

export function useCaseMeetings(caseId: string) {
  return useQuery({
    queryKey: ['case-meetings', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('case_id', caseId)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
}

export function useCaseNotes(caseId: string) {
  return useQuery({
    queryKey: ['case-notes', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, data }: { caseId: string; data: { title?: string; description?: string; status?: CaseStatus; assigned_to?: string | null; due_date?: string | null } }) => {
      const { error } = await supabase
        .from('cases')
        .update(data)
        .eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, status }: { caseId: string; status: CaseStatus }) => {
      const { error } = await supabase
        .from('cases')
        .update({ status })
        .eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useCreateTaskForCase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (task: { case_id: string; title: string; description?: string; priority?: TaskPriority; due_date?: string; assigned_to?: string | null }) => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_by: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: (_, { case_id }) => {
      queryClient.invalidateQueries({ queryKey: ['case-tasks', case_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status, caseId }: { taskId: string; status: TaskStatus; caseId: string }) => {
      const updateData: { status: TaskStatus; completed_at?: string | null } = { status };
      if (status === 'erledigt') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['case-tasks', caseId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useMarkCaseTaskDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, caseId }: { taskId: string; caseId: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'erledigt', completed_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['case-tasks', caseId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCreateMeetingForCase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meeting: { case_id: string; scheduled_at: string; meeting_type?: MeetingType; duration_minutes?: number; location?: string }) => {
      const { error } = await supabase
        .from('meetings')
        .insert({
          ...meeting,
          created_by: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: (_, { case_id }) => {
      queryClient.invalidateQueries({ queryKey: ['case-meetings', case_id] });
    },
  });
}

export function useCreateNoteForCase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ case_id, content }: { case_id: string; content: string }) => {
      const { error } = await supabase
        .from('notes')
        .insert({
          case_id,
          content,
          author_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: (_, { case_id }) => {
      queryClient.invalidateQueries({ queryKey: ['case-notes', case_id] });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
}
