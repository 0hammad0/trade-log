"use client";

import { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/constants/markets";
import type { Trade } from "@/types";

interface EquityCurveProps {
  trades: Trade[];
  loading: boolean;
  currency?: string;
}

function EquityCurveSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full sm:h-[280px]" />
      </CardContent>
    </Card>
  );
}

function EquityCurveComponent({
  trades,
  loading,
  currency = "USD",
}: EquityCurveProps) {
  const data = useMemo(() => {
    const closedTrades = trades
      .filter((t) => t.status === "closed" && t.profit_loss !== null)
      .sort(
        (a, b) =>
          new Date(a.exit_date || a.trade_date).getTime() -
          new Date(b.exit_date || b.trade_date).getTime()
      );

    return closedTrades.reduce<{ date: string; equity: number; trade: string }[]>(
      (acc, trade) => {
        const previousEquity = acc.length > 0 ? acc[acc.length - 1].equity : 0;
        acc.push({
          date: new Date(trade.exit_date || trade.trade_date).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          ),
          equity: previousEquity + (trade.profit_loss || 0),
          trade: trade.symbol,
        });
        return acc;
      },
      []
    );
  }, [trades]);

  if (loading) {
    return <EquityCurveSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Equity Curve
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

  const latestEquity = data[data.length - 1]?.equity || 0;
  const isPositive = latestEquity >= 0;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Equity Curve
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Cumulative P&L over time
          </p>
        </div>
        <div className={`rounded-lg px-2 py-1 text-sm font-bold sm:px-3 sm:py-1.5 ${
          isPositive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {formatCurrency(latestEquity, currency)}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              interval="preserveStartEnd"
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
                    <p className="text-sm font-semibold">{d.date}</p>
                    <p className="text-xs text-muted-foreground">{d.trade}</p>
                    <p
                      className={`mt-1 text-base font-bold ${
                        d.equity >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(d.equity, currency)}
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="equity"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              fill="url(#equityGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const EquityCurve = memo(EquityCurveComponent);
EquityCurve.displayName = "EquityCurve";
