"use client";

import { memo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  Flame,
  Timer,
  BarChart3,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";
import type { AnalyticsStats } from "@/types";

interface AnalyticsStatsCardsProps {
  stats: AnalyticsStats | null;
  loading: boolean;
  currency?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative" | "neutral";
  tooltip?: string;
}

function StatCard({ label, value, subValue, icon, trend, tooltip }: StatCardProps) {
  const content = (
    <Card className="relative overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {label}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-base font-bold tracking-tight sm:text-xl",
                trend === "positive" && "text-emerald-600 dark:text-emerald-400",
                trend === "negative" && "text-red-600 dark:text-red-400"
              )}
            >
              {value}
            </p>
            {subValue && (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
                {subValue}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex-shrink-0 rounded-lg p-1.5 sm:p-2",
              trend === "positive" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
              trend === "negative" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-12 sm:w-16" />
                <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
                <Skeleton className="h-2.5 w-14 sm:w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg sm:h-10 sm:w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsStatsCardsComponent({
  stats,
  loading,
  currency = "USD",
}: AnalyticsStatsCardsProps) {
  if (loading || !stats) {
    return <StatsCardsSkeleton />;
  }

  const formatDuration = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      return hours <= 1 ? "<1h" : `${hours}h`;
    }
    const rounded = Math.round(days * 10) / 10;
    return `${rounded}d`;
  };

  const statCards: StatCardProps[] = [
    {
      label: "Total P&L",
      value: formatCurrency(stats.totalPnL, currency),
      subValue: `${stats.winningTrades}W / ${stats.losingTrades}L`,
      icon: stats.totalPnL >= 0
        ? <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
        : <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.totalPnL >= 0 ? "positive" : "negative",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      subValue: `${stats.totalTrades} trades`,
      icon: <Target className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.winRate >= 50 ? "positive" : stats.winRate >= 40 ? "neutral" : "negative",
      tooltip: "Percentage of winning trades",
    },
    {
      label: "Profit Factor",
      value: stats.profitFactor.toFixed(2),
      subValue: stats.profitFactor >= 1.5 ? "Excellent" : stats.profitFactor >= 1 ? "Good" : "Needs work",
      icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.profitFactor >= 1.5 ? "positive" : stats.profitFactor >= 1 ? "neutral" : "negative",
      tooltip: "Gross profits / gross losses. >1.5 is excellent",
    },
    {
      label: "Expectancy",
      value: formatCurrency(stats.expectancy, currency),
      subValue: "per trade",
      icon: <Percent className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.expectancy > 0 ? "positive" : stats.expectancy < 0 ? "negative" : "neutral",
      tooltip: "Expected profit per trade",
    },
    {
      label: "Payoff Ratio",
      value: stats.payoffRatio.toFixed(2),
      subValue: `Avg Win: ${formatCurrency(stats.averageWin, currency)}`,
      icon: <Trophy className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.payoffRatio >= 2 ? "positive" : stats.payoffRatio >= 1 ? "neutral" : "negative",
      tooltip: "Avg Win / Avg Loss",
    },
    {
      label: "Max Drawdown",
      value: formatCurrency(stats.maxDrawdown, currency),
      subValue: stats.maxDrawdownPercent > 0 ? `${stats.maxDrawdownPercent.toFixed(1)}%` : "None",
      icon: <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.maxDrawdownPercent <= 10 ? "positive" : stats.maxDrawdownPercent <= 20 ? "neutral" : "negative",
      tooltip: "Largest peak-to-trough decline",
    },
    {
      label: "Streak",
      value: stats.currentStreak.type === "none"
        ? "—"
        : `${stats.currentStreak.count}${stats.currentStreak.type === "win" ? "W" : "L"}`,
      subValue: `Best ${stats.longestWinStreak}W / ${stats.longestLoseStreak}L`,
      icon: <Flame className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: stats.currentStreak.type === "win" ? "positive" : stats.currentStreak.type === "loss" ? "negative" : "neutral",
    },
    {
      label: "Avg Hold",
      value: formatDuration(stats.averageTradeDuration),
      subValue: `Best: ${formatCurrency(stats.bestTrade, currency)}`,
      icon: <Timer className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />,
      trend: "neutral",
      tooltip: "Average trade duration",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </TooltipProvider>
  );
}

export const AnalyticsStatsCards = memo(AnalyticsStatsCardsComponent);
AnalyticsStatsCards.displayName = "AnalyticsStatsCards";
