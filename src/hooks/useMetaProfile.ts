// ── DATA SOURCE ──────────────────────────────────────
// Source of truth: profiles table (as of migration 2026-04-18)
// meta_profiles table is DEPRECATED — kept for backwards
// compatibility only. Do NOT write to meta_profiles directly.
// All reads/writes go through profiles via this hook.
// Full removal of meta_profiles: planned for Claude Code phase.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMemorySnapshot } from './useMemories';
import { toast } from 'sonner';

export interface MetaProfile {
  id: string;
  user_id: string;
  monthly_income: number | null;
  fixed_costs: number | null;
  savings_rate: number | null;
  wealth: number | null;
  debts: number | null;
  age: number | null;
  occupation: string | null;
  professional_status: string | null;
  financial_goal: string | null;
  tax_burden: number | null;
  risk_tolerance: number | null;
  last_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Fields that can be auto-detected from tool inputs
export const META_FIELD_MAP: Record<string, { label: string; unit?: string; group: 'finance' | 'personal' }> = {
  monthly_income: { label: 'Monatliches Einkommen', unit: 'CHF', group: 'finance' },
  fixed_costs: { label: 'Fixkosten', unit: 'CHF', group: 'finance' },
  savings_rate: { label: 'Sparrate', unit: 'CHF', group: 'finance' },
  wealth: { label: 'Vermögen', unit: 'CHF', group: 'finance' },
  debts: { label: 'Schulden', unit: 'CHF', group: 'finance' },
  age: { label: 'Alter', group: 'personal' },
  occupation: { label: 'Beruf', group: 'personal' },
  professional_status: { label: 'Beruflicher Status', group: 'personal' },
  financial_goal: { label: 'Finanzziel', group: 'personal' },
  tax_burden: { label: 'Steuerbelastung', unit: '%', group: 'finance' },
  risk_tolerance: { label: 'Risikobereitschaft (1-10)', group: 'personal' },
};

export type MetaFieldKey = keyof Omit<MetaProfile, 'id' | 'user_id' | 'last_confirmed_at' | 'created_at' | 'updated_at'>;

const PROFILE_FIELDS =
  'id, age, monthly_income, fixed_costs, savings_rate, wealth, debts, occupation, professional_status, financial_goal, tax_burden, risk_tolerance, last_confirmed_at, created_at, updated_at';

// Map a profiles row to the legacy MetaProfile shape so all consumers keep working.
function rowToMeta(row: any, userId: string): MetaProfile | null {
  if (!row) return null;
  return {
    id: row.id,
    user_id: userId,
    monthly_income: row.monthly_income ?? null,
    fixed_costs: row.fixed_costs ?? null,
    savings_rate: row.savings_rate ?? null,
    wealth: row.wealth ?? null,
    debts: row.debts ?? null,
    age: row.age ?? null,
    occupation: row.occupation ?? null,
    professional_status: row.professional_status ?? null,
    financial_goal: row.financial_goal ?? null,
    tax_burden: row.tax_burden ?? null,
    risk_tolerance: row.risk_tolerance ?? null,
    last_confirmed_at: row.last_confirmed_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useMetaProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { saveSnapshot } = useMemorySnapshot();

  const query = useQuery({
    queryKey: ['meta-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_FIELDS)
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return rowToMeta(data, user.id);
    },
    enabled: !!user?.id,
  });

  // Profiles row is auto-created by the handle_new_user trigger; just return it.
  const ensureProfile = async (): Promise<MetaProfile> => {
    if (query.data) return query.data;
    if (!user?.id) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    const meta = rowToMeta(data, user.id);
    if (!meta) throw new Error('Profile not found');
    queryClient.setQueryData(['meta-profile', user.id], meta);
    return meta;
  };

  // Update a single field with history tracking
  const updateField = async (
    field: MetaFieldKey,
    newValue: string | number | null,
    source: string = 'manual'
  ) => {
    if (!user?.id) return;
    const profile = await ensureProfile();
    const oldValue = profile[field as keyof MetaProfile];

    // Update the profile
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: newValue } as any)
      .eq('id', user.id);
    if (error) throw error;

    // Write history entry
    await supabase.from('meta_profile_history').insert([{
      user_id: user.id,
      field_name: field,
      old_value: oldValue != null ? String(oldValue) : null,
      new_value: newValue != null ? String(newValue) : null,
      source,
    }]);

    // Save memory
    const fieldMeta = META_FIELD_MAP[field];
    if (fieldMeta) {
      saveSnapshot(
        'meta-profil',
        `${fieldMeta.label} aktualisiert`,
        { field, oldValue: oldValue != null ? String(oldValue) : null },
        { newValue: newValue != null ? String(newValue) : null, source }
      );
    }

    queryClient.invalidateQueries({ queryKey: ['meta-profile'] });
  };

  // Bulk update multiple fields
  const updateFields = async (
    updates: Partial<Record<MetaFieldKey, string | number | null>>,
    source: string = 'manual'
  ) => {
    if (!user?.id) return;
    const profile = await ensureProfile();

    const { error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', user.id);
    if (error) throw error;

    // Write history for each changed field
    const historyEntries = Object.entries(updates)
      .filter(([field, newVal]) => {
        const oldVal = profile[field as keyof MetaProfile];
        return String(oldVal ?? '') !== String(newVal ?? '');
      })
      .map(([field, newVal]) => ({
        user_id: user.id!,
        field_name: field,
        old_value: profile[field as keyof MetaProfile] != null ? String(profile[field as keyof MetaProfile]) : null,
        new_value: newVal != null ? String(newVal) : null,
        source,
      }));

    if (historyEntries.length > 0) {
      await supabase.from('meta_profile_history').insert(historyEntries);
    }

    queryClient.invalidateQueries({ queryKey: ['meta-profile'] });
  };

  // Confirm profile (resets 90-day timer)
  const confirmProfile = async () => {
    if (!user?.id) return;
    await ensureProfile();
    const { error } = await supabase
      .from('profiles')
      .update({ last_confirmed_at: new Date().toISOString() } as any)
      .eq('id', user.id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['meta-profile'] });
    toast.success('Profildaten bestätigt');
  };

  // Check if 90-day checkup is needed
  const needsCheckup = (() => {
    if (!query.data?.last_confirmed_at) return true;
    const lastConfirmed = new Date(query.data.last_confirmed_at);
    const daysSince = (Date.now() - lastConfirmed.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 90;
  })();

  // Get a field value
  const getFieldValue = (field: MetaFieldKey): string | number | null => {
    if (!query.data) return null;
    return query.data[field as keyof MetaProfile] as string | number | null;
  };

  return {
    profile: query.data,
    isLoading: query.isLoading,
    getFieldValue,
    updateField,
    updateFields,
    confirmProfile,
    needsCheckup,
    ensureProfile,
  };
}
