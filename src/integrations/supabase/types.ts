export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cases_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cases_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_role?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      course_feedback: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          lesson_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          lesson_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          lesson_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_feedback_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_text: string | null
          id: string
          is_active: boolean
          module_id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_text?: string | null
          id?: string
          is_active?: boolean
          module_id: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_text?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_control: {
        Row: {
          created_at: string
          cross_sell_potential:
            | Database["public"]["Enums"]["potential_level"]
            | null
          customer_id: string
          customer_value_score: number | null
          decision_style: Database["public"]["Enums"]["decision_style"] | null
          estimated_revenue_band:
            | Database["public"]["Enums"]["revenue_band"]
            | null
          financial_knowledge_level:
            | Database["public"]["Enums"]["financial_knowledge_level"]
            | null
          google_review_date: string | null
          google_review_received: boolean | null
          id: string
          implementation_strength: number | null
          lifetime_value: number | null
          moneytree_date: string | null
          moneytree_received: boolean | null
          referral_score: number | null
          service_effort: Database["public"]["Enums"]["service_effort"] | null
          trust_level: number | null
          updated_at: string
          upsell_potential:
            | Database["public"]["Enums"]["potential_level"]
            | null
        }
        Insert: {
          created_at?: string
          cross_sell_potential?:
            | Database["public"]["Enums"]["potential_level"]
            | null
          customer_id: string
          customer_value_score?: number | null
          decision_style?: Database["public"]["Enums"]["decision_style"] | null
          estimated_revenue_band?:
            | Database["public"]["Enums"]["revenue_band"]
            | null
          financial_knowledge_level?:
            | Database["public"]["Enums"]["financial_knowledge_level"]
            | null
          google_review_date?: string | null
          google_review_received?: boolean | null
          id?: string
          implementation_strength?: number | null
          lifetime_value?: number | null
          moneytree_date?: string | null
          moneytree_received?: boolean | null
          referral_score?: number | null
          service_effort?: Database["public"]["Enums"]["service_effort"] | null
          trust_level?: number | null
          updated_at?: string
          upsell_potential?:
            | Database["public"]["Enums"]["potential_level"]
            | null
        }
        Update: {
          created_at?: string
          cross_sell_potential?:
            | Database["public"]["Enums"]["potential_level"]
            | null
          customer_id?: string
          customer_value_score?: number | null
          decision_style?: Database["public"]["Enums"]["decision_style"] | null
          estimated_revenue_band?:
            | Database["public"]["Enums"]["revenue_band"]
            | null
          financial_knowledge_level?:
            | Database["public"]["Enums"]["financial_knowledge_level"]
            | null
          google_review_date?: string | null
          google_review_received?: boolean | null
          id?: string
          implementation_strength?: number | null
          lifetime_value?: number | null
          moneytree_date?: string | null
          moneytree_received?: boolean | null
          referral_score?: number | null
          service_effort?: Database["public"]["Enums"]["service_effort"] | null
          trust_level?: number | null
          updated_at?: string
          upsell_potential?:
            | Database["public"]["Enums"]["potential_level"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_control_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_economics: {
        Row: {
          banks: string[] | null
          bonus_income: boolean | null
          created_at: string
          customer_id: string
          employer: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          entrepreneurial_activity: boolean | null
          has_liabilities: boolean | null
          ibans: string[] | null
          id: string
          income_range: Database["public"]["Enums"]["income_range"] | null
          industry: string | null
          job_title: string | null
          owns_real_estate: boolean | null
          side_income: boolean | null
          updated_at: string
          workload_percentage: number | null
        }
        Insert: {
          banks?: string[] | null
          bonus_income?: boolean | null
          created_at?: string
          customer_id: string
          employer?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          entrepreneurial_activity?: boolean | null
          has_liabilities?: boolean | null
          ibans?: string[] | null
          id?: string
          income_range?: Database["public"]["Enums"]["income_range"] | null
          industry?: string | null
          job_title?: string | null
          owns_real_estate?: boolean | null
          side_income?: boolean | null
          updated_at?: string
          workload_percentage?: number | null
        }
        Update: {
          banks?: string[] | null
          bonus_income?: boolean | null
          created_at?: string
          customer_id?: string
          employer?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          entrepreneurial_activity?: boolean | null
          has_liabilities?: boolean | null
          ibans?: string[] | null
          id?: string
          income_range?: Database["public"]["Enums"]["income_range"] | null
          industry?: string | null
          job_title?: string | null
          owns_real_estate?: boolean | null
          side_income?: boolean | null
          updated_at?: string
          workload_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_economics_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_lesson_access: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_unlocked: boolean
          lesson_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_unlocked?: boolean
          lesson_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_unlocked?: boolean
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_lesson_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_lesson_access_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_module_access: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_unlocked: boolean
          module_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_unlocked?: boolean
          module_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_unlocked?: boolean
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_module_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_module_access_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_settings: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          show_courses: boolean
          show_goals: boolean
          show_insurances: boolean
          show_library: boolean
          show_strategies: boolean
          show_strategy_privacy: boolean
          show_tasks: boolean
          show_tools: boolean
          strategy_access_password: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          show_courses?: boolean
          show_goals?: boolean
          show_insurances?: boolean
          show_library?: boolean
          show_strategies?: boolean
          show_strategy_privacy?: boolean
          show_tasks?: boolean
          show_tools?: boolean
          strategy_access_password?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          show_courses?: boolean
          show_goals?: boolean
          show_insurances?: boolean
          show_library?: boolean
          show_strategies?: boolean
          show_strategy_privacy?: boolean
          show_tasks?: boolean
          show_tools?: boolean
          strategy_access_password?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_settings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_products: {
        Row: {
          category: string
          created_at: string
          customer_id: string
          document_url: string | null
          id: string
          notes: string | null
          payment_interval: string
          price: number | null
          product_name: string
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          customer_id: string
          document_url?: string | null
          id?: string
          notes?: string | null
          payment_interval?: string
          price?: number | null
          product_name: string
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          customer_id?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          payment_interval?: string
          price?: number | null
          product_name?: string
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          canton: string | null
          children_birth_years: number[] | null
          city: string | null
          communication_preference:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          country: string | null
          created_at: string
          customer_id: string
          email: string | null
          gdpr_consent_at: string | null
          house_number: string | null
          id: string
          language_preference: string | null
          phone: string | null
          postal_code: string | null
          street: string | null
          updated_at: string
          wedding_date: string | null
        }
        Insert: {
          canton?: string | null
          children_birth_years?: number[] | null
          city?: string | null
          communication_preference?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          country?: string | null
          created_at?: string
          customer_id: string
          email?: string | null
          gdpr_consent_at?: string | null
          house_number?: string | null
          id?: string
          language_preference?: string | null
          phone?: string | null
          postal_code?: string | null
          street?: string | null
          updated_at?: string
          wedding_date?: string | null
        }
        Update: {
          canton?: string | null
          children_birth_years?: number[] | null
          city?: string | null
          communication_preference?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          country?: string | null
          created_at?: string
          customer_id?: string
          email?: string | null
          gdpr_consent_at?: string | null
          house_number?: string | null
          id?: string
          language_preference?: string | null
          phone?: string | null
          postal_code?: string | null
          street?: string | null
          updated_at?: string
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tool_access: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_enabled: boolean
          tool_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_enabled?: boolean
          tool_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_enabled?: boolean
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tool_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tool_access_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_users: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          acquisition_source: string | null
          ahv_number: string | null
          care_level: Database["public"]["Enums"]["care_level"] | null
          civil_status: Database["public"]["Enums"]["civil_status"] | null
          created_at: string
          created_by: string | null
          customer_status: Database["public"]["Enums"]["customer_status"]
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          first_contact_date: string | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          number_of_children: number | null
          partner_customer_id: string | null
          preferred_name: string | null
          priority: Database["public"]["Enums"]["customer_priority"] | null
          referrer_customer_id: string | null
          salutation: string | null
          updated_at: string
        }
        Insert: {
          acquisition_source?: string | null
          ahv_number?: string | null
          care_level?: Database["public"]["Enums"]["care_level"] | null
          civil_status?: Database["public"]["Enums"]["civil_status"] | null
          created_at?: string
          created_by?: string | null
          customer_status?: Database["public"]["Enums"]["customer_status"]
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_contact_date?: string | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          number_of_children?: number | null
          partner_customer_id?: string | null
          preferred_name?: string | null
          priority?: Database["public"]["Enums"]["customer_priority"] | null
          referrer_customer_id?: string | null
          salutation?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_source?: string | null
          ahv_number?: string | null
          care_level?: Database["public"]["Enums"]["care_level"] | null
          civil_status?: Database["public"]["Enums"]["civil_status"] | null
          created_at?: string
          created_by?: string | null
          customer_status?: Database["public"]["Enums"]["customer_status"]
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_contact_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          number_of_children?: number | null
          partner_customer_id?: string | null
          preferred_name?: string | null
          priority?: Database["public"]["Enums"]["customer_priority"] | null
          referrer_customer_id?: string | null
          salutation?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_partner_customer_id_fkey"
            columns: ["partner_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_referrer_customer_id_fkey"
            columns: ["referrer_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      default_portal_settings: {
        Row: {
          created_at: string
          id: string
          show_courses: boolean
          show_goals: boolean
          show_insurances: boolean
          show_library: boolean
          show_strategies: boolean
          show_tasks: boolean
          show_tools: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          show_courses?: boolean
          show_goals?: boolean
          show_insurances?: boolean
          show_library?: boolean
          show_strategies?: boolean
          show_tasks?: boolean
          show_tools?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          show_courses?: boolean
          show_goals?: boolean
          show_insurances?: boolean
          show_library?: boolean
          show_strategies?: boolean
          show_tasks?: boolean
          show_tools?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      gamification_actions: {
        Row: {
          action_ref: string
          action_type: string
          created_at: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          action_ref?: string
          action_type: string
          created_at?: string
          id?: string
          points_awarded: number
          user_id: string
        }
        Update: {
          action_ref?: string
          action_type?: string
          created_at?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      insurance_consultations: {
        Row: {
          consultation_data: Json
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          label: string | null
          status: string
          title: string | null
          updated_at: string
          version_key: string
        }
        Insert: {
          consultation_data?: Json
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          label?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          version_key: string
        }
        Update: {
          consultation_data?: Json
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          label?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          version_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_consultations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_consultations: {
        Row: {
          consultation_data: Json
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          label: string | null
          status: string
          title: string | null
          updated_at: string
          version_key: string
        }
        Insert: {
          consultation_data?: Json
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          label?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          version_key: string
        }
        Update: {
          consultation_data?: Json
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          label?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          version_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_consultations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      leadmagnet_3a_checks: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          q1_provider: string
          q2_year: string
          q3_payment: string
          q4_fees: string
          q5_flexibility: string
          q6_investment: string
          q7_feeling: string
          result_level: string
          score_total: number
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          q1_provider: string
          q2_year: string
          q3_payment: string
          q4_fees: string
          q5_flexibility: string
          q6_investment: string
          q7_feeling: string
          result_level: string
          score_total: number
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          q1_provider?: string
          q2_year?: string
          q3_payment?: string
          q4_fees?: string
          q5_flexibility?: string
          q6_investment?: string
          q7_feeling?: string
          result_level?: string
          score_total?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          metadata: Json | null
          name: string
          page_slug: string | null
          phone: string | null
          source: string | null
          status: string | null
          tool_key: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          metadata?: Json | null
          name: string
          page_slug?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tool_key?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          name?: string
          page_slug?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tool_key?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          case_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          scheduled_at: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          scheduled_at: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          scheduled_at?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_meetings_case_id"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_meetings_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          action: string
          created_at: string
          id: string
          input_data: Json | null
          output_data: Json | null
          title: string | null
          tool_slug: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          title?: string | null
          tool_slug: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          title?: string | null
          tool_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          author_id: string | null
          case_id: string
          content: string
          created_at: string
          id: string
          meeting_id: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          case_id: string
          content: string
          created_at?: string
          id?: string
          meeting_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          meeting_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notes_author_id"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notes_case_id"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notes_meeting_id"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_exclusions: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_exclusions_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled_categories: string[]
          id: string
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled_categories?: string[]
          id?: string
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled_categories?: string[]
          id?: string
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          link_label: string | null
          link_url: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string
          target_role: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          target_role?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          target_role?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          page_type: string
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          page_type: string
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          page_type?: string
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_map_edges: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          relation: string
          source_key: string
          target_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          relation: string
          source_key: string
          target_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          relation?: string
          source_key?: string
          target_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_map_edges_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "system_map_nodes"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "system_map_edges_target_key_fkey"
            columns: ["target_key"]
            isOneToOne: false
            referencedRelation: "system_map_nodes"
            referencedColumns: ["key"]
          },
        ]
      }
      system_map_nodes: {
        Row: {
          category: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          importance: string
          is_active: boolean
          key: string
          label: string
          phase: number
          position_x: number | null
          position_y: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          importance?: string
          is_active?: boolean
          key: string
          label: string
          phase?: number
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          importance?: string
          is_active?: boolean
          key?: string
          label?: string
          phase?: number
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tasks_case_id"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tasks_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      three_a_analyses: {
        Row: {
          analysis_result: Json | null
          contract_end: string | null
          contract_start: string | null
          contribution_amount: number | null
          contribution_frequency: string | null
          costs: Json | null
          created_at: string
          current_value: number | null
          equity_quota: number | null
          flexibility: Json | null
          funds: Json | null
          guaranteed_value: number | null
          id: string
          initial_assessment: string | null
          issues: Json | null
          paid_contributions: number | null
          product_name: string | null
          product_type: string | null
          provider: string | null
          raw_extraction: Json | null
          remaining_years: number | null
          session_id: string
          status: string
          strategy_classification: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          contract_end?: string | null
          contract_start?: string | null
          contribution_amount?: number | null
          contribution_frequency?: string | null
          costs?: Json | null
          created_at?: string
          current_value?: number | null
          equity_quota?: number | null
          flexibility?: Json | null
          funds?: Json | null
          guaranteed_value?: number | null
          id?: string
          initial_assessment?: string | null
          issues?: Json | null
          paid_contributions?: number | null
          product_name?: string | null
          product_type?: string | null
          provider?: string | null
          raw_extraction?: Json | null
          remaining_years?: number | null
          session_id?: string
          status?: string
          strategy_classification?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          contract_end?: string | null
          contract_start?: string | null
          contribution_amount?: number | null
          contribution_frequency?: string | null
          costs?: Json | null
          created_at?: string
          current_value?: number | null
          equity_quota?: number | null
          flexibility?: Json | null
          funds?: Json | null
          guaranteed_value?: number | null
          id?: string
          initial_assessment?: string | null
          issues?: Json | null
          paid_contributions?: number | null
          product_name?: string | null
          product_type?: string | null
          provider?: string | null
          raw_extraction?: Json | null
          remaining_years?: number | null
          session_id?: string
          status?: string
          strategy_classification?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      three_a_documents: {
        Row: {
          analysis_id: string
          created_at: string
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          processing_status: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          processing_status?: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          processing_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "three_a_documents_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "three_a_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      three_a_extracted_fields: {
        Row: {
          analysis_id: string
          confidence: string | null
          created_at: string
          field_key: string
          field_value: string | null
          id: string
          is_verified: boolean | null
          source_document_id: string | null
        }
        Insert: {
          analysis_id: string
          confidence?: string | null
          created_at?: string
          field_key: string
          field_value?: string | null
          id?: string
          is_verified?: boolean | null
          source_document_id?: string | null
        }
        Update: {
          analysis_id?: string
          confidence?: string | null
          created_at?: string
          field_key?: string
          field_value?: string | null
          id?: string
          is_verified?: boolean | null
          source_document_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "three_a_extracted_fields_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "three_a_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_a_extracted_fields_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "three_a_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      three_a_review_requests: {
        Row: {
          analysis_id: string | null
          consent_given: boolean
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          consent_given?: boolean
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          consent_given?: boolean
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "three_a_review_requests_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "three_a_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          cta_mode: string | null
          description_key: string
          enabled_for_clients: boolean
          enabled_for_public: boolean
          icon: string
          id: string
          key: string
          name_key: string
          slug: string | null
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_mode?: string | null
          description_key: string
          enabled_for_clients?: boolean
          enabled_for_public?: boolean
          icon?: string
          id?: string
          key: string
          name_key: string
          slug?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_mode?: string | null
          description_key?: string
          enabled_for_clients?: boolean
          enabled_for_public?: boolean
          icon?: string
          id?: string
          key?: string
          name_key?: string
          slug?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string
          id: string
          last_daily_login: string | null
          points: number
          profile_completed_bonus: boolean
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_daily_login?: string | null
          points?: number
          profile_completed_bonus?: boolean
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_daily_login?: string | null
          points?: number
          profile_completed_bonus?: boolean
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      customer_portal_settings_client: {
        Row: {
          created_at: string | null
          customer_id: string | null
          has_strategy_password: boolean | null
          id: string | null
          show_courses: boolean | null
          show_goals: boolean | null
          show_insurances: boolean | null
          show_library: boolean | null
          show_strategies: boolean | null
          show_strategy_privacy: boolean | null
          show_tasks: boolean | null
          show_tools: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          has_strategy_password?: never
          id?: string | null
          show_courses?: boolean | null
          show_goals?: boolean | null
          show_insurances?: boolean | null
          show_library?: boolean | null
          show_strategies?: boolean | null
          show_strategy_privacy?: boolean | null
          show_tasks?: boolean | null
          show_tools?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          has_strategy_password?: never
          id?: string | null
          show_courses?: boolean | null
          show_goals?: boolean | null
          show_insurances?: boolean | null
          show_library?: boolean | null
          show_strategies?: boolean | null
          show_strategy_privacy?: boolean | null
          show_tasks?: boolean | null
          show_tools?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_settings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_deleted_items: { Args: never; Returns: number }
      cleanup_rate_limits: { Args: never; Returns: number }
      get_customer_id_for_user: { Args: { _user_id: string }; Returns: string }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_rate_limit: {
        Args: { p_ip: string; p_window: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_client: { Args: { _user_id: string }; Returns: boolean }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
      staff_has_case_access: {
        Args: { _case_id: string; _user_id: string }
        Returns: boolean
      }
      staff_has_customer_access: {
        Args: { _customer_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "client"
      care_level: "vip" | "standard" | "light"
      case_status:
        | "offen"
        | "in_bearbeitung"
        | "wartet_auf_kunde"
        | "abgeschlossen"
        | "pausiert"
      civil_status:
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "partnership"
      communication_preference: "whatsapp" | "email" | "phone"
      customer_priority: "A" | "B" | "C"
      customer_status: "lead" | "active" | "passive" | "former"
      decision_style: "fast" | "analytical" | "hesitant"
      employment_type:
        | "employed"
        | "self_employed"
        | "entrepreneur"
        | "unemployed"
        | "retired"
      financial_knowledge_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert"
      income_range:
        | "under_50k"
        | "50k_80k"
        | "80k_120k"
        | "120k_200k"
        | "200k_plus"
      meeting_type:
        | "erstberatung"
        | "folgeberatung"
        | "check_in"
        | "telefonat"
        | "video_call"
      potential_level: "none" | "low" | "medium" | "high"
      revenue_band: "low" | "medium" | "high" | "very_high"
      service_effort: "low" | "medium" | "high"
      task_priority: "niedrig" | "mittel" | "hoch" | "dringend"
      task_status: "offen" | "in_arbeit" | "erledigt" | "blockiert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "client"],
      care_level: ["vip", "standard", "light"],
      case_status: [
        "offen",
        "in_bearbeitung",
        "wartet_auf_kunde",
        "abgeschlossen",
        "pausiert",
      ],
      civil_status: ["single", "married", "divorced", "widowed", "partnership"],
      communication_preference: ["whatsapp", "email", "phone"],
      customer_priority: ["A", "B", "C"],
      customer_status: ["lead", "active", "passive", "former"],
      decision_style: ["fast", "analytical", "hesitant"],
      employment_type: [
        "employed",
        "self_employed",
        "entrepreneur",
        "unemployed",
        "retired",
      ],
      financial_knowledge_level: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
      ],
      income_range: [
        "under_50k",
        "50k_80k",
        "80k_120k",
        "120k_200k",
        "200k_plus",
      ],
      meeting_type: [
        "erstberatung",
        "folgeberatung",
        "check_in",
        "telefonat",
        "video_call",
      ],
      potential_level: ["none", "low", "medium", "high"],
      revenue_band: ["low", "medium", "high", "very_high"],
      service_effort: ["low", "medium", "high"],
      task_priority: ["niedrig", "mittel", "hoch", "dringend"],
      task_status: ["offen", "in_arbeit", "erledigt", "blockiert"],
    },
  },
} as const
