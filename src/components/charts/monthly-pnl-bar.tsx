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
    <Card>
      <CardHeader>
        <CardTitle>Monthly P&L</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
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
    const monthlyMap = new Map<string, number>();

    trades
      .filter((t) => t.status === "closed" && t.profit_loss !== null)
      .forEach((trade) => {
        const date = new Date(trade.exit_date || trade.trade_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, existing + (trade.profit_loss || 0));
      });

    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([month, pnl]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        pnl,
        fill: pnl >= 0 ? "#10b981" : "#ef4444",
      }));
  }, [trades]);

  if (loading) {
    return <MonthlyPnLBarSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No closed trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly P&L</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, currency)}
              className="text-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="text-sm font-medium">{data.month}</p>
                    <p
                      className={`text-sm font-semibold ${
                        data.pnl >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(data.pnl, currency)}
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
