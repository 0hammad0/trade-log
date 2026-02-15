"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Trade, TradeFilters } from '@/types';
import type { TradeFormValues } from '@/lib/validations/trade';

const PAGE_SIZE = 20;

export function useTrades(filters?: TradeFilters) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const fetchTrades = useCallback(async (reset = false) => {
    const supabase = createClient();

    if (reset) {
      setLoading(true);
      pageRef.current = 0;
      setTrades([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const from = pageRef.current * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false })
        .range(from, to);

      if (filters?.symbol) {
        query = query.ilike('symbol', `%${filters.symbol}%`);
      }
      if (filters?.marketType) {
        query = query.eq('market_type', filters.marketType);
      }
      if (filters?.direction) {
        query = query.eq('direction', filters.direction);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.startDate) {
        query = query.gte('trade_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('trade_date', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const newTrades = data || [];
      setTrades(prev => reset ? newTrades : [...prev, ...newTrades]);
      setHasMore(newTrades.length === PAGE_SIZE);
      pageRef.current += 1;
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters?.symbol, filters?.marketType, filters?.direction, filters?.status, filters?.startDate, filters?.endDate]);

  useEffect(() => {
    fetchTrades(true);
  }, [fetchTrades]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchTrades(false);
    }
  }, [fetchTrades, loadingMore, hasMore]);

  const createTrade = useCallback(async (values: TradeFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate P&L if trade is closed
    let profit_loss: number | null = null;
    let profit_loss_percent: number | null = null;

    if (values.status === 'closed' && values.exit_price) {
      const entryValue = values.entry_price * values.quantity;
      const exitValue = values.exit_price * values.quantity;
      profit_loss = values.direction === 'long'
        ? exitValue - entryValue
        : entryValue - exitValue;
      profit_loss_percent = (profit_loss / entryValue) * 100;
    }

    // Calculate risk/reward
    let risk_reward: number | null = null;
    if (values.stop_loss && values.take_profit) {
      const risk = Math.abs(values.entry_price - values.stop_loss);
      const reward = Math.abs(values.take_profit - values.entry_price);
      risk_reward = risk > 0 ? reward / risk : null;
    }

    const { data, error: insertError } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        symbol: values.symbol.toUpperCase(),
        market_type: values.market_type,
        currency: values.currency,
        direction: values.direction,
        entry_price: values.entry_price,
        exit_price: values.exit_price,
        quantity: values.quantity,
        stop_loss: values.stop_loss,
        take_profit: values.take_profit,
        status: values.status,
        profit_loss,
        profit_loss_percent,
        risk_reward,
        setup: values.setup,
        notes: values.notes,
        trade_date: values.trade_date,
        exit_date: values.exit_date,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    setTrades(prev => [data as Trade, ...prev]);
    return data;
  }, []);

  const updateTrade = useCallback(async (id: string, values: Partial<TradeFormValues>) => {
    const supabase = createClient();
    // Calculate P&L if trade is being closed
    const updateData: Record<string, unknown> = { ...values };

    if (values.status === 'closed' && values.exit_price && values.entry_price && values.quantity) {
      const entryValue = values.entry_price * values.quantity;
      const exitValue = values.exit_price * values.quantity;
      const profit_loss = values.direction === 'long'
        ? exitValue - entryValue
        : entryValue - exitValue;
      updateData.profit_loss = profit_loss;
      updateData.profit_loss_percent = (profit_loss / entryValue) * 100;
    }

    if (values.stop_loss && values.take_profit && values.entry_price) {
      const risk = Math.abs(values.entry_price - values.stop_loss);
      const reward = Math.abs(values.take_profit - values.entry_price);
      updateData.risk_reward = risk > 0 ? reward / risk : null;
    }

    if (values.symbol) {
      updateData.symbol = values.symbol.toUpperCase();
    }

    const { data, error: updateError } = await supabase
      .from('trades')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    setTrades(prev => prev.map(t => t.id === id ? data as Trade : t));
    return data;
  }, []);

  const deleteTrade = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setTrades(prev => prev.filter(t => t.id !== id));
  }, []);

  const refresh = useCallback(() => {
    fetchTrades(true);
  }, [fetchTrades]);

  return {
    trades,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    createTrade,
    updateTrade,
    deleteTrade,
    refresh,
  };
}
