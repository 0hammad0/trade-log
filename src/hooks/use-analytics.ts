"use client";

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Trade,
  SymbolPerformance,
  SetupPerformance,
  AnalyticsPeriod,
  AnalyticsStats,
  MarketPerformance,
  MarketType
} from '@/types';

export interface DailyPnLData {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
}

export interface AnalyticsData {
  trades: Trade[];
  stats: AnalyticsStats;
  symbolPerformance: SymbolPerformance[];
  setupPerformance: SetupPerformance[];
  marketPerformance: MarketPerformance[];
  dailyPnL: DailyPnLData[];
  monthlyPnL: { month: string; pnl: number; trades: number }[];
  dayOfWeekPnL: { day: string; pnl: number; trades: number; winRate: number }[];
  hourlyPnL: { hour: number; pnl: number; trades: number }[];
}

function calculateStats(closedTrades: Trade[]): AnalyticsStats {
  if (closedTrades.length === 0) {
    return {
      totalPnL: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      payoffRatio: 0,
      expectancy: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      bestTrade: 0,
      worstTrade: 0,
      averageTradeDuration: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
      currentStreak: { type: 'none', count: 0 },
    };
  }

  const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.profit_loss || 0) < 0);
  const breakEvenTrades = closedTrades.filter(t => (t.profit_loss || 0) === 0);

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const totalWins = winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0));

  const winRate = (winningTrades.length / closedTrades.length) * 100;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const payoffRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? Infinity : 0;

  // Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
  const winPercent = winningTrades.length / closedTrades.length;
  const lossPercent = losingTrades.length / closedTrades.length;
  const expectancy = (winPercent * averageWin) - (lossPercent * averageLoss);

  // Max Drawdown calculation
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  const sortedTrades = [...closedTrades].sort((a, b) =>
    new Date(a.exit_date || a.trade_date).getTime() - new Date(b.exit_date || b.trade_date).getTime()
  );

  for (const trade of sortedTrades) {
    runningPnL += trade.profit_loss || 0;
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

  // Best and worst trades
  const pnlValues = closedTrades.map(t => t.profit_loss || 0);
  const bestTrade = Math.max(...pnlValues);
  const worstTrade = Math.min(...pnlValues);

  // Average trade duration
  const durations = closedTrades
    .filter(t => t.exit_date && t.trade_date)
    .map(t => {
      const entry = new Date(t.trade_date).getTime();
      const exit = new Date(t.exit_date!).getTime();
      return (exit - entry) / (1000 * 60 * 60 * 24); // days
    });
  const averageTradeDuration = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;

  // Win/Loss streaks
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let currentWinStreak = 0;
  let currentLoseStreak = 0;

  for (const trade of sortedTrades) {
    const pnl = trade.profit_loss || 0;
    if (pnl > 0) {
      currentWinStreak++;
      currentLoseStreak = 0;
      if (currentWinStreak > longestWinStreak) {
        longestWinStreak = currentWinStreak;
      }
    } else if (pnl < 0) {
      currentLoseStreak++;
      currentWinStreak = 0;
      if (currentLoseStreak > longestLoseStreak) {
        longestLoseStreak = currentLoseStreak;
      }
    } else {
      // Break even - reset both
      currentWinStreak = 0;
      currentLoseStreak = 0;
    }
  }

  // Current streak (from most recent trades)
  let currentStreak: { type: 'win' | 'loss' | 'none'; count: number } = { type: 'none', count: 0 };
  if (sortedTrades.length > 0) {
    const lastTrade = sortedTrades[sortedTrades.length - 1];
    const lastPnl = lastTrade.profit_loss || 0;
    if (lastPnl > 0) {
      currentStreak = { type: 'win', count: currentWinStreak };
    } else if (lastPnl < 0) {
      currentStreak = { type: 'loss', count: currentLoseStreak };
    }
  }

  return {
    totalPnL,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakEvenTrades: breakEvenTrades.length,
    winRate,
    profitFactor: isFinite(profitFactor) ? profitFactor : 0,
    averageWin,
    averageLoss,
    payoffRatio: isFinite(payoffRatio) ? payoffRatio : 0,
    expectancy,
    maxDrawdown,
    maxDrawdownPercent,
    bestTrade,
    worstTrade,
    averageTradeDuration,
    longestWinStreak,
    longestLoseStreak,
    currentStreak,
  };
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

      // Calculate comprehensive stats
      const stats = calculateStats(closedTrades);

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

      // Market performance
      const marketMap = new Map<MarketType, Trade[]>();
      closedTrades.forEach(trade => {
        const existing = marketMap.get(trade.market_type) || [];
        marketMap.set(trade.market_type, [...existing, trade]);
      });

      const marketPerformance: MarketPerformance[] = Array.from(marketMap.entries())
        .map(([market, marketTrades]) => {
          const wins = marketTrades.filter(t => (t.profit_loss || 0) > 0).length;
          const totalPnL = marketTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
          return {
            market,
            trades: marketTrades.length,
            winRate: (wins / marketTrades.length) * 100,
            totalPnL,
            averagePnL: totalPnL / marketTrades.length,
          };
        })
        .sort((a, b) => b.totalPnL - a.totalPnL);

      // Daily P&L with trade count and win/loss breakdown
      const dailyMap = new Map<string, { pnl: number; trades: number; wins: number; losses: number; breakeven: number }>();
      closedTrades.forEach(trade => {
        const date = trade.exit_date?.split('T')[0] || trade.trade_date.split('T')[0];
        const existing = dailyMap.get(date) || { pnl: 0, trades: 0, wins: 0, losses: 0, breakeven: 0 };
        const pnl = trade.profit_loss || 0;
        dailyMap.set(date, {
          pnl: existing.pnl + pnl,
          trades: existing.trades + 1,
          wins: existing.wins + (pnl > 0 ? 1 : 0),
          losses: existing.losses + (pnl < 0 ? 1 : 0),
          breakeven: existing.breakeven + (pnl === 0 ? 1 : 0),
        });
      });

      const dailyPnL: DailyPnLData[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          pnl: data.pnl,
          trades: data.trades,
          wins: data.wins,
          losses: data.losses,
          breakeven: data.breakeven,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Monthly P&L with trade count
      const monthlyMap = new Map<string, { pnl: number; trades: number }>();
      closedTrades.forEach(trade => {
        const date = trade.exit_date || trade.trade_date;
        const month = date.slice(0, 7); // YYYY-MM
        const existing = monthlyMap.get(month) || { pnl: 0, trades: 0 };
        monthlyMap.set(month, {
          pnl: existing.pnl + (trade.profit_loss || 0),
          trades: existing.trades + 1,
        });
      });

      const monthlyPnL = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, pnl: data.pnl, trades: data.trades }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Day of week P&L with win rate
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayMap = new Map<number, { pnl: number; trades: number; wins: number }>();

      closedTrades.forEach(trade => {
        const date = new Date(trade.trade_date);
        const day = date.getDay();
        const existing = dayMap.get(day) || { pnl: 0, trades: 0, wins: 0 };
        dayMap.set(day, {
          pnl: existing.pnl + (trade.profit_loss || 0),
          trades: existing.trades + 1,
          wins: existing.wins + ((trade.profit_loss || 0) > 0 ? 1 : 0),
        });
      });

      const dayOfWeekPnL = dayNames.map((name, index) => {
        const dayData = dayMap.get(index);
        return {
          day: name,
          pnl: dayData?.pnl || 0,
          trades: dayData?.trades || 0,
          winRate: dayData && dayData.trades > 0 ? (dayData.wins / dayData.trades) * 100 : 0,
        };
      });

      // Hourly P&L (if exit_date has time info)
      const hourMap = new Map<number, { pnl: number; trades: number }>();
      closedTrades.forEach(trade => {
        const dateStr = trade.exit_date || trade.trade_date;
        const date = new Date(dateStr);
        const hour = date.getHours();
        const existing = hourMap.get(hour) || { pnl: 0, trades: 0 };
        hourMap.set(hour, {
          pnl: existing.pnl + (trade.profit_loss || 0),
          trades: existing.trades + 1,
        });
      });

      const hourlyPnL = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        pnl: hourMap.get(hour)?.pnl || 0,
        trades: hourMap.get(hour)?.trades || 0,
      }));

      setData({
        trades: closedTrades,
        stats,
        symbolPerformance,
        setupPerformance,
        marketPerformance,
        dailyPnL,
        monthlyPnL,
        dayOfWeekPnL,
        hourlyPnL,
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
