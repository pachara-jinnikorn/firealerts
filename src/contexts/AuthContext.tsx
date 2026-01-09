// src/contexts/AuthContext.tsx
// ============================================
// AUTHENTICATION CONTEXT - FIXED
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('Session loaded:', session?.user?.email || 'Not logged in');
      try {
        localStorage.setItem('current_user_id', session?.user?.id || '');
      } catch { }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        try {
          localStorage.setItem('current_user_id', session?.user?.id || '');
        } catch { }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // If email confirmation is disabled, the user will be logged in immediately
      if (data.user && data.session) {
        console.log('Sign up successful - user logged in');
        setUser(data.user);
      } else {
        console.log('Sign up successful - confirmation email sent');
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in:', email);

      // CRITICAL: Clear ALL Supabase session data before new login
      await supabase.auth.signOut();

      // Clear all sb-* keys from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem('current_user_id');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.user) {
        console.log('Sign in successful:', data.user.email);
        setUser(data.user);
        localStorage.setItem('current_user_id', data.user.id);

        // IMMEDIATE reload - no setTimeout to prevent stale session usage
        window.location.reload();
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('Signed out successfully');
      try {
        localStorage.removeItem('current_user_id');
        // Clear Supabase session tokens explicitly
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
      } catch { }

      // Force reload to clear in-memory Supabase client state
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
