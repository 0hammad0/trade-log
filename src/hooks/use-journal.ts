"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { JournalEntry } from '@/types';
import type { JournalEntryFormValues } from '@/lib/validations/journal';

const PAGE_SIZE = 10;

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const fetchEntries = useCallback(async (reset = false) => {
    const supabase = createClient();

    if (reset) {
      setLoading(true);
      pageRef.current = 0;
      setEntries([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const from = pageRef.current * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      const newEntries = data || [];
      setEntries(prev => reset ? newEntries : [...prev, ...newEntries]);
      setHasMore(newEntries.length === PAGE_SIZE);
      pageRef.current += 1;
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(true);
  }, [fetchEntries]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchEntries(false);
    }
  }, [fetchEntries, loadingMore, hasMore]);

  const createEntry = useCallback(async (values: JournalEntryFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: values.title,
        content: values.content,
        mood: values.mood,
        entry_date: values.entry_date,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    setEntries(prev => [data as JournalEntry, ...prev]);
    return data;
  }, []);

  const updateEntry = useCallback(async (id: string, values: Partial<JournalEntryFormValues>) => {
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('journal_entries')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    setEntries(prev => prev.map(e => e.id === id ? data as JournalEntry : e));
    return data;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntryByDate = useCallback(async (date: string) => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('entry_date', date)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    return data as JournalEntry | null;
  }, []);

  const refresh = useCallback(() => {
    fetchEntries(true);
  }, [fetchEntries]);

  return {
    entries,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntryByDate,
    refresh,
  };
}
