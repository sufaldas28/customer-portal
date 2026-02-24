import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  customer_id: string;
  loyalty_points: number;
  loyalty_tier: string;
  member_since: string;
  credit_limit: number;
  outstanding_balance: number;
  total_spent: number;
  avatar_url: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, company: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile | null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  const createProfile = useCallback(async (userId: string, email: string, fullName: string, company: string) => {
    const customerIdNum = Math.floor(Math.random() * 90000) + 10000;
    const newProfile = {
      auth_user_id: userId,
      full_name: fullName,
      email: email,
      phone: '',
      company: company,
      customer_id: `CUST-2026-${customerIdNum}`,
      loyalty_points: 100,
      loyalty_tier: 'Bronze',
      credit_limit: 100000,
      outstanding_balance: 0,
      total_spent: 0,
      avatar_url: '',
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    return data as UserProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  }, [user, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id);
        setProfile(p);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, company: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        const p = await createProfile(data.user.id, email, fullName, company);
        if (p) setProfile(p);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('auth_user_id', user.id)
        .select()
        .single();
      if (error) return { error: error.message };
      if (data) setProfile(data as UserProfile);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
