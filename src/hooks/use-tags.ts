"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tag } from '@/types';
import type { TagFormValues } from '@/lib/validations/trade';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (values: TagFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: values.name,
        color: values.color,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    setTags(prev => [...prev, data as Tag].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  }, []);

  const updateTag = useCallback(async (id: string, values: Partial<TagFormValues>) => {
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('tags')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    setTags(prev => prev.map(t => t.id === id ? data as Tag : t));
    return data;
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setTags(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refresh: fetchTags,
  };
}
