import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  icon_emoji: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleAccess {
  id: string;
  customer_id: string;
  module_id: string;
  is_unlocked: boolean;
}

export interface LessonAccess {
  id: string;
  customer_id: string;
  lesson_id: string;
  is_unlocked: boolean;
}

export interface CourseFeedback {
  id: string;
  lesson_id: string;
  customer_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

// Fetch all modules
export function useCourseModules() {
  return useQuery({
    queryKey: ['course-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as CourseModule[];
    },
  });
}

// Fetch lessons for a module
export function useCourseLessons(moduleId?: string) {
  return useQuery({
    queryKey: ['course-lessons', moduleId],
    enabled: !!moduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons' as any)
        .select('*')
        .eq('module_id', moduleId!)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as CourseLesson[];
    },
  });
}

// Fetch all lessons (admin)
export function useAllCourseLessons() {
  return useQuery({
    queryKey: ['course-lessons-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as CourseLesson[];
    },
  });
}

// Fetch module access for a customer
export function useModuleAccess(customerId?: string) {
  return useQuery({
    queryKey: ['module-access', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_module_access' as any)
        .select('*')
        .eq('customer_id', customerId!);
      if (error) throw error;
      return (data || []) as unknown as ModuleAccess[];
    },
  });
}

// Fetch lesson access for a customer
export function useLessonAccess(customerId?: string) {
  return useQuery({
    queryKey: ['lesson-access', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_lesson_access' as any)
        .select('*')
        .eq('customer_id', customerId!);
      if (error) throw error;
      return (data || []) as unknown as LessonAccess[];
    },
  });
}

// Get current user's customer ID
export function useMyCustomerId() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-customer-id', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customer_id_for_user', { _user_id: user!.id });
      if (error) throw error;
      return data as string | null;
    },
  });
}

// Fetch feedback for a lesson
export function useLessonFeedback(lessonId?: string) {
  return useQuery({
    queryKey: ['course-feedback', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_feedback' as any)
        .select('*')
        .eq('lesson_id', lessonId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CourseFeedback[];
    },
  });
}

// Send feedback
export function useSendCourseFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { lesson_id: string; customer_id: string; user_id: string; message: string }) => {
      const { error } = await supabase.from('course_feedback' as any).insert(params);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['course-feedback', vars.lesson_id] });
    },
  });
}

// Admin: upsert module access
export function useUpsertModuleAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { customer_id: string; module_id: string; is_unlocked: boolean }) => {
      const { error } = await supabase
        .from('customer_module_access' as any)
        .upsert(params, { onConflict: 'customer_id,module_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['module-access', vars.customer_id] });
    },
  });
}

// Admin: upsert lesson access
export function useUpsertLessonAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { customer_id: string; lesson_id: string; is_unlocked: boolean }) => {
      const { error } = await supabase
        .from('customer_lesson_access' as any)
        .upsert(params, { onConflict: 'customer_id,lesson_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['lesson-access', vars.customer_id] });
    },
  });
}

// Admin: create/update module
export function useUpsertCourseModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: Partial<CourseModule> & { title: string }) => {
      if (params.id) {
        const { error } = await supabase.from('course_modules' as any).update(params).eq('id', params.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('course_modules' as any).insert(params);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-modules'] });
    },
  });
}

// Admin: create/update lesson
export function useUpsertCourseLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: Partial<CourseLesson> & { title: string; module_id: string }) => {
      if (params.id) {
        const { error } = await supabase.from('course_lessons' as any).update(params).eq('id', params.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('course_lessons' as any).insert(params);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-lessons-all'] });
      qc.invalidateQueries({ queryKey: ['course-lessons'] });
    },
  });
}

// Admin: delete lesson
export function useDeleteCourseLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase.from('course_lessons' as any).delete().eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-lessons-all'] });
      qc.invalidateQueries({ queryKey: ['course-lessons'] });
    },
  });
}
