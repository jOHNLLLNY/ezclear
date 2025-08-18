/**
 * Database Types - Supabase Generated Types
 * TypeScript definitions for database schema
 */

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string;
          // Legacy fields
          location?: string;
          service_type?: string;
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          updated_at?: string;
          user_id?: string;
          contractor_id?: string;
          images?: string[];
          requirements?: string[];
          deadline?: string;
          // New fields
          city?: string | null;
          address?: string | null;
          postal_code?: string | null;
          budget?: number | null;
          service_group?: string | null;
          service_slug?: string | null;
          poster_id?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          // Legacy
          location?: string;
          service_type?: string;
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          updated_at?: string;
          user_id?: string;
          contractor_id?: string;
          images?: string[];
          requirements?: string[];
          deadline?: string;
          // New
          city?: string | null;
          address?: string | null;
          postal_code?: string | null;
          budget?: number | null;
          service_group?: string | null;
          service_slug?: string | null;
          poster_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          // Legacy
          location?: string;
          service_type?: string;
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          updated_at?: string;
          user_id?: string;
          contractor_id?: string;
          images?: string[];
          requirements?: string[];
          deadline?: string;
          // New
          city?: string | null;
          address?: string | null;
          postal_code?: string | null;
          budget?: number | null;
          service_group?: string | null;
          service_slug?: string | null;
          poster_id?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          user_type: 'worker' | 'hirer';
          phone?: string;
          location?: string;
          bio?: string;
          skills?: string[];
          rating?: number;
          reviews_count?: number;
          jobs_completed?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          user_type: 'worker' | 'hirer';
          phone?: string;
          location?: string;
          bio?: string;
          skills?: string[];
          rating?: number;
          reviews_count?: number;
          jobs_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          user_type?: 'worker' | 'hirer';
          phone?: string;
          location?: string;
          bio?: string;
          skills?: string[];
          rating?: number;
          reviews_count?: number;
          jobs_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          job_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          job_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          job_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          read_at?: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
          read_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
          read_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
