import { supabase } from '@/integrations/supabase/client';

export interface DeleteCheckResult {
  canDelete: boolean;
  reasons: string[];
  counts: Record<string, number>;
}

/**
 * Check if a customer can be deleted (no cases, no customer_users)
 */
export async function checkCanDeleteCustomer(customerId: string): Promise<DeleteCheckResult> {
  const counts: Record<string, number> = { cases: 0, customerUsers: 0 };
  const reasons: string[] = [];

  // Count cases
  const { count: casesCount, error: casesError } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId);
  
  if (casesError) throw casesError;
  counts.cases = casesCount ?? 0;

  // Count customer_users
  const { count: customerUsersCount, error: customerUsersError } = await supabase
    .from('customer_users')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId);
  
  if (customerUsersError) throw customerUsersError;
  counts.customerUsers = customerUsersCount ?? 0;

  if (counts.cases > 0) {
    reasons.push('cases');
  }
  if (counts.customerUsers > 0) {
    reasons.push('customerUsers');
  }

  return {
    canDelete: reasons.length === 0,
    reasons,
    counts,
  };
}

/**
 * Check if a case can be deleted (no tasks, no meetings, no notes)
 */
export async function checkCanDeleteCase(caseId: string): Promise<DeleteCheckResult> {
  const counts: Record<string, number> = { tasks: 0, meetings: 0, notes: 0 };
  const reasons: string[] = [];

  // Count tasks
  const { count: tasksCount, error: tasksError } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseId);
  
  if (tasksError) throw tasksError;
  counts.tasks = tasksCount ?? 0;

  // Count meetings
  const { count: meetingsCount, error: meetingsError } = await supabase
    .from('meetings')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseId);
  
  if (meetingsError) throw meetingsError;
  counts.meetings = meetingsCount ?? 0;

  // Count notes
  const { count: notesCount, error: notesError } = await supabase
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseId);
  
  if (notesError) throw notesError;
  counts.notes = notesCount ?? 0;

  if (counts.tasks > 0) {
    reasons.push('tasks');
  }
  if (counts.meetings > 0) {
    reasons.push('meetings');
  }
  if (counts.notes > 0) {
    reasons.push('notes');
  }

  return {
    canDelete: reasons.length === 0,
    reasons,
    counts,
  };
}

/**
 * Check if a meeting can be deleted (no notes)
 */
export async function checkCanDeleteMeeting(meetingId: string): Promise<DeleteCheckResult> {
  const counts: Record<string, number> = { notes: 0 };
  const reasons: string[] = [];

  // Count notes linked to this meeting
  const { count: notesCount, error: notesError } = await supabase
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('meeting_id', meetingId);
  
  if (notesError) throw notesError;
  counts.notes = notesCount ?? 0;

  if (counts.notes > 0) {
    reasons.push('notes');
  }

  return {
    canDelete: reasons.length === 0,
    reasons,
    counts,
  };
}

/**
 * Check if an error is a FK constraint violation
 */
export function isForeignKeyError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    // PostgreSQL error code for foreign key violation
    return (error as { code: string }).code === '23503';
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message.toLowerCase();
    return message.includes('foreign key') || 
           message.includes('violates foreign key constraint') ||
           message.includes('restrict');
  }
  return false;
}
