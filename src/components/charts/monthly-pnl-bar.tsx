"use client";

import { memo, useMemo } from "react";
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
import type { Trade } from "@/types";

interface MonthlyPnLBarProps {
  trades: Trade[];
  loading: boolean;
  currency?: string;
}

function MonthlyPnLBarSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full sm:h-[280px]" />
      </CardContent>
    </Card>
  );
}

function MonthlyPnLBarComponent({
  trades,
  loading,
  currency = "USD",
}: MonthlyPnLBarProps) {
  const data = useMemo(() => {
    const monthlyMap = new Map<string, { pnl: number; trades: number }>();

    trades
      .filter((t) => t.status === "closed" && t.profit_loss !== null)
      .forEach((trade) => {
        const date = new Date(trade.exit_date || trade.trade_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthlyMap.get(monthKey) || { pnl: 0, trades: 0 };
        monthlyMap.set(monthKey, {
          pnl: existing.pnl + (trade.profit_loss || 0),
          trades: existing.trades + 1,
        });
      });

    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        pnl: data.pnl,
        trades: data.trades,
        fill: data.pnl >= 0 ? "#10b981" : "#ef4444",
      }));
  }, [trades]);

  const totalPnL = useMemo(() => {
    return data.reduce((sum, d) => sum + d.pnl, 0);
  }, [data]);

  if (loading) {
    return <MonthlyPnLBarSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Monthly P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[280px]">
            No closed trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = totalPnL >= 0;
  const profitableMonths = data.filter(d => d.pnl > 0).length;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Monthly P&L
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {profitableMonths}/{data.length} profitable months
          </p>
        </div>
        <div className={`rounded-lg px-2 py-1 text-sm font-bold sm:px-3 sm:py-1.5 ${
          isPositive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {formatCurrency(totalPnL, currency)}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, currency)}
              className="text-muted-foreground"
              width={65}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-card p-2 shadow-lg">
                    <p className="text-sm font-semibold">{d.month}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.trades} trade{d.trades !== 1 ? "s" : ""}
                    </p>
                    <p
                      className={`mt-1 text-base font-bold ${
                        d.pnl >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(d.pnl, currency)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const MonthlyPnLBar = memo(MonthlyPnLBarComponent);
MonthlyPnLBar.displayName = "MonthlyPnLBar";
