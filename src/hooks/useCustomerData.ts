import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for customer data (will be updated when types regenerate)
export interface Customer {
  id: string;
  salutation: string | null;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  civil_status: string | null;
  partner_customer_id: string | null;
  number_of_children: number;
  ahv_number: string | null;
  customer_status: string;
  priority: string | null;
  care_level: string | null;
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
  communication_preference: string | null;
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
  employment_type: string | null;
  employer: string | null;
  job_title: string | null;
  industry: string | null;
  workload_percentage: number | null;
  income_range: string | null;
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
  estimated_revenue_band: string | null;
  lifetime_value: number | null;
  service_effort: string | null;
  trust_level: number | null;
  decision_style: string | null;
  implementation_strength: number | null;
  financial_knowledge_level: string | null;
  upsell_potential: string | null;
  cross_sell_potential: string | null;
  referral_score: number | null;
  google_review_received: boolean;
  google_review_date: string | null;
  moneytree_received: boolean;
  moneytree_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithRelations extends Customer {
  customer_profiles?: CustomerProfile | null;
  customer_economics?: CustomerEconomics | null;
  customer_control?: CustomerControl | null;
  partner?: Customer | null;
  referrer?: Customer | null;
}

// Fetch all customers
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data as Customer[];
    }
  });
}

// Fetch single customer with all relations
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

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    }
  });
}

// Update customer profile
export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customer_id, ...updates }: Partial<CustomerProfile> & { customer_id: string }) => {
      // Check if profile exists
      const { data: existing } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('customer_id', customer_id)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('customer_profiles')
          .update(updates as any)
          .eq('customer_id', customer_id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_profiles')
          .insert({ customer_id, ...updates } as any)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer_profile', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
    }
  });
}

// Update customer economics
export function useUpdateCustomerEconomics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customer_id, ...updates }: Partial<CustomerEconomics> & { customer_id: string }) => {
      const { data: existing } = await supabase
        .from('customer_economics')
        .select('id')
        .eq('customer_id', customer_id)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('customer_economics')
          .update(updates as any)
          .eq('customer_id', customer_id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_economics')
          .insert({ customer_id, ...updates } as any)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer_economics', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
    }
  });
}

// Update customer control
export function useUpdateCustomerControl() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customer_id, ...updates }: Partial<CustomerControl> & { customer_id: string }) => {
      const { data: existing } = await supabase
        .from('customer_control')
        .select('id')
        .eq('customer_id', customer_id)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('customer_control')
          .update(updates as any)
          .eq('customer_id', customer_id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_control')
          .insert({ customer_id, ...updates } as any)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
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
          deleted_by: user?.id
        })
        .eq('id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}
