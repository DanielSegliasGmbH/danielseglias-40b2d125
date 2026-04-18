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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_user_id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      admin_nudge_overrides: {
        Row: {
          content: string
          created_at: string
          cta_label: string
          cta_path: string
          day_number: number
          emoji: string
          id: string
          if_finanz_typ: string | null
          is_active: boolean
          nudge_key: string
          nudge_type: string
          skip_if: string | null
          title: string
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          content: string
          created_at?: string
          cta_label?: string
          cta_path?: string
          day_number: number
          emoji?: string
          id?: string
          if_finanz_typ?: string | null
          is_active?: boolean
          nudge_key: string
          nudge_type?: string
          skip_if?: string | null
          title: string
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          cta_label?: string
          cta_path?: string
          day_number?: number
          emoji?: string
          id?: string
          if_finanz_typ?: string | null
          is_active?: boolean
          nudge_key?: string
          nudge_type?: string
          skip_if?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      article_reads: {
        Row: {
          article_id: string
          first_read_at: string
          id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          first_read_at?: string
          id?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          first_read_at?: string
          id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_rule_logs: {
        Row: {
          action_executed: string
          condition_snapshot: Json | null
          created_at: string
          customer_id: string | null
          id: string
          result: Json | null
          rule_id: string
          user_id: string
        }
        Insert: {
          action_executed: string
          condition_snapshot?: Json | null
          created_at?: string
          customer_id?: string | null
          id?: string
          result?: Json | null
          rule_id: string
          user_id: string
        }
        Update: {
          action_executed?: string
          condition_snapshot?: Json | null
          created_at?: string
          customer_id?: string | null
          id?: string
          result?: Json | null
          rule_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rule_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          condition_config: Json
          condition_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          notes: string | null
          priority: number
          scope: string
          trigger_count: number
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          condition_config?: Json
          condition_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          notes?: string | null
          priority?: number
          scope?: string
          trigger_count?: number
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          condition_config?: Json
          condition_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          notes?: string | null
          priority?: number
          scope?: string
          trigger_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          is_recurring: boolean
          note: string | null
          recurring_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          expense_date?: string
          id?: string
          is_recurring?: boolean
          note?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          is_recurring?: boolean
          note?: string | null
          recurring_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      challenges: {
        Row: {
          challenged_end_score: number | null
          challenged_id: string
          challenged_start_score: number | null
          challenger_end_score: number | null
          challenger_id: string
          challenger_start_score: number | null
          created_at: string
          end_date: string
          id: string
          start_date: string
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          challenged_end_score?: number | null
          challenged_id: string
          challenged_start_score?: number | null
          challenger_end_score?: number | null
          challenger_id: string
          challenger_start_score?: number | null
          created_at?: string
          end_date: string
          id?: string
          start_date?: string
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          challenged_end_score?: number | null
          challenged_id?: string
          challenged_start_score?: number | null
          challenger_end_score?: number | null
          challenger_id?: string
          challenger_start_score?: number | null
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          is_read: boolean
          message: string
          participant_id: string | null
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          participant_id?: string | null
          sender_id: string
          sender_role?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          participant_id?: string | null
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
      client_goals: {
        Row: {
          category: string | null
          created_at: string
          current_amount: number
          id: string
          is_completed: boolean
          mission_name: string | null
          target_amount: number | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          mission_name?: string | null
          target_amount?: number | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          mission_name?: string | null
          target_amount?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          notes: string | null
          priority: string
          source: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          priority?: string
          source?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          priority?: string
          source?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_badges: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          module_key: string
          user_id: string
        }
        Insert: {
          badge_type?: string
          earned_at?: string
          id?: string
          module_key: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          module_key?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_progress: {
        Row: {
          analysis_result: string | null
          answers: string | null
          completed_at: string | null
          created_at: string
          extracted_tasks: Json | null
          goals_saved: boolean
          id: string
          module_key: string
          reflection_input: string | null
          reflection_result: string | null
          status: string
          structured_data: Json | null
          tasks_created: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result?: string | null
          answers?: string | null
          completed_at?: string | null
          created_at?: string
          extracted_tasks?: Json | null
          goals_saved?: boolean
          id?: string
          module_key: string
          reflection_input?: string | null
          reflection_result?: string | null
          status?: string
          structured_data?: Json | null
          tasks_created?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: string | null
          answers?: string | null
          completed_at?: string | null
          created_at?: string
          extracted_tasks?: Json | null
          goals_saved?: boolean
          id?: string
          module_key?: string
          reflection_input?: string | null
          reflection_result?: string | null
          status?: string
          structured_data?: Json | null
          tasks_created?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_group_members: {
        Row: {
          anon_username: string
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          anon_username: string
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          anon_username?: string
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_group_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          flag_count: number
          group_id: string
          id: string
          is_hidden: boolean
          poll_options: Json | null
          poll_votes: Json | null
          post_type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          flag_count?: number
          group_id: string
          id?: string
          is_hidden?: boolean
          poll_options?: Json | null
          poll_votes?: Json | null
          post_type?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          flag_count?: number
          group_id?: string
          id?: string
          is_hidden?: boolean
          poll_options?: Json | null
          poll_votes?: Json | null
          post_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_group_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_group_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          description: string | null
          group_name: string
          id: string
          reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          group_name: string
          id?: string
          reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          group_name?: string
          id?: string
          reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          accepted_at: string
          created_at: string
          disclaimer_accepted: boolean
          disclaimer_version: string
          id: string
          ip_address: string | null
          privacy_accepted: boolean
          privacy_version: string
          terms_accepted: boolean
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          disclaimer_accepted?: boolean
          disclaimer_version?: string
          id?: string
          ip_address?: string | null
          privacy_accepted?: boolean
          privacy_version?: string
          terms_accepted?: boolean
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          disclaimer_accepted?: boolean
          disclaimer_version?: string
          id?: string
          ip_address?: string | null
          privacy_accepted?: boolean
          privacy_version?: string
          terms_accepted?: boolean
          terms_version?: string
          user_agent?: string | null
          user_id?: string
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
      cta_definitions: {
        Row: {
          conditions: Json
          created_at: string
          cta_type: string
          description: string | null
          display_description: string | null
          display_text: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          target: string
          updated_at: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          cta_type?: string
          description?: string | null
          display_description?: string | null
          display_text?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          target?: string
          updated_at?: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          cta_type?: string
          description?: string | null
          display_description?: string | null
          display_text?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          target?: string
          updated_at?: string
        }
        Relationships: []
      }
      cta_impressions: {
        Row: {
          clicked: boolean
          clicked_at: string | null
          context: string | null
          created_at: string
          cta_id: string | null
          cta_ref: string
          id: string
          user_id: string
        }
        Insert: {
          clicked?: boolean
          clicked_at?: string | null
          context?: string | null
          created_at?: string
          cta_id?: string | null
          cta_ref: string
          id?: string
          user_id: string
        }
        Update: {
          clicked?: boolean
          clicked_at?: string | null
          context?: string | null
          created_at?: string
          cta_id?: string | null
          cta_ref?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cta_impressions_cta_id_fkey"
            columns: ["cta_id"]
            isOneToOne: false
            referencedRelation: "cta_definitions"
            referencedColumns: ["id"]
          },
        ]
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
          visibility_condition: Json | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_unlocked?: boolean
          lesson_id: string
          visibility_condition?: Json | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_unlocked?: boolean
          lesson_id?: string
          visibility_condition?: Json | null
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
          visibility_condition: Json | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_unlocked?: boolean
          module_id: string
          visibility_condition?: Json | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_unlocked?: boolean
          module_id?: string
          visibility_condition?: Json | null
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
          portal_url: string | null
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
          portal_url?: string | null
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
          portal_url?: string | null
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
          visibility_condition: Json | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_enabled?: boolean
          tool_id: string
          visibility_condition?: Json | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_enabled?: boolean
          tool_id?: string
          visibility_condition?: Json | null
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
      document_extractions: {
        Row: {
          created_at: string
          document_type: string
          extracted_at: string
          extraction_successful: boolean
          fields_extracted_count: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          extracted_at?: string
          extraction_successful?: boolean
          fields_extracted_count?: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          extracted_at?: string
          extraction_successful?: boolean
          fields_extracted_count?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_unlocks: {
        Row: {
          feature_key: string
          id: string
          phase: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          feature_key: string
          id?: string
          phase?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          feature_key?: string
          id?: string
          phase?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_snapshots: {
        Row: {
          created_at: string
          id: string
          net_worth: number | null
          notes: string | null
          peak_score: number | null
          snapshot_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          net_worth?: number | null
          notes?: string | null
          peak_score?: number | null
          snapshot_data?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          net_worth?: number | null
          notes?: string | null
          peak_score?: number | null
          snapshot_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      financial_xrays: {
        Row: {
          created_at: string
          id: string
          month_key: string
          report_markdown: string
          tasks_created: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_key: string
          report_markdown: string
          tasks_created?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_key?: string
          report_markdown?: string
          tasks_created?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finanz_type_results: {
        Row: {
          answers: Json
          completed: boolean
          created_at: string
          finanz_type: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed?: boolean
          created_at?: string
          finanz_type?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed?: boolean
          created_at?: string
          finanz_type?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          id: string
          status: string
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user_id_1?: string
          user_id_2?: string
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
      gold_nut_collections: {
        Row: {
          earned_at: string
          id: string
          nut_key: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          nut_key: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          nut_key?: string
          user_id?: string
        }
        Relationships: []
      }
      group_feed_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          engagement_reactions: number
          engagement_replies: number
          engagement_views: number
          group_id: string | null
          id: string
          is_published: boolean
          published_at: string | null
          scheduled_at: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          engagement_reactions?: number
          engagement_replies?: number
          engagement_views?: number
          group_id?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          scheduled_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          engagement_reactions?: number
          engagement_replies?: number
          engagement_views?: number
          group_id?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          scheduled_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_feed_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_tracking: {
        Row: {
          created_at: string
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_tracking_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          emoji: string
          frequency: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hamster_profiles: {
        Row: {
          coins: number
          created_at: string
          gold_nuts: number
          hat: string | null
          id: string
          item: string | null
          skin: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          gold_nuts?: number
          hat?: string | null
          id?: string
          item?: string | null
          skin?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          gold_nuts?: number
          hat?: string | null
          id?: string
          item?: string | null
          skin?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          updated_at?: string
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
      journey_nudges: {
        Row: {
          completed_at: string | null
          created_at: string
          day_number: number
          dismissed_at: string | null
          id: string
          nudge_key: string
          shown_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_number: number
          dismissed_at?: string | null
          id?: string
          nudge_key: string
          shown_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_number?: number
          dismissed_at?: string | null
          id?: string
          nudge_key?: string
          shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journey_phase_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          override_phase: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          override_phase: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          override_phase?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      last_plan_progress: {
        Row: {
          beguenstigte: Json
          created_at: string
          dismissed_until: string | null
          id: string
          opted_in: boolean
          opted_in_at: string | null
          patientenverfuegung: Json
          testament: Json
          todesfall_dokumente: Json
          updated_at: string
          user_id: string
          vorsorgeauftrag: Json
        }
        Insert: {
          beguenstigte?: Json
          created_at?: string
          dismissed_until?: string | null
          id?: string
          opted_in?: boolean
          opted_in_at?: string | null
          patientenverfuegung?: Json
          testament?: Json
          todesfall_dokumente?: Json
          updated_at?: string
          user_id: string
          vorsorgeauftrag?: Json
        }
        Update: {
          beguenstigte?: Json
          created_at?: string
          dismissed_until?: string | null
          id?: string
          opted_in?: boolean
          opted_in_at?: string | null
          patientenverfuegung?: Json
          testament?: Json
          todesfall_dokumente?: Json
          updated_at?: string
          user_id?: string
          vorsorgeauftrag?: Json
        }
        Relationships: []
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
      life_film_archives: {
        Row: {
          created_at: string
          film_data: Json
          id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          film_data?: Json
          id?: string
          saved_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          film_data?: Json
          id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      life_film_data: {
        Row: {
          age: number | null
          completed: boolean
          created_at: string
          desired_children: string | null
          id: string
          life_goals: string[] | null
          monthly_expenses: number | null
          monthly_income: number | null
          target_retirement_age: number | null
          total_savings: number | null
          truth_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          completed?: boolean
          created_at?: string
          desired_children?: string | null
          id?: string
          life_goals?: string[] | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          target_retirement_age?: number | null
          total_savings?: number | null
          truth_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          completed?: boolean
          created_at?: string
          desired_children?: string | null
          id?: string
          life_goals?: string[] | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          target_retirement_age?: number | null
          total_savings?: number | null
          truth_mode?: string | null
          updated_at?: string
          user_id?: string
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
      meta_profile_history: {
        Row: {
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meta_profiles: {
        Row: {
          age: number | null
          created_at: string
          debts: number | null
          financial_goal: string | null
          fixed_costs: number | null
          freedom_life_expectancy: number | null
          freedom_target_age: number | null
          id: string
          last_confirmed_at: string | null
          monthly_income: number | null
          occupation: string | null
          professional_status: string | null
          risk_tolerance: number | null
          savings_rate: number | null
          tax_burden: number | null
          updated_at: string
          user_id: string
          wealth: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          debts?: number | null
          financial_goal?: string | null
          fixed_costs?: number | null
          freedom_life_expectancy?: number | null
          freedom_target_age?: number | null
          id?: string
          last_confirmed_at?: string | null
          monthly_income?: number | null
          occupation?: string | null
          professional_status?: string | null
          risk_tolerance?: number | null
          savings_rate?: number | null
          tax_burden?: number | null
          updated_at?: string
          user_id: string
          wealth?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          debts?: number | null
          financial_goal?: string | null
          fixed_costs?: number | null
          freedom_life_expectancy?: number | null
          freedom_target_age?: number | null
          id?: string
          last_confirmed_at?: string | null
          monthly_income?: number | null
          occupation?: string | null
          professional_status?: string | null
          risk_tolerance?: number | null
          savings_rate?: number | null
          tax_burden?: number | null
          updated_at?: string
          user_id?: string
          wealth?: number | null
        }
        Relationships: []
      }
      monthly_rituals: {
        Row: {
          allocation_data: Json | null
          created_at: string
          expenses: number | null
          id: string
          income: number | null
          month_key: string
          monthly_intention: string | null
          peak_score_change: number | null
          savings: number | null
          streak_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allocation_data?: Json | null
          created_at?: string
          expenses?: number | null
          id?: string
          income?: number | null
          month_key: string
          monthly_intention?: string | null
          peak_score_change?: number | null
          savings?: number | null
          streak_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allocation_data?: Json | null
          created_at?: string
          expenses?: number | null
          id?: string
          income?: number | null
          month_key?: string
          monthly_intention?: string | null
          peak_score_change?: number | null
          savings?: number | null
          streak_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          created_at: string
          id: string
          month_key: string
          summary_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_key: string
          summary_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_key?: string
          summary_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          created_at: string
          id: string
          mood: string
          note: string | null
          user_id: string
          week_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          note?: string | null
          user_id: string
          week_key: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      net_worth_assets: {
        Row: {
          category: string
          created_at: string
          expected_return: number | null
          id: string
          last_updated_date: string
          name: string
          ownership_tag: string
          platform_url: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          expected_return?: number | null
          id?: string
          last_updated_date?: string
          name: string
          ownership_tag?: string
          platform_url?: string | null
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          category?: string
          created_at?: string
          expected_return?: number | null
          id?: string
          last_updated_date?: string
          name?: string
          ownership_tag?: string
          platform_url?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      net_worth_liabilities: {
        Row: {
          amount: number
          category: string
          created_at: string
          end_date: string | null
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          name: string
          ownership_tag: string
          platform_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name: string
          ownership_tag?: string
          platform_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name?: string
          ownership_tag?: string
          platform_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      net_worth_snapshots: {
        Row: {
          created_at: string
          entry_id: string
          entry_type: string
          id: string
          snapshot_date: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          entry_id: string
          entry_type: string
          id?: string
          snapshot_date?: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          entry_id?: string
          entry_type?: string
          id?: string
          snapshot_date?: string
          user_id?: string
          value?: number
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
      partner_conflict_entries: {
        Row: {
          created_at: string
          how_i_feel: string | null
          id: string
          partnership_id: string
          revealed_at: string | null
          round: number
          user_id: string
          what_happened: string | null
          what_i_wish: string | null
        }
        Insert: {
          created_at?: string
          how_i_feel?: string | null
          id?: string
          partnership_id: string
          revealed_at?: string | null
          round?: number
          user_id: string
          what_happened?: string | null
          what_i_wish?: string | null
        }
        Update: {
          created_at?: string
          how_i_feel?: string | null
          id?: string
          partnership_id?: string
          revealed_at?: string | null
          round?: number
          user_id?: string
          what_happened?: string | null
          what_i_wish?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_conflict_entries_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_joint_goals: {
        Row: {
          category: string | null
          created_at: string
          current_amount: number
          id: string
          is_completed: boolean
          partnership_id: string
          target_amount: number | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          partnership_id: string
          target_amount?: number | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          partnership_id?: string
          target_amount?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_joint_goals_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          created_at: string
          dissolved_at: string | null
          id: string
          invite_email: string | null
          sharing_settings: Json
          started_at: string | null
          status: string
          updated_at: string
          user_id_1: string
          user_id_2: string | null
        }
        Insert: {
          created_at?: string
          dissolved_at?: string | null
          id?: string
          invite_email?: string | null
          sharing_settings?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id_1: string
          user_id_2?: string | null
        }
        Update: {
          created_at?: string
          dissolved_at?: string | null
          id?: string
          invite_email?: string | null
          sharing_settings?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id_1?: string
          user_id_2?: string | null
        }
        Relationships: []
      }
      peak_scores: {
        Row: {
          calculated_at: string
          id: string
          is_snapshot: boolean
          score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          id?: string
          is_snapshot?: boolean
          score?: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          id?: string
          is_snapshot?: boolean
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          auto_monthly_report: boolean
          challenges_allowed: boolean
          created_at: string
          current_rank: number
          deletion_requested_at: string | null
          first_name: string
          future_self_messages_enabled: boolean
          has_strategy_access: boolean
          id: string
          last_name: string
          leaderboard_visible: boolean
          mood_checkin_enabled: boolean
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          onboarding_current_step: number
          payday_date: number
          peak_score_visible: boolean
          phone: string | null
          plan: string
          referral_code: string | null
          shadow_twin_visible: boolean
          show_truth_moments: boolean
          streak_rescue_enabled: boolean
          theme_preference: string
          updated_at: string
          user_type: string
          voice_brief_enabled: boolean
          voice_weekly_enabled: boolean
          weekly_ritual_enabled: boolean
        }
        Insert: {
          account_status?: string
          auto_monthly_report?: boolean
          challenges_allowed?: boolean
          created_at?: string
          current_rank?: number
          deletion_requested_at?: string | null
          first_name: string
          future_self_messages_enabled?: boolean
          has_strategy_access?: boolean
          id: string
          last_name: string
          leaderboard_visible?: boolean
          mood_checkin_enabled?: boolean
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_current_step?: number
          payday_date?: number
          peak_score_visible?: boolean
          phone?: string | null
          plan?: string
          referral_code?: string | null
          shadow_twin_visible?: boolean
          show_truth_moments?: boolean
          streak_rescue_enabled?: boolean
          theme_preference?: string
          updated_at?: string
          user_type?: string
          voice_brief_enabled?: boolean
          voice_weekly_enabled?: boolean
          weekly_ritual_enabled?: boolean
        }
        Update: {
          account_status?: string
          auto_monthly_report?: boolean
          challenges_allowed?: boolean
          created_at?: string
          current_rank?: number
          deletion_requested_at?: string | null
          first_name?: string
          future_self_messages_enabled?: boolean
          has_strategy_access?: boolean
          id?: string
          last_name?: string
          leaderboard_visible?: boolean
          mood_checkin_enabled?: boolean
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_current_step?: number
          payday_date?: number
          peak_score_visible?: boolean
          phone?: string | null
          plan?: string
          referral_code?: string | null
          shadow_twin_visible?: boolean
          show_truth_moments?: boolean
          streak_rescue_enabled?: boolean
          theme_preference?: string
          updated_at?: string
          user_type?: string
          voice_brief_enabled?: boolean
          voice_weekly_enabled?: boolean
          weekly_ritual_enabled?: boolean
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
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
          status: string
          xp_awarded: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
          status?: string
          xp_awarded?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string
          xp_awarded?: boolean
        }
        Relationships: []
      }
      shadow_twin_snapshots: {
        Row: {
          aggregated_data: Json
          created_at: string
          demographic_key: string
          id: string
          sample_size: number
          twin_actions: Json
          updated_at: string
          week_key: string
        }
        Insert: {
          aggregated_data?: Json
          created_at?: string
          demographic_key: string
          id?: string
          sample_size?: number
          twin_actions?: Json
          updated_at?: string
          week_key: string
        }
        Update: {
          aggregated_data?: Json
          created_at?: string
          demographic_key?: string
          id?: string
          sample_size?: number
          twin_actions?: Json
          updated_at?: string
          week_key?: string
        }
        Relationships: []
      }
      smart_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link_label: string | null
          link_url: string | null
          notification_type: string
          ref_key: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link_label?: string | null
          link_url?: string | null
          notification_type: string
          ref_key: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link_label?: string | null
          link_url?: string | null
          notification_type?: string
          ref_key?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      snapshot_drafts: {
        Row: {
          created_at: string
          current_step: number
          draft_data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          draft_data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          draft_data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streak_rescues: {
        Row: {
          created_at: string
          id: string
          rescue_type: string
          rescued_at: string
          rescued_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rescue_type?: string
          rescued_at?: string
          rescued_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rescue_type?: string
          rescued_at?: string
          rescued_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          actions_taken: Json
          created_at: string
          end_result: Json
          goals: string | null
          id: string
          is_active: boolean
          motivation_count: number
          peakscore_journey: Json | null
          persona_age: number | null
          persona_context: string | null
          persona_name: string
          published_at: string | null
          quote: string | null
          start_situation: Json
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actions_taken?: Json
          created_at?: string
          end_result?: Json
          goals?: string | null
          id?: string
          is_active?: boolean
          motivation_count?: number
          peakscore_journey?: Json | null
          persona_age?: number | null
          persona_context?: string | null
          persona_name: string
          published_at?: string | null
          quote?: string | null
          start_situation?: Json
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actions_taken?: Json
          created_at?: string
          end_result?: Json
          goals?: string | null
          id?: string
          is_active?: boolean
          motivation_count?: number
          peakscore_journey?: Json | null
          persona_age?: number | null
          persona_context?: string | null
          persona_name?: string
          published_at?: string | null
          quote?: string | null
          start_situation?: Json
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      tool_snapshots: {
        Row: {
          created_at: string
          id: string
          peak_score_effect: number | null
          snapshot_data: Json
          tool_name: string
          tool_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          peak_score_effect?: number | null
          snapshot_data?: Json
          tool_name: string
          tool_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          peak_score_effect?: number | null
          snapshot_data?: Json
          tool_name?: string
          tool_slug?: string
          user_id?: string
        }
        Relationships: []
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
          unlock_phase: number | null
          updated_at: string
          visibility: Database["public"]["Enums"]["tool_visibility"]
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
          unlock_phase?: number | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["tool_visibility"]
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
          unlock_phase?: number | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["tool_visibility"]
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          content_key: string | null
          created_at: string
          duration_seconds: number | null
          event_name: string | null
          event_type: string
          id: string
          metadata: Json | null
          module_key: string | null
          page_path: string | null
          page_title: string | null
          session_id: string | null
          tool_key: string | null
          user_id: string | null
        }
        Insert: {
          content_key?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_name?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          module_key?: string | null
          page_path?: string | null
          page_title?: string | null
          session_id?: string | null
          tool_key?: string | null
          user_id?: string | null
        }
        Update: {
          content_key?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_name?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          module_key?: string | null
          page_path?: string | null
          page_title?: string | null
          session_id?: string | null
          tool_key?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tracking_sessions: {
        Row: {
          ended_at: string | null
          id: string
          last_activity_at: string
          metadata: Json | null
          started_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id: string
          last_activity_at?: string
          metadata?: Json | null
          started_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          metadata?: Json | null
          started_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      truth_moments: {
        Row: {
          content: string
          created_at: string
          display_location: string
          emoji: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
          trigger_condition: string
          trigger_config: Json | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_location?: string
          emoji?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          trigger_condition?: string
          trigger_config?: Json | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_location?: string
          emoji?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          trigger_condition?: string
          trigger_config?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      truth_moments_shown: {
        Row: {
          id: string
          moment_id: string
          shown_at: string
          user_id: string
        }
        Insert: {
          id?: string
          moment_id: string
          shown_at?: string
          user_id: string
        }
        Update: {
          id?: string
          moment_id?: string
          shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_avatars: {
        Row: {
          avatar_completed: boolean
          created_at: string
          current_avatar_data: Json | null
          future_self_age: number | null
          future_self_defining_moment: string | null
          future_self_name: string | null
          future_self_name_category: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_completed?: boolean
          created_at?: string
          current_avatar_data?: Json | null
          future_self_age?: number | null
          future_self_defining_moment?: string | null
          future_self_name?: string | null
          future_self_name_category?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_completed?: boolean
          created_at?: string
          current_avatar_data?: Json | null
          future_self_age?: number | null
          future_self_defining_moment?: string | null
          future_self_name?: string | null
          future_self_name_category?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
      user_insights: {
        Row: {
          content: string
          created_at: string
          id: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey: {
        Row: {
          created_at: string
          current_phase: number
          id: string
          last_checked_at: string
          milestones_completed: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: number
          id?: string
          last_checked_at?: string
          milestones_completed?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: number
          id?: string
          last_checked_at?: string
          milestones_completed?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_manifest_acceptance: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
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
      user_scoring: {
        Row: {
          created_at: string
          id: string
          is_manual_override: boolean
          labels: string[]
          last_computed_at: string | null
          score: number
          score_breakdown: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_manual_override?: boolean
          labels?: string[]
          last_computed_at?: string | null
          score?: number
          score_breakdown?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_manual_override?: boolean
          labels?: string[]
          last_computed_at?: string | null
          score?: number
          score_breakdown?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_scripts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          script_type: string
          sort_order: number
          template: string
          title: string
          trigger_condition: string | null
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          script_type: string
          sort_order?: number
          template: string
          title: string
          trigger_condition?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          script_type?: string
          sort_order?: number
          template?: string
          title?: string
          trigger_condition?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      weekly_audio_reflections: {
        Row: {
          created_at: string
          id: string
          listened: boolean
          listened_at: string | null
          user_id: string
          week_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          listened?: boolean
          listened_at?: string | null
          user_id: string
          week_key: string
        }
        Update: {
          created_at?: string
          id?: string
          listened?: boolean
          listened_at?: string | null
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          bonus_claimed: boolean
          challenges: Json
          completed_at: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          bonus_claimed?: boolean
          challenges?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          bonus_claimed?: boolean
          challenges?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      weekly_reflections: {
        Row: {
          created_at: string
          focus_next_week: string | null
          id: string
          peak_score_change: number | null
          tasks_completed: number | null
          user_id: string
          week_key: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          focus_next_week?: string | null
          id?: string
          peak_score_change?: number | null
          tasks_completed?: number | null
          user_id: string
          week_key: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          focus_next_week?: string | null
          id?: string
          peak_score_change?: number | null
          tasks_completed?: number | null
          user_id?: string
          week_key?: string
          xp_earned?: number | null
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
      has_strategy_access: { Args: { _user_id: string }; Returns: boolean }
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
      tool_visibility: "public" | "phase_locked" | "hidden" | "admin_only"
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
      tool_visibility: ["public", "phase_locked", "hidden", "admin_only"],
    },
  },
} as const
