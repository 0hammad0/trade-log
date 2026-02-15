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
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
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

    // Use reduce to accumulate equity without reassigning a variable
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
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No closed trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestEquity = data[data.length - 1]?.equity || 0;
  const isPositive = latestEquity >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
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
                    <p className="text-sm font-medium">{data.date}</p>
                    <p className="text-xs text-muted-foreground">{data.trade}</p>
                    <p
                      className={`text-sm font-semibold ${
                        data.equity >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(data.equity, currency)}
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
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const EquityCurve = memo(EquityCurveComponent);
EquityCurve.displayName = "EquityCurve";
