"use client";

import { memo, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";

interface DailyPnL {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
}

interface PnLCalendarProps {
  data: DailyPnL[];
  loading: boolean;
  currency?: string;
}

function PnLCalendarSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="h-full min-h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

// Format currency in compact form for calendar cells
function formatCompactCurrency(amount: number, currency: string): string {
  const absAmount = Math.abs(amount);
  const sign = amount >= 0 ? "+" : "-";

  if (absAmount >= 1000000) {
    return `${sign}${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}${(absAmount / 1000).toFixed(absAmount >= 10000 ? 0 : 1)}K`;
  }
  if (absAmount >= 100) {
    return `${sign}${Math.round(absAmount)}`;
  }
  return `${sign}${absAmount.toFixed(0)}`;
}

function PnLCalendarComponent({
  data,
  loading,
  currency = "USD",
}: PnLCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dailyPnLMap = useMemo(() => {
    const map = new Map<string, DailyPnL>();
    data.forEach((d) => {
      map.set(d.date, d);
    });
    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Calculate number of weeks for dynamic row sizing
  const numWeeks = Math.ceil(calendarDays.length / 7);

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    let totalPnL = 0;
    let winDays = 0;
    let lossDays = 0;
    let totalTrades = 0;

    data.forEach((d) => {
      const date = new Date(d.date);
      if (date >= monthStart && date <= monthEnd) {
        totalPnL += d.pnl;
        totalTrades += d.trades;
        if (d.pnl > 0) winDays++;
        if (d.pnl < 0) lossDays++;
      }
    });

    return { totalPnL, winDays, lossDays, totalTrades };
  }, [data, currentMonth]);

  // Find max absolute PnL for color intensity scaling
  const maxAbsPnL = useMemo(() => {
    if (data.length === 0) return 1000;
    return Math.max(...data.map((d) => Math.abs(d.pnl)), 100);
  }, [data]);

  const getColorClass = (pnl: number) => {
    if (pnl === 0) return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    const intensity = Math.min(Math.abs(pnl) / maxAbsPnL, 1);

    if (pnl > 0) {
      if (intensity > 0.7) return "bg-emerald-500 text-white dark:bg-emerald-600";
      if (intensity > 0.4) return "bg-emerald-400 text-emerald-950 dark:bg-emerald-500 dark:text-white";
      if (intensity > 0.2) return "bg-emerald-300 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100";
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200";
    } else {
      if (intensity > 0.7) return "bg-red-500 text-white dark:bg-red-600";
      if (intensity > 0.4) return "bg-red-400 text-red-950 dark:bg-red-500 dark:text-white";
      if (intensity > 0.2) return "bg-red-300 text-red-900 dark:bg-red-700 dark:text-red-100";
      return "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200";
    }
  };

  if (loading) {
    return <PnLCalendarSkeleton />;
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            P&L Calendar
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {monthStats.winDays}W / {monthStats.lossDays}L days
            {monthStats.totalTrades > 0 && ` • ${monthStats.totalTrades} trades`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden rounded-lg px-3 py-1.5 text-sm font-bold sm:block",
              monthStats.totalPnL >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {formatCurrency(monthStats.totalPnL, currency)}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {/* Month total for mobile */}
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <h3 className="text-base font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <span
            className={cn(
              "rounded-lg px-2 py-1 text-sm font-bold",
              monthStats.totalPnL >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {formatCurrency(monthStats.totalPnL, currency)}
          </span>
        </div>

        {/* Month header for desktop */}
        <div className="mb-3 hidden text-center sm:block">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
        </div>

        <TooltipProvider>
          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid - flex-1 to take remaining space */}
          <div
            className="grid flex-1 grid-cols-7 gap-1.5"
            style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}
          >
            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayData = dailyPnLMap.get(dateStr);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const hasTrades = dayData && dayData.trades > 0;

              return (
                <Tooltip key={dateStr}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative flex min-h-[56px] flex-col overflow-hidden rounded-lg transition-all sm:min-h-[68px] lg:min-h-[76px]",
                        isCurrentMonth
                          ? hasTrades
                            ? getColorClass(dayData.pnl)
                            : "bg-muted/40 hover:bg-muted/60"
                          : "bg-muted/20 text-muted-foreground/40",
                        isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                        hasTrades && "cursor-pointer hover:scale-[1.02] hover:shadow-md"
                      )}
                    >
                      {/* Date badge in top-left corner */}
                      <div className="flex w-full items-start justify-between p-1 sm:p-1.5">
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs",
                            isCurrentMonth
                              ? hasTrades
                                ? "bg-black/10 dark:bg-white/10"
                                : "bg-muted-foreground/10"
                              : "bg-transparent"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {/* Trade count badge */}
                        {hasTrades && (
                          <span className="rounded bg-black/10 px-1 py-0.5 text-[8px] font-medium dark:bg-white/10 sm:text-[9px]">
                            {dayData.trades}
                          </span>
                        )}
                      </div>

                      {/* P&L and W/L in center-bottom area */}
                      {hasTrades ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 pb-1 sm:pb-1.5">
                          <span className="text-[11px] font-bold leading-none sm:text-sm">
                            {formatCompactCurrency(dayData.pnl, currency)}
                          </span>
                          <span className="flex items-center gap-0.5 text-[8px] font-medium opacity-80 sm:text-[10px]">
                            <span className="text-emerald-900 dark:text-emerald-200">
                              {dayData.wins}W
                            </span>
                            <span className="opacity-50">/</span>
                            <span className="text-red-900 dark:text-red-200">
                              {dayData.losses}L
                            </span>
                            {dayData.breakeven > 0 && (
                              <>
                                <span className="opacity-50">/</span>
                                <span className="opacity-70">{dayData.breakeven}B</span>
                              </>
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {hasTrades && (
                    <TooltipContent side="top" className="max-w-[200px]">
                      <div className="space-y-2">
                        <p className="font-semibold">
                          {format(day, "EEEE, MMMM d")}
                        </p>
                        <p
                          className={cn(
                            "text-xl font-bold",
                            dayData.pnl >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {formatCurrency(dayData.pnl, currency)}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {dayData.wins} win{dayData.wins !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            {dayData.losses} loss{dayData.losses !== 1 ? "es" : ""}
                          </span>
                          {dayData.breakeven > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-gray-400" />
                              {dayData.breakeven} breakeven
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-red-400" />
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <span>No trades</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-emerald-400" />
            <span>Profit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const PnLCalendar = memo(PnLCalendarComponent);
PnLCalendar.displayName = "PnLCalendar";
