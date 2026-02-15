"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Symbol {
  id: string;
  user_id: string;
  symbol: string;
  market_type: string;
  last_used_at: string;
  use_count: number;
  created_at: string;
}

export function useSymbols() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSymbols = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('symbols')
      .select('*')
      .order('last_used_at', { ascending: false });

    if (error) {
      console.error('Error fetching symbols:', error);
      return;
    }

    setSymbols(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSymbols();
  }, [fetchSymbols]);

  const addOrUpdateSymbol = useCallback(async (symbolName: string, marketType: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const upperSymbol = symbolName.toUpperCase().trim();
    if (!upperSymbol) return null;

    // Check if symbol already exists for this user
    const existing = symbols.find(
      s => s.symbol === upperSymbol && s.user_id === user.id
    );

    if (existing) {
      // Update last_used_at and increment use_count
      const { data, error } = await supabase
        .from('symbols')
        .update({
          last_used_at: new Date().toISOString(),
          use_count: existing.use_count + 1,
          market_type: marketType, // Update market type in case it changed
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (!error && data) {
        setSymbols(prev =>
          prev.map(s => s.id === existing.id ? data : s)
            .sort((a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime())
        );
        return data;
      }
    } else {
      // Insert new symbol
      const { data, error } = await supabase
        .from('symbols')
        .insert({
          user_id: user.id,
          symbol: upperSymbol,
          market_type: marketType,
          last_used_at: new Date().toISOString(),
          use_count: 1,
        })
        .select()
        .single();

      if (!error && data) {
        setSymbols(prev => [data, ...prev]);
        return data;
      }
    }

    return null;
  }, [symbols]);

  const getRecentSymbols = useCallback((limit = 10) => {
    return symbols.slice(0, limit);
  }, [symbols]);

  const searchSymbols = useCallback((query: string) => {
    if (!query.trim()) return symbols.slice(0, 10);

    const upperQuery = query.toUpperCase();
    return symbols.filter(s =>
      s.symbol.includes(upperQuery)
    ).slice(0, 20);
  }, [symbols]);

  return {
    symbols,
    loading,
    addOrUpdateSymbol,
    getRecentSymbols,
    searchSymbols,
    refresh: fetchSymbols,
  };
}
