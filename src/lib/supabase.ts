/**
 * Supabase Client Configuration - React Native
 * Configured for React Native environment with proper auth persistence
 */


import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with React Native configuration (AsyncStorage persistence)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('AUTH_REQUIRED');
}

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  getCurrentSession: () => {
    return supabase.auth.getSession();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helper functions
export const db = {
  // Jobs
  getJobs: async (filters?: any) => {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      // Prefer new column service_slug; fall back to legacy service_type
      query = query.eq('service_slug', filters.category);
    }

    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getJobById: async (id: string) => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createJob: async (jobData: any) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Messages
  getConversations: async (userId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          content,
          created_at,
          sender_id
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  sendMessage: async (conversationId: string, senderId: string, content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Real-time subscriptions
  subscribeToMessages: (conversationId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToJobs: (callback: (payload: any) => void) => {
    return supabase
      .channel('jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        callback
      )
      .subscribe();
  },
};

export default supabase;
