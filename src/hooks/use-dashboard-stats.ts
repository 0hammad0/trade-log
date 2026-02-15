"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DashboardStats, Trade } from '@/types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const pgError = err as { message?: string; code?: string; details?: string };
    if (pgError.message) return pgError.message;
    if (pgError.code === '42P01') return 'Database tables not found. Please run the schema.sql file in Supabase.';
    if (pgError.details) return pgError.details;
  }
  return 'Failed to fetch stats';
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      // Fetch all trades for stats calculation
      const { data: trades, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false });

      if (fetchError) throw fetchError;

      const allTrades = (trades || []) as Trade[];
      const closedTrades = allTrades.filter(t => t.status === 'closed');
      const openTrades = allTrades.filter(t => t.status === 'open');
      const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0);
      const losingTrades = closedTrades.filter(t => (t.profit_loss || 0) < 0);

      // Calculate stats
      const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const winRate = closedTrades.length > 0
        ? (winningTrades.length / closedTrades.length) * 100
        : 0;
      const totalTrades = allTrades.length;

      const riskRewards = closedTrades
        .map(t => t.risk_reward)
        .filter((rr): rr is number => rr !== null);
      const averageRiskReward = riskRewards.length > 0
        ? riskRewards.reduce((sum, rr) => sum + rr, 0) / riskRewards.length
        : 0;

      const pnlValues = closedTrades.map(t => t.profit_loss || 0);
      const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
      const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

      const totalWins = winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0));
      const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

      setStats({
        totalPnL,
        winRate,
        totalTrades,
        averageRiskReward,
        bestTrade,
        worstTrade,
        profitFactor: isFinite(profitFactor) ? profitFactor : 0,
        openTrades: openTrades.length,
      });

      // Recent trades (last 5)
      setRecentTrades(allTrades.slice(0, 5) as Trade[]);
    } catch (err) {
      const message = getErrorMessage(err);
      console.error('Error fetching dashboard stats:', message);
      setError(message);
      // Set default empty stats on error
      setStats({
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        averageRiskReward: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        openTrades: 0,
      });
      setRecentTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    recentTrades,
    loading,
    error,
    refresh: fetchStats,
  };
}
