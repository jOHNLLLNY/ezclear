/**
 * Authentication Context for React Native
 * Based on the original web app auth context
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Types
interface UserProfile {
  id: string;
  email: string;
  name: string;
  user_type: 'worker' | 'hirer';
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

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
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
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: email.split('@')[0],
            user_type: userType,
            is_online: true,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
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
        email,
        password,
      });

      if (error) throw error;

      // Update online status
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ is_online: true })
          .eq('id', data.user.id);
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // For development - automatically use mock user
      if (__DEV__) {
        console.log('Development mode: Using mock user');
        
        const mockUser = {
          id: 'mock-user-123',
          email: 'demo@ezclear.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;

        const mockProfile = {
          id: 'mock-user-123',
          email: 'demo@ezclear.com',
          name: 'Demo User',
          user_type: 'hirer' as UserType,
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile;

        setUser(mockUser);
        setProfile(mockProfile);
        setLoading(false);
        return;
      }

      // Get current session for production
      const session = await authHelpers.getCurrentSession();

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        await loadUserProfile(session.user.id);
      }
    } catch (err: any) {
      console.error('Error initializing auth:', err);
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const profileData = await dbHelpers.getProfile(userId);
      setProfile(profileData);

      // Update online status
      await dbHelpers.updateProfile(userId, {
        is_online: true,
        last_seen: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      // Don't set error here as profile might not exist yet for new users
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user, session } = await authHelpers.signInWithEmail(email, password);

      if (user && session) {
        setUser(user);
        setSession(session);
        await loadUserProfile(user.id);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(handleSupabaseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userType: UserType) => {
    try {
      setLoading(true);
      setError(null);

      const { user } = await authHelpers.signUpWithEmail(email, password);

      if (user) {
        // Create user profile
        const profileData = {
          id: user.id,
          email: user.email || email,
          name: email.split('@')[0], // Default name from email
          user_type: userType,
          is_online: true,
          created_at: new Date().toISOString(),
        };

        const profile = await dbHelpers.updateProfile(user.id, profileData);
        setProfile(profile);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(handleSupabaseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Set user as offline before signing out
      if (user) {
        await dbHelpers.updateProfile(user.id, {
          is_online: false,
          last_seen: new Date().toISOString()
        });
      }

      await authHelpers.signOut();

      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);

      // Clear any stored mock user data
      await SecureStore.deleteItemAsync('mockUserId');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(handleSupabaseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No authenticated user');

      setError(null);

      const updatedProfile = await dbHelpers.updateProfile(user.id, data);
      setProfile(updatedProfile);

      return updatedProfile;
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authHelpers.resetPassword(email);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
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

// Helper hook for checking authentication status
export function useAuthStatus() {
  const { user, loading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
}
