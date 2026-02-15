"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import type { ProfileFormValues } from '@/lib/validations/auth';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const pgError = err as { message?: string; code?: string; details?: string };
    if (pgError.message) return pgError.message;
    if (pgError.code === '42P01') return 'Database tables not found. Please run the schema.sql file in Supabase.';
    if (pgError.details) return pgError.details;
  }
  return 'Failed to fetch profile';
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // PGRST116 = Row not found, which is okay for new users
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setProfile(data as Profile | null);
    } catch (err) {
      const message = getErrorMessage(err);
      console.error('Error fetching profile:', message);
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (values: ProfileFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: values.full_name,
        default_currency: values.default_currency,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) throw updateError;
    setProfile(data as Profile);
    return data;
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: fetchProfile,
  };
}
