import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type CustomerStatus = 'lead' | 'active' | 'passive' | 'former';
export type CustomerPriority = 'A' | 'B' | 'C';
export type CareLevel = 'vip' | 'standard' | 'light';
export type CommunicationPreference = 'whatsapp' | 'email' | 'phone';
export type EmploymentType = 'employed' | 'self_employed' | 'entrepreneur' | 'unemployed' | 'retired';
export type IncomeRange = 'under_50k' | '50k_80k' | '80k_120k' | '120k_200k' | '200k_plus';
export type RevenueBand = 'low' | 'medium' | 'high' | 'very_high';
export type ServiceEffort = 'low' | 'medium' | 'high';
export type DecisionStyle = 'fast' | 'analytical' | 'hesitant';
export type FinancialKnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type PotentialLevel = 'none' | 'low' | 'medium' | 'high';
export type CivilStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'partnership';

export interface Customer {
  id: string;
  salutation: string | null;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  civil_status: CivilStatus | null;
  partner_customer_id: string | null;
  number_of_children: number;
  ahv_number: string | null;
  customer_status: CustomerStatus;
  priority: CustomerPriority | null;
  care_level: CareLevel | null;
  acquisition_source: string | null;
  referrer_customer_id: string | null;
  first_contact_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface CustomerProfile {
  id: string;
  customer_id: string;
  phone: string | null;
  email: string | null;
  communication_preference: CommunicationPreference | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  canton: string | null;
  country: string | null;
  language_preference: string | null;
  wedding_date: string | null;
  children_birth_years: number[] | null;
  gdpr_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerEconomics {
  id: string;
  customer_id: string;
  employment_type: EmploymentType | null;
  employer: string | null;
  job_title: string | null;
  industry: string | null;
  workload_percentage: number | null;
  income_range: IncomeRange | null;
  bonus_income: boolean;
  side_income: boolean;
  banks: string[] | null;
  ibans: string[] | null;
  owns_real_estate: boolean;
  has_liabilities: boolean;
  entrepreneurial_activity: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerControl {
  id: string;
  customer_id: string;
  customer_value_score: number | null;
  estimated_revenue_band: RevenueBand | null;
  lifetime_value: number | null;
  service_effort: ServiceEffort | null;
  trust_level: number | null;
  decision_style: DecisionStyle | null;
  implementation_strength: number | null;
  financial_knowledge_level: FinancialKnowledgeLevel | null;
  upsell_potential: PotentialLevel | null;
  cross_sell_potential: PotentialLevel | null;
  referral_score: number | null;
  google_review_received: boolean;
  google_review_date: string | null;
  moneytree_received: boolean;
  moneytree_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithRelations extends Customer {
  customer_profiles: CustomerProfile | null;
  customer_economics: CustomerEconomics | null;
  customer_control: CustomerControl | null;
}

// Input types for mutations (without auto-generated fields)
export interface CustomerInsert {
  salutation?: string | null;
  first_name: string;
  last_name: string;
  preferred_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  civil_status?: CivilStatus | null;
  partner_customer_id?: string | null;
  number_of_children?: number;
  ahv_number?: string | null;
  customer_status?: CustomerStatus;
  priority?: CustomerPriority | null;
  care_level?: CareLevel | null;
  acquisition_source?: string | null;
  referrer_customer_id?: string | null;
  first_contact_date?: string | null;
}

export interface CustomerProfileUpsert {
  customer_id: string;
  phone?: string | null;
  email?: string | null;
  communication_preference?: CommunicationPreference | null;
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
  canton?: string | null;
  country?: string | null;
  language_preference?: string | null;
  wedding_date?: string | null;
  children_birth_years?: number[] | null;
  gdpr_consent_at?: string | null;
}

export interface CustomerEconomicsUpsert {
  customer_id: string;
  employment_type?: EmploymentType | null;
  employer?: string | null;
  job_title?: string | null;
  industry?: string | null;
  workload_percentage?: number | null;
  income_range?: IncomeRange | null;
  bonus_income?: boolean;
  side_income?: boolean;
  banks?: string[] | null;
  ibans?: string[] | null;
  owns_real_estate?: boolean;
  has_liabilities?: boolean;
  entrepreneurial_activity?: boolean;
}

export interface CustomerControlUpsert {
  customer_id: string;
  customer_value_score?: number | null;
  estimated_revenue_band?: RevenueBand | null;
  lifetime_value?: number | null;
  service_effort?: ServiceEffort | null;
  trust_level?: number | null;
  decision_style?: DecisionStyle | null;
  implementation_strength?: number | null;
  financial_knowledge_level?: FinancialKnowledgeLevel | null;
  upsell_potential?: PotentialLevel | null;
  cross_sell_potential?: PotentialLevel | null;
  referral_score?: number | null;
  google_review_received?: boolean;
  google_review_date?: string | null;
  moneytree_received?: boolean;
  moneytree_date?: string | null;
}

// ============================================
// QUERY HOOKS
// ============================================

// Filter parameters for customers list
export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus | null;
  priority?: CustomerPriority | null;
  careLevel?: CareLevel | null;
  acquisitionSource?: string | null;
  withoutGoogleReview?: boolean;
  withoutMoneytree?: boolean;
}

// Fetch all non-deleted customers with server-side filters
export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select(`
          *,
          customer_profiles(email, phone),
          customer_control(google_review_received, moneytree_received)
        `)
        .is('deleted_at', null);

      // Status filter
      if (filters.status) {
        query = query.eq('customer_status', filters.status);
      }

      // Priority filter
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      // Care level filter
      if (filters.careLevel) {
        query = query.eq('care_level', filters.careLevel);
      }

      // Acquisition source filter
      if (filters.acquisitionSource) {
        query = query.eq('acquisition_source', filters.acquisitionSource);
      }

      // Search filter (server-side ilike)
      if (filters.search?.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(`first_name.ilike.${term},last_name.ilike.${term}`);
      }

      const { data, error } = await query.order('last_name', { ascending: true });
      
      if (error) throw error;

      // Client-side filtering for google_review and moneytree (requires join data)
      let results = data as (Customer & { 
        customer_profiles: { email: string | null; phone: string | null } | null;
        customer_control: { google_review_received: boolean | null; moneytree_received: boolean | null } | null;
      })[];

      if (filters.withoutGoogleReview) {
        results = results.filter(c => !c.customer_control?.google_review_received);
      }

      if (filters.withoutMoneytree) {
        results = results.filter(c => !c.customer_control?.moneytree_received);
      }

      return results;
    }
  });
}

