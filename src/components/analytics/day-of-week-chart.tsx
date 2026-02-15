"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/constants/markets";

interface DayOfWeekChartProps {
  data: { day: string; pnl: number; trades: number; winRate?: number }[];
  loading: boolean;
  currency?: string;
}

function DayOfWeekChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}

function DayOfWeekChartComponent({
  data,
  loading,
  currency = "USD",
}: DayOfWeekChartProps) {
  if (loading) {
    return <DayOfWeekChartSkeleton />;
  }

  const hasData = data.some((d) => d.trades > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Performance by Day of Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show weekdays (Mon-Fri)
  const weekdayData = data.filter(
    (d) => d.day !== "Saturday" && d.day !== "Sunday"
  );

  // Find best and worst days
  const tradingDays = weekdayData.filter(d => d.trades > 0);
  const bestDay = tradingDays.length > 0
    ? tradingDays.reduce((best, d) => d.pnl > best.pnl ? d : best, tradingDays[0])
    : null;
  const worstDay = tradingDays.length > 0
    ? tradingDays.reduce((worst, d) => d.pnl < worst.pnl ? d : worst, tradingDays[0])
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Performance by Day of Week
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Weekday trading performance analysis
            </p>
          </div>
          {bestDay && worstDay && (
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Best:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {bestDay.day.slice(0, 3)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Worst:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {worstDay.day.slice(0, 3)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={weekdayData}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, currency)}
              className="text-muted-foreground"
              width={70}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl border bg-card p-3 shadow-xl">
                    <p className="font-semibold">{d.day}</p>
                    <div className="mt-1 space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        {d.trades} trade{d.trades !== 1 ? "s" : ""}
                      </p>
                      {d.winRate !== undefined && (
                        <p className="text-muted-foreground">
                          Win Rate: <span className={d.winRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{d.winRate.toFixed(0)}%</span>
                        </p>
                      )}
                      <p
                        className={`font-bold ${
                          d.pnl >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(d.pnl, currency)}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
              {weekdayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const DayOfWeekChart = memo(DayOfWeekChartComponent);
DayOfWeekChart.displayName = "DayOfWeekChart";
