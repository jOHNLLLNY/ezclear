/**
 * Authentication Context for React Native
 * Based on the original web app auth context
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Debug logging
console.log('🔍 AuthContext: Starting import...');

// Use the React Native-configured Supabase client (with Expo SecureStore persistence)
let supabase: any;
try {
  console.log('🔍 AuthContext: Importing supabase...');
  const supabaseModule = require('../lib/supabase');
  console.log('🔍 AuthContext: supabaseModule =', supabaseModule);
  supabase = supabaseModule.supabase;
  console.log('🔍 AuthContext: supabase =', supabase);
} catch (error) {
  console.error('🔴 AuthContext: Error importing supabase:', error);
}

// Types
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  user_type: 'worker' | 'hirer';
  location?: string;
  created_at: string;
  is_online: boolean;
  avatar_url?: string;
  phone_number?: string;
  phone_verified?: boolean;
}

type UserType = 'worker' | 'hirer';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userType: UserType) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Supabase client is imported from '../lib/supabase' which already reads env vars
// and configures Expo SecureStore for proper session persistence on React Native.

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const markReady = () => { if (isMounted) setLoading(false); };

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          // Load profile in background; do not block initial render
          loadUserProfile(data.session.user.id).finally(markReady);
        } else {
          markReady();
        }
      } catch (e) {
        console.error('Auth init error:', e);
        markReady();
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id).finally(markReady);
      } else {
        setProfile(null);
        markReady();
      }
    });

    // Failsafe: ensure we never stick in loading forever
    const timeoutId = setTimeout(markReady, 6000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userType: UserType) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type: userType, full_name: email.split('@')[0] },
        },
      });

      if (error) throw error;
      // Save preferred_language from device/storage if exists
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const lang = await AsyncStorage.getItem('lang');
        if (lang && data.user) {
          await supabase.from('profiles').update({ preferred_language: lang }).eq('id', data.user.id);
        }
      } catch {}
      // Profile рядок створить ваш тригер handle_new_user(); додатково профіль оновиться при onAuthStateChange
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);

        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        } else {
          throw new Error(error.message || 'Sign in failed. Please try again.');
        }
      }

      // Update online status + ensure preferred_language saved if exists in storage
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ is_online: true })
          .eq('id', data.user.id);
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const lang = await AsyncStorage.getItem('lang');
          if (lang) {
            await supabase.from('profiles').update({ preferred_language: lang }).eq('id', data.user.id);
          }
        } catch {}
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update offline status
      if (user) {
        await supabase
          .from('profiles')
          .update({ is_online: false })
          .eq('id', user.id);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
