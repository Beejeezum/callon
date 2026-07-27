export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ask_needs: {
        Row: {
          ask_id: string;
          category_id: string | null;
          circle_id: string;
          created_at: string;
          description: string;
          id: string;
          kind: Database["public"]["Enums"]["need_kind"];
          quantity_committed: number;
          quantity_completed: number;
          quantity_requested: number;
          risk_level: Database["public"]["Enums"]["risk_level"];
          sort_order: number;
          status: Database["public"]["Enums"]["need_status"];
          title: string;
          unit: string | null;
          updated_at: string;
          version: number;
        };
        Insert: {
          ask_id: string;
          category_id?: string | null;
          circle_id: string;
          created_at?: string;
          description?: string;
          id?: string;
          kind: Database["public"]["Enums"]["need_kind"];
          quantity_committed?: number;
          quantity_completed?: number;
          quantity_requested?: number;
          risk_level?: Database["public"]["Enums"]["risk_level"];
          sort_order?: number;
          status?: Database["public"]["Enums"]["need_status"];
          title: string;
          unit?: string | null;
          updated_at?: string;
          version?: number;
        };
        Update: {
          ask_id?: string;
          category_id?: string | null;
          circle_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["need_kind"];
          quantity_committed?: number;
          quantity_completed?: number;
          quantity_requested?: number;
          risk_level?: Database["public"]["Enums"]["risk_level"];
          sort_order?: number;
          status?: Database["public"]["Enums"]["need_status"];
          title?: string;
          unit?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ask_needs_ask_circle_fk";
            columns: ["ask_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "ask_needs_ask_id_fkey";
            columns: ["ask_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ask_needs_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ask_needs_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
        ];
      };
      asks: {
        Row: {
          archived_at: string | null;
          ask_type: Database["public"]["Enums"]["ask_type"];
          circle_id: string;
          completed_at: string | null;
          cover_image_path: string | null;
          created_at: string;
          created_by: string;
          description: string;
          expires_at: string;
          general_location: string;
          id: string;
          needed_by: string;
          published_at: string | null;
          share_version: number;
          starts_at: string | null;
          status: Database["public"]["Enums"]["ask_status"];
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          ask_type?: Database["public"]["Enums"]["ask_type"];
          circle_id: string;
          completed_at?: string | null;
          cover_image_path?: string | null;
          created_at?: string;
          created_by: string;
          description?: string;
          expires_at: string;
          general_location: string;
          id?: string;
          needed_by: string;
          published_at?: string | null;
          share_version?: number;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["ask_status"];
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          ask_type?: Database["public"]["Enums"]["ask_type"];
          circle_id?: string;
          completed_at?: string | null;
          cover_image_path?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string;
          expires_at?: string;
          general_location?: string;
          id?: string;
          needed_by?: string;
          published_at?: string | null;
          share_version?: number;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["ask_status"];
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "asks_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          default_risk_level: Database["public"]["Enums"]["risk_level"];
          id: string;
          is_active: boolean;
          label: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          default_risk_level?: Database["public"]["Enums"]["risk_level"];
          id?: string;
          is_active?: boolean;
          label: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          default_risk_level?: Database["public"]["Enums"]["risk_level"];
          id?: string;
          is_active?: boolean;
          label?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      circle_invites: {
        Row: {
          circle_id: string;
          created_at: string;
          created_by: string;
          expires_at: string;
          id: string;
          max_uses: number;
          role: Database["public"]["Enums"]["membership_role"];
          status: Database["public"]["Enums"]["invite_status"];
          updated_at: string;
          use_count: number;
          version: number;
        };
        Insert: {
          circle_id: string;
          created_at?: string;
          created_by: string;
          expires_at: string;
          id?: string;
          max_uses?: number;
          role?: Database["public"]["Enums"]["membership_role"];
          status?: Database["public"]["Enums"]["invite_status"];
          updated_at?: string;
          use_count?: number;
          version?: number;
        };
        Update: {
          circle_id?: string;
          created_at?: string;
          created_by?: string;
          expires_at?: string;
          id?: string;
          max_uses?: number;
          role?: Database["public"]["Enums"]["membership_role"];
          status?: Database["public"]["Enums"]["invite_status"];
          updated_at?: string;
          use_count?: number;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "circle_invites_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "circle_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      circle_memberships: {
        Row: {
          circle_id: string;
          created_at: string;
          id: string;
          joined_at: string | null;
          neighbor_context: string | null;
          profile_id: string;
          restricted_at: string | null;
          role: Database["public"]["Enums"]["membership_role"];
          status: Database["public"]["Enums"]["membership_status"];
          suspended_at: string | null;
          updated_at: string;
          version: number;
        };
        Insert: {
          circle_id: string;
          created_at?: string;
          id?: string;
          joined_at?: string | null;
          neighbor_context?: string | null;
          profile_id: string;
          restricted_at?: string | null;
          role?: Database["public"]["Enums"]["membership_role"];
          status?: Database["public"]["Enums"]["membership_status"];
          suspended_at?: string | null;
          updated_at?: string;
          version?: number;
        };
        Update: {
          circle_id?: string;
          created_at?: string;
          id?: string;
          joined_at?: string | null;
          neighbor_context?: string | null;
          profile_id?: string;
          restricted_at?: string | null;
          role?: Database["public"]["Enums"]["membership_role"];
          status?: Database["public"]["Enums"]["membership_status"];
          suspended_at?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "circle_memberships_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "circle_memberships_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      circles: {
        Row: {
          created_at: string;
          created_by: string;
          current_terms_version: string;
          description: string;
          general_area: string;
          id: string;
          join_policy: string;
          name: string;
          settings: Json;
          slug: string;
          status: Database["public"]["Enums"]["circle_status"];
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          current_terms_version?: string;
          description?: string;
          general_area: string;
          id?: string;
          join_policy?: string;
          name: string;
          settings?: Json;
          slug: string;
          status?: Database["public"]["Enums"]["circle_status"];
          updated_at?: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          current_terms_version?: string;
          description?: string;
          general_area?: string;
          id?: string;
          join_policy?: string;
          name?: string;
          settings?: Json;
          slug?: string;
          status?: Database["public"]["Enums"]["circle_status"];
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "circles_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      commitments: {
        Row: {
          accepted_at: string;
          ask_id: string;
          cancelled_at: string | null;
          circle_id: string;
          contribution_type: Database["public"]["Enums"]["need_kind"];
          contributor_profile_id: string;
          conversation_id: string;
          created_at: string;
          due_at: string | null;
          exact_location_id: string | null;
          fulfilled_at: string | null;
          id: string;
          need_id: string;
          offer_id: string;
          quantity: number;
          requester_profile_id: string;
          resource_id: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["commitment_status"];
          summary_snapshot: Json;
          terms_version: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          accepted_at?: string;
          ask_id: string;
          cancelled_at?: string | null;
          circle_id: string;
          contribution_type: Database["public"]["Enums"]["need_kind"];
          contributor_profile_id: string;
          conversation_id: string;
          created_at?: string;
          due_at?: string | null;
          exact_location_id?: string | null;
          fulfilled_at?: string | null;
          id?: string;
          need_id: string;
          offer_id: string;
          quantity: number;
          requester_profile_id: string;
          resource_id?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["commitment_status"];
          summary_snapshot: Json;
          terms_version: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          accepted_at?: string;
          ask_id?: string;
          cancelled_at?: string | null;
          circle_id?: string;
          contribution_type?: Database["public"]["Enums"]["need_kind"];
          contributor_profile_id?: string;
          conversation_id?: string;
          created_at?: string;
          due_at?: string | null;
          exact_location_id?: string | null;
          fulfilled_at?: string | null;
          id?: string;
          need_id?: string;
          offer_id?: string;
          quantity?: number;
          requester_profile_id?: string;
          resource_id?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["commitment_status"];
          summary_snapshot?: Json;
          terms_version?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "commitments_ask_circle_fk";
            columns: ["ask_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "commitments_ask_id_fkey";
            columns: ["ask_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_contributor_profile_id_fkey";
            columns: ["contributor_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_conversation_circle_fk";
            columns: ["conversation_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "commitments_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: true;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_need_circle_fk";
            columns: ["need_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "ask_needs";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "commitments_need_id_fkey";
            columns: ["need_id"];
            isOneToOne: false;
            referencedRelation: "ask_needs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_offer_circle_fk";
            columns: ["offer_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "commitments_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: true;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_requester_profile_id_fkey";
            columns: ["requester_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commitments_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          created_at: string;
          participant_role: string;
          profile_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          participant_role: string;
          profile_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          participant_role?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          circle_id: string;
          created_at: string;
          id: string;
          status: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          circle_id: string;
          created_at?: string;
          id?: string;
          status?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          circle_id?: string;
          created_at?: string;
          id?: string;
          status?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
        ];
      };
      incidents: {
        Row: {
          ask_id: string | null;
          circle_id: string;
          commitment_id: string | null;
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["incident_kind"];
          loan_id: string | null;
          reported_by: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["incident_status"];
          subject_profile_id: string | null;
          summary: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          ask_id?: string | null;
          circle_id: string;
          commitment_id?: string | null;
          created_at?: string;
          id?: string;
          kind: Database["public"]["Enums"]["incident_kind"];
          loan_id?: string | null;
          reported_by: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["incident_status"];
          subject_profile_id?: string | null;
          summary: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          ask_id?: string | null;
          circle_id?: string;
          commitment_id?: string | null;
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["incident_kind"];
          loan_id?: string | null;
          reported_by?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["incident_status"];
          subject_profile_id?: string | null;
          summary?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "incidents_ask_id_fkey";
            columns: ["ask_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_commitment_id_fkey";
            columns: ["commitment_id"];
            isOneToOne: false;
            referencedRelation: "commitments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_subject_profile_id_fkey";
            columns: ["subject_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loan_events: {
        Row: {
          actor_profile_id: string | null;
          circle_id: string;
          created_at: string;
          event_type: string;
          id: string;
          loan_id: string;
          metadata: Json;
        };
        Insert: {
          actor_profile_id?: string | null;
          circle_id: string;
          created_at?: string;
          event_type: string;
          id?: string;
          loan_id: string;
          metadata?: Json;
        };
        Update: {
          actor_profile_id?: string | null;
          circle_id?: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          loan_id?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "loan_events_actor_profile_id_fkey";
            columns: ["actor_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loan_events_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loan_events_loan_circle_fk";
            columns: ["loan_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "loan_events_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
      loans: {
        Row: {
          borrower_profile_id: string;
          checked_out_at: string | null;
          circle_id: string;
          commitment_id: string;
          created_at: string;
          due_at: string | null;
          extension_requested_at: string | null;
          id: string;
          lender_profile_id: string;
          proposed_due_at: string | null;
          resource_id: string | null;
          return_marked_at: string | null;
          returned_at: string | null;
          status: Database["public"]["Enums"]["loan_status"];
          updated_at: string;
          version: number;
        };
        Insert: {
          borrower_profile_id: string;
          checked_out_at?: string | null;
          circle_id: string;
          commitment_id: string;
          created_at?: string;
          due_at?: string | null;
          extension_requested_at?: string | null;
          id?: string;
          lender_profile_id: string;
          proposed_due_at?: string | null;
          resource_id?: string | null;
          return_marked_at?: string | null;
          returned_at?: string | null;
          status?: Database["public"]["Enums"]["loan_status"];
          updated_at?: string;
          version?: number;
        };
        Update: {
          borrower_profile_id?: string;
          checked_out_at?: string | null;
          circle_id?: string;
          commitment_id?: string;
          created_at?: string;
          due_at?: string | null;
          extension_requested_at?: string | null;
          id?: string;
          lender_profile_id?: string;
          proposed_due_at?: string | null;
          resource_id?: string | null;
          return_marked_at?: string | null;
          returned_at?: string | null;
          status?: Database["public"]["Enums"]["loan_status"];
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "loans_borrower_profile_id_fkey";
            columns: ["borrower_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_commitment_circle_fk";
            columns: ["commitment_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "commitments";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "loans_commitment_id_fkey";
            columns: ["commitment_id"];
            isOneToOne: true;
            referencedRelation: "commitments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_lender_profile_id_fkey";
            columns: ["lender_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          attachment_path: string | null;
          body: string;
          circle_id: string;
          conversation_id: string;
          deleted_at: string | null;
          edited_at: string | null;
          id: string;
          sender_profile_id: string;
          sent_at: string;
        };
        Insert: {
          attachment_path?: string | null;
          body: string;
          circle_id: string;
          conversation_id: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          sender_profile_id: string;
          sent_at?: string;
        };
        Update: {
          attachment_path?: string | null;
          body?: string;
          circle_id?: string;
          conversation_id?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          id?: string;
          sender_profile_id?: string;
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_conversation_circle_fk";
            columns: ["conversation_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey";
            columns: ["sender_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_preferences: {
        Row: {
          email_enabled: boolean;
          profile_id: string;
          push_enabled: boolean;
          quiet_hours_end: string | null;
          quiet_hours_start: string | null;
          sms_enabled: boolean;
          timezone: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          email_enabled?: boolean;
          profile_id: string;
          push_enabled?: boolean;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          sms_enabled?: boolean;
          timezone?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          email_enabled?: boolean;
          profile_id?: string;
          push_enabled?: boolean;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          sms_enabled?: boolean;
          timezone?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      offers: {
        Row: {
          ask_id: string;
          available_from: string | null;
          available_until: string | null;
          circle_id: string;
          conditions: string | null;
          contributor_profile_id: string;
          created_at: string;
          decided_at: string | null;
          description: string;
          freeform_item_name: string | null;
          id: string;
          image_path: string | null;
          need_id: string;
          offer_type: Database["public"]["Enums"]["need_kind"];
          quantity: number;
          resource_id: string | null;
          status: Database["public"]["Enums"]["offer_status"];
          submitted_at: string;
          updated_at: string;
          version: number;
          withdrawn_at: string | null;
        };
        Insert: {
          ask_id: string;
          available_from?: string | null;
          available_until?: string | null;
          circle_id: string;
          conditions?: string | null;
          contributor_profile_id: string;
          created_at?: string;
          decided_at?: string | null;
          description: string;
          freeform_item_name?: string | null;
          id?: string;
          image_path?: string | null;
          need_id: string;
          offer_type: Database["public"]["Enums"]["need_kind"];
          quantity?: number;
          resource_id?: string | null;
          status?: Database["public"]["Enums"]["offer_status"];
          submitted_at?: string;
          updated_at?: string;
          version?: number;
          withdrawn_at?: string | null;
        };
        Update: {
          ask_id?: string;
          available_from?: string | null;
          available_until?: string | null;
          circle_id?: string;
          conditions?: string | null;
          contributor_profile_id?: string;
          created_at?: string;
          decided_at?: string | null;
          description?: string;
          freeform_item_name?: string | null;
          id?: string;
          image_path?: string | null;
          need_id?: string;
          offer_type?: Database["public"]["Enums"]["need_kind"];
          quantity?: number;
          resource_id?: string | null;
          status?: Database["public"]["Enums"]["offer_status"];
          submitted_at?: string;
          updated_at?: string;
          version?: number;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "offers_ask_circle_fk";
            columns: ["ask_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "offers_ask_id_fkey";
            columns: ["ask_id"];
            isOneToOne: false;
            referencedRelation: "asks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_contributor_profile_id_fkey";
            columns: ["contributor_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_need_circle_fk";
            columns: ["need_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "ask_needs";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "offers_need_id_fkey";
            columns: ["need_id"];
            isOneToOne: false;
            referencedRelation: "ask_needs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          display_name: string;
          id: string;
          locale: string;
          status: Database["public"]["Enums"]["profile_status"];
          timezone: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          locale?: string;
          status?: Database["public"]["Enums"]["profile_status"];
          timezone?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          locale?: string;
          status?: Database["public"]["Enums"]["profile_status"];
          timezone?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      resource_components: {
        Row: {
          circle_id: string;
          created_at: string;
          id: string;
          name: string;
          quantity: number;
          required_for_return: boolean;
          resource_id: string;
        };
        Insert: {
          circle_id: string;
          created_at?: string;
          id?: string;
          name: string;
          quantity?: number;
          required_for_return?: boolean;
          resource_id: string;
        };
        Update: {
          circle_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          quantity?: number;
          required_for_return?: boolean;
          resource_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_components_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_components_resource_circle_fk";
            columns: ["resource_id", "circle_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id", "circle_id"];
          },
          {
            foreignKeyName: "resource_components_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_hints: {
        Row: {
          category_id: string;
          circle_id: string;
          created_at: string;
          id: string;
          last_confirmed_at: string | null;
          profile_id: string;
          source: string;
          updated_at: string;
          version: number;
          visibility: Database["public"]["Enums"]["resource_visibility"];
          willingness: Database["public"]["Enums"]["resource_willingness"];
        };
        Insert: {
          category_id: string;
          circle_id: string;
          created_at?: string;
          id?: string;
          last_confirmed_at?: string | null;
          profile_id: string;
          source: string;
          updated_at?: string;
          version?: number;
          visibility?: Database["public"]["Enums"]["resource_visibility"];
          willingness?: Database["public"]["Enums"]["resource_willingness"];
        };
        Update: {
          category_id?: string;
          circle_id?: string;
          created_at?: string;
          id?: string;
          last_confirmed_at?: string | null;
          profile_id?: string;
          source?: string;
          updated_at?: string;
          version?: number;
          visibility?: Database["public"]["Enums"]["resource_visibility"];
          willingness?: Database["public"]["Enums"]["resource_willingness"];
        };
        Relationships: [
          {
            foreignKeyName: "resource_hints_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_hints_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_hints_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          category_id: string | null;
          circle_id: string;
          created_at: string;
          description: string;
          id: string;
          image_path: string | null;
          last_confirmed_at: string | null;
          owner_profile_id: string;
          source_loan_id: string | null;
          source_offer_id: string | null;
          status: Database["public"]["Enums"]["resource_status"];
          title: string;
          updated_at: string;
          usual_terms: string | null;
          version: number;
          visibility: Database["public"]["Enums"]["resource_visibility"];
          willingness: Database["public"]["Enums"]["resource_willingness"];
        };
        Insert: {
          category_id?: string | null;
          circle_id: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_path?: string | null;
          last_confirmed_at?: string | null;
          owner_profile_id: string;
          source_loan_id?: string | null;
          source_offer_id?: string | null;
          status?: Database["public"]["Enums"]["resource_status"];
          title: string;
          updated_at?: string;
          usual_terms?: string | null;
          version?: number;
          visibility?: Database["public"]["Enums"]["resource_visibility"];
          willingness?: Database["public"]["Enums"]["resource_willingness"];
        };
        Update: {
          category_id?: string | null;
          circle_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_path?: string | null;
          last_confirmed_at?: string | null;
          owner_profile_id?: string;
          source_loan_id?: string | null;
          source_offer_id?: string | null;
          status?: Database["public"]["Enums"]["resource_status"];
          title?: string;
          updated_at?: string;
          usual_terms?: string | null;
          version?: number;
          visibility?: Database["public"]["Enums"]["resource_visibility"];
          willingness?: Database["public"]["Enums"]["resource_willingness"];
        };
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_source_loan_fk";
            columns: ["source_loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_source_offer_fk";
            columns: ["source_offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_offer: { Args: { p_input: Json }; Returns: string };
      can_moderate_circle: {
        Args: { p_circle_id: string; p_profile_id?: string };
        Returns: boolean;
      };
      can_read_circle: {
        Args: { p_circle_id: string; p_profile_id?: string };
        Returns: boolean;
      };
      can_submit_offer_on_ask: {
        Args: { p_ask_id: string; p_circle_id: string; p_profile_id?: string };
        Returns: boolean;
      };
      can_view_profile: {
        Args: { p_target_profile_id: string; p_viewer_profile_id?: string };
        Returns: boolean;
      };
      create_ask: { Args: { p_input: Json }; Returns: string };
      is_active_circle_member: {
        Args: { p_circle_id: string; p_profile_id?: string };
        Returns: boolean;
      };
      is_circle_contributor: {
        Args: { p_circle_id: string; p_profile_id?: string };
        Returns: boolean;
      };
      is_conversation_participant: {
        Args: { p_conversation_id: string; p_profile_id?: string };
        Returns: boolean;
      };
      publish_ask: {
        Args: { p_ask_id: string; p_idempotency_key: string };
        Returns: string;
      };
      submit_offer: { Args: { p_input: Json }; Returns: string };
      transition_loan: { Args: { p_input: Json }; Returns: string };
    };
    Enums: {
      ask_status:
        | "draft"
        | "open"
        | "partially_fulfilled"
        | "ready"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "expired"
        | "archived";
      ask_type: "quick_need" | "project" | "event" | "offer";
      circle_status: "draft" | "active" | "paused" | "archived";
      commitment_status:
        | "accepted"
        | "coordinating"
        | "ready_for_handoff"
        | "active"
        | "fulfilled"
        | "cancelled"
        | "disputed";
      incident_kind:
        | "late_return"
        | "missing_component"
        | "damage"
        | "unsafe_item"
        | "harassment"
        | "privacy"
        | "prohibited_content"
        | "other";
      incident_status:
        "open" | "awaiting_response" | "under_review" | "resolved" | "closed";
      invite_status: "active" | "revoked" | "expired" | "exhausted";
      loan_status:
        | "pending_handoff"
        | "checked_out"
        | "extension_requested"
        | "return_marked"
        | "returned"
        | "overdue"
        | "disputed"
        | "cancelled";
      membership_role: "member" | "moderator" | "circle_admin";
      membership_status:
        "invited" | "pending" | "active" | "restricted" | "suspended" | "left";
      need_kind:
        "lend" | "give" | "help" | "advice" | "recommendation" | "alternative";
      need_status:
        "open" | "partially_covered" | "covered" | "completed" | "cancelled";
      offer_status:
        | "draft"
        | "submitted"
        | "accepted"
        | "declined"
        | "withdrawn"
        | "expired";
      profile_status: "active" | "restricted" | "suspended" | "deleted";
      resource_status: "active" | "paused" | "retired";
      resource_visibility: "private" | "match_only" | "circle";
      resource_willingness:
        "happy_to_be_asked" | "community_projects_only" | "weekends" | "paused";
      risk_level: "low" | "moderate" | "restricted" | "prohibited";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      ask_status: [
        "draft",
        "open",
        "partially_fulfilled",
        "ready",
        "in_progress",
        "completed",
        "cancelled",
        "expired",
        "archived",
      ],
      ask_type: ["quick_need", "project", "event", "offer"],
      circle_status: ["draft", "active", "paused", "archived"],
      commitment_status: [
        "accepted",
        "coordinating",
        "ready_for_handoff",
        "active",
        "fulfilled",
        "cancelled",
        "disputed",
      ],
      incident_kind: [
        "late_return",
        "missing_component",
        "damage",
        "unsafe_item",
        "harassment",
        "privacy",
        "prohibited_content",
        "other",
      ],
      incident_status: [
        "open",
        "awaiting_response",
        "under_review",
        "resolved",
        "closed",
      ],
      invite_status: ["active", "revoked", "expired", "exhausted"],
      loan_status: [
        "pending_handoff",
        "checked_out",
        "extension_requested",
        "return_marked",
        "returned",
        "overdue",
        "disputed",
        "cancelled",
      ],
      membership_role: ["member", "moderator", "circle_admin"],
      membership_status: [
        "invited",
        "pending",
        "active",
        "restricted",
        "suspended",
        "left",
      ],
      need_kind: [
        "lend",
        "give",
        "help",
        "advice",
        "recommendation",
        "alternative",
      ],
      need_status: [
        "open",
        "partially_covered",
        "covered",
        "completed",
        "cancelled",
      ],
      offer_status: [
        "draft",
        "submitted",
        "accepted",
        "declined",
        "withdrawn",
        "expired",
      ],
      profile_status: ["active", "restricted", "suspended", "deleted"],
      resource_status: ["active", "paused", "retired"],
      resource_visibility: ["private", "match_only", "circle"],
      resource_willingness: [
        "happy_to_be_asked",
        "community_projects_only",
        "weekends",
        "paused",
      ],
      risk_level: ["low", "moderate", "restricted", "prohibited"],
    },
  },
} as const;
