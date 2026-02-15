"use client";

import { memo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Trophy,
  AlertTriangle,
  Activity,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  currency?: string;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-1 h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsCardsComponent({ stats, loading, currency = "USD" }: StatsCardsProps) {
  if (loading) {
    return <StatsCardsSkeleton />;
  }

  if (!stats) {
    return null;
  }

  const isProfit = stats.totalPnL > 0;
  const isLoss = stats.totalPnL < 0;

  const cards = [
    {
      title: "Total P&L",
      value: formatCurrency(stats.totalPnL, currency),
      icon: isProfit ? TrendingUp : isLoss ? TrendingDown : Activity,
      iconColor: isProfit
        ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30"
        : isLoss
        ? "text-red-500 bg-red-100 dark:bg-red-900/30"
        : "text-muted-foreground bg-muted",
      valueColor: isProfit
        ? "text-emerald-600 dark:text-emerald-400"
        : isLoss
        ? "text-red-600 dark:text-red-400"
        : "",
      description: `${stats.totalTrades} total trades`,
    },
    {
      title: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: Target,
      iconColor:
        stats.winRate >= 50
          ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30"
          : "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
      description: "Of closed trades",
    },
    {
      title: "Best Trade",
      value: formatCurrency(stats.bestTrade, currency),
      icon: Trophy,
      iconColor: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      description: "Highest profit",
    },
    {
      title: "Worst Trade",
      value: formatCurrency(stats.worstTrade, currency),
      icon: AlertTriangle,
      iconColor: "text-red-500 bg-red-100 dark:bg-red-900/30",
      valueColor: stats.worstTrade < 0 ? "text-red-600 dark:text-red-400" : "",
      description: "Biggest loss",
    },
    {
      title: "Avg Risk/Reward",
      value: stats.averageRiskReward.toFixed(2),
      icon: BarChart3,
      iconColor: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
      description: "R:R ratio",
    },
    {
      title: "Profit Factor",
      value: stats.profitFactor.toFixed(2),
      icon: Activity,
      iconColor:
        stats.profitFactor >= 1
          ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30"
          : "text-red-500 bg-red-100 dark:bg-red-900/30",
      description: "Wins / Losses",
    },
    {
      title: "Open Trades",
      value: stats.openTrades.toString(),
      icon: Clock,
      iconColor: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
      description: "Active positions",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.slice(0, 4).map((card) => (
        <Card key={card.title} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  card.iconColor
                )}
              >
                <card.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4">
              <p
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  card.valueColor
                )}
              >
                {card.value}
              </p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const StatsCards = memo(StatsCardsComponent);
StatsCards.displayName = "StatsCards";