// Fetch all soft-deleted customers (for trash view)
export function useDeletedCustomers() {
  return useQuery({
    queryKey: ['customers', 'deleted'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*, customer_profiles(email, phone)')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      return data as (Customer & { customer_profiles: { email: string | null; phone: string | null } | null })[];
    }
  });
}

// Fetch single non-deleted customer with all relations
export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_profiles (*),
          customer_economics (*),
          customer_control (*)
        `)
        .eq('id', customerId)
        .is('deleted_at', null)
        .maybeSingle();
      
      if (error) throw error;
      return data as CustomerWithRelations | null;
    },
    enabled: !!customerId
  });
}

// Fetch customer profile
export function useCustomerProfile(customerId: string) {
  return useQuery({
    queryKey: ['customer_profile', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CustomerProfile | null;
    },
    enabled: !!customerId
  });
}

// Fetch customer economics
export function useCustomerEconomics(customerId: string) {
  return useQuery({
    queryKey: ['customer_economics', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_economics')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CustomerEconomics | null;
    },
    enabled: !!customerId
  });
}

// Fetch customer control
export function useCustomerControl(customerId: string) {
  return useQuery({
    queryKey: ['customer_control', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_control')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CustomerControl | null;
    },
    enabled: !!customerId
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

// Create customer with optional profile data
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CustomerInsert & { email?: string | null; phone?: string | null }) => {
      const { email, phone, ...customerData } = input;
      
      // Insert customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          salutation: customerData.salutation,
          preferred_name: customerData.preferred_name,
          date_of_birth: customerData.date_of_birth,
          nationality: customerData.nationality,
          civil_status: customerData.civil_status,
          partner_customer_id: customerData.partner_customer_id,
          number_of_children: customerData.number_of_children ?? 0,
          ahv_number: customerData.ahv_number,
          customer_status: customerData.customer_status ?? 'lead',
          priority: customerData.priority,
          care_level: customerData.care_level,
          acquisition_source: customerData.acquisition_source,
          referrer_customer_id: customerData.referrer_customer_id,
          first_contact_date: customerData.first_contact_date,
        })
        .select()
        .single();
      
      if (customerError) throw customerError;
      
      // Create empty profile with email/phone if provided
      if (email || phone) {
        await supabase
          .from('customer_profiles')
          .insert({
            customer_id: customer.id,
            email,
            phone,
          });
      }
      
      // Create empty economics record
      await supabase
        .from('customer_economics')
        .insert({ customer_id: customer.id });
      
      // Create empty control record
      await supabase
        .from('customer_control')
        .insert({ customer_id: customer.id });
      
      return customer as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Update customer core data
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomerInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({
          salutation: updates.salutation,
          first_name: updates.first_name,
          last_name: updates.last_name,
          preferred_name: updates.preferred_name,
          date_of_birth: updates.date_of_birth,
          nationality: updates.nationality,
          civil_status: updates.civil_status,
          partner_customer_id: updates.partner_customer_id,
          number_of_children: updates.number_of_children,
          ahv_number: updates.ahv_number,
          customer_status: updates.customer_status,
          priority: updates.priority,
          care_level: updates.care_level,
          acquisition_source: updates.acquisition_source,
          referrer_customer_id: updates.referrer_customer_id,
          first_contact_date: updates.first_contact_date,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    }
  });
}

// Upsert customer profile (uses onConflict for customer_id)
export function useUpsertCustomerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CustomerProfileUpsert) => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .upsert(
          {
            customer_id: input.customer_id,
            phone: input.phone,
            email: input.email,
            communication_preference: input.communication_preference,
            street: input.street,
            house_number: input.house_number,
            postal_code: input.postal_code,
            city: input.city,
            canton: input.canton,
            country: input.country,
            language_preference: input.language_preference,
            wedding_date: input.wedding_date,
            children_birth_years: input.children_birth_years,
            gdpr_consent_at: input.gdpr_consent_at,
          },
          { onConflict: 'customer_id' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomerProfile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer_profile', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Upsert customer economics (uses onConflict for customer_id)
export function useUpsertCustomerEconomics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CustomerEconomicsUpsert) => {
      const { data, error } = await supabase
        .from('customer_economics')
        .upsert(
          {
            customer_id: input.customer_id,
            employment_type: input.employment_type,
            employer: input.employer,
            job_title: input.job_title,
            industry: input.industry,
            workload_percentage: input.workload_percentage,
            income_range: input.income_range,
            bonus_income: input.bonus_income,
            side_income: input.side_income,
            banks: input.banks,
            ibans: input.ibans,
            owns_real_estate: input.owns_real_estate,
            has_liabilities: input.has_liabilities,
            entrepreneurial_activity: input.entrepreneurial_activity,
          },
          { onConflict: 'customer_id' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomerEconomics;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer_economics', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
    }
  });
}

// Upsert customer control (uses onConflict for customer_id)
export function useUpsertCustomerControl() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CustomerControlUpsert) => {
      const { data, error } = await supabase
        .from('customer_control')
        .upsert(
          {
            customer_id: input.customer_id,
            customer_value_score: input.customer_value_score,
            estimated_revenue_band: input.estimated_revenue_band,
            lifetime_value: input.lifetime_value,
            service_effort: input.service_effort,
            trust_level: input.trust_level,
            decision_style: input.decision_style,
            implementation_strength: input.implementation_strength,
            financial_knowledge_level: input.financial_knowledge_level,
            upsell_potential: input.upsell_potential,
            cross_sell_potential: input.cross_sell_potential,
            referral_score: input.referral_score,
            google_review_received: input.google_review_received,
            google_review_date: input.google_review_date,
            moneytree_received: input.moneytree_received,
            moneytree_date: input.moneytree_date,
          },
          { onConflict: 'customer_id' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomerControl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer_control', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
    }
  });
}

// Soft delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('customers')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id ?? null
        })
        .eq('id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Restore soft-deleted customer
export function useRestoreCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .update({ 
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Permanently delete customer (hard delete)
export function useHardDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      // Delete related records first (if not using CASCADE)
      await supabase.from('customer_control').delete().eq('customer_id', customerId);
      await supabase.from('customer_economics').delete().eq('customer_id', customerId);
      await supabase.from('customer_profiles').delete().eq('customer_id', customerId);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Legacy aliases for backward compatibility
export const useUpdateCustomerProfile = useUpsertCustomerProfile;
export const useUpdateCustomerEconomics = useUpsertCustomerEconomics;
export const useUpdateCustomerControl = useUpsertCustomerControl;
