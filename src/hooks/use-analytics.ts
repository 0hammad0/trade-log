"use client";

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Trade, SymbolPerformance, SetupPerformance, AnalyticsPeriod } from '@/types';

export interface AnalyticsData {
  trades: Trade[];
  symbolPerformance: SymbolPerformance[];
  setupPerformance: SetupPerformance[];
  dailyPnL: { date: string; pnl: number }[];
  monthlyPnL: { month: string; pnl: number }[];
  dayOfWeekPnL: { day: string; pnl: number; trades: number }[];
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (period: AnalyticsPeriod) => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    try {
      const { data: trades, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .gte('trade_date', period.startDate)
        .lte('trade_date', period.endDate)
        .order('trade_date', { ascending: true });

      if (fetchError) throw fetchError;

      const allTrades = (trades || []) as Trade[];
      const closedTrades = allTrades.filter(t => t.status === 'closed');

      // Symbol performance
      const symbolMap = new Map<string, Trade[]>();
      closedTrades.forEach(trade => {
        const existing = symbolMap.get(trade.symbol) || [];
        symbolMap.set(trade.symbol, [...existing, trade]);
      });

      const symbolPerformance: SymbolPerformance[] = Array.from(symbolMap.entries())
        .map(([symbol, symbolTrades]) => {
          const wins = symbolTrades.filter(t => (t.profit_loss || 0) > 0).length;
          const totalPnL = symbolTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
          return {
            symbol,
            trades: symbolTrades.length,
            winRate: (wins / symbolTrades.length) * 100,
            totalPnL,
            averagePnL: totalPnL / symbolTrades.length,
          };
        })
        .sort((a, b) => b.totalPnL - a.totalPnL);

      // Setup performance
      const setupMap = new Map<string, Trade[]>();
      closedTrades.forEach(trade => {
        const setup = trade.setup || 'No Setup';
        const existing = setupMap.get(setup) || [];
        setupMap.set(setup, [...existing, trade]);
      });

      const setupPerformance: SetupPerformance[] = Array.from(setupMap.entries())
        .map(([setup, setupTrades]) => {
          const wins = setupTrades.filter(t => (t.profit_loss || 0) > 0).length;
          const totalPnL = setupTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
          return {
            setup,
            trades: setupTrades.length,
            winRate: (wins / setupTrades.length) * 100,
            totalPnL,
            averagePnL: totalPnL / setupTrades.length,
          };
        })
        .sort((a, b) => b.totalPnL - a.totalPnL);

      // Daily P&L
      const dailyMap = new Map<string, number>();
      closedTrades.forEach(trade => {
        const date = trade.exit_date?.split('T')[0] || trade.trade_date.split('T')[0];
        const existing = dailyMap.get(date) || 0;
        dailyMap.set(date, existing + (trade.profit_loss || 0));
      });

      const dailyPnL = Array.from(dailyMap.entries())
        .map(([date, pnl]) => ({ date, pnl }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Monthly P&L
      const monthlyMap = new Map<string, number>();
      closedTrades.forEach(trade => {
        const date = trade.exit_date || trade.trade_date;
        const month = date.slice(0, 7); // YYYY-MM
        const existing = monthlyMap.get(month) || 0;
        monthlyMap.set(month, existing + (trade.profit_loss || 0));
      });

      const monthlyPnL = Array.from(monthlyMap.entries())
        .map(([month, pnl]) => ({ month, pnl }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Day of week P&L
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayMap = new Map<number, { pnl: number; trades: number }>();

      closedTrades.forEach(trade => {
        const date = new Date(trade.trade_date);
        const day = date.getDay();
        const existing = dayMap.get(day) || { pnl: 0, trades: 0 };
        dayMap.set(day, {
          pnl: existing.pnl + (trade.profit_loss || 0),
          trades: existing.trades + 1,
        });
      });

      const dayOfWeekPnL = dayNames.map((name, index) => ({
        day: name,
        pnl: dayMap.get(index)?.pnl || 0,
        trades: dayMap.get(index)?.trades || 0,
      }));

      setData({
        trades: closedTrades,
        symbolPerformance,
        setupPerformance,
        dailyPnL,
        monthlyPnL,
        dayOfWeekPnL,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchAnalytics,
  };
}
