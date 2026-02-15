"use client";

import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@/types";

interface WinLossPieProps {
  trades: Trade[];
  loading: boolean;
}

const COLORS = {
  wins: "#10b981",
  losses: "#ef4444",
  breakeven: "#6b7280",
};

function WinLossPieSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Win/Loss Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" />
      </CardContent>
    </Card>
  );
}

function WinLossPieComponent({ trades, loading }: WinLossPieProps) {
  const data = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "closed");
    const wins = closedTrades.filter((t) => (t.profit_loss || 0) > 0).length;
    const losses = closedTrades.filter((t) => (t.profit_loss || 0) < 0).length;
    const breakeven = closedTrades.filter((t) => (t.profit_loss || 0) === 0).length;

    return [
      { name: "Wins", value: wins, color: COLORS.wins },
      { name: "Losses", value: losses, color: COLORS.losses },
      { name: "Breakeven", value: breakeven, color: COLORS.breakeven },
    ].filter((d) => d.value > 0);
  }, [trades]);

  if (loading) {
    return <WinLossPieSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Win/Loss Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No closed trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const winData = data.find(d => d.name === "Wins");
  const winRate = winData ? ((winData.value / total) * 100).toFixed(0) : "0";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Win/Loss Ratio
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Distribution of trade outcomes
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--card))"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* Center label */}
            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" className="fill-foreground text-2xl font-bold">
                {winRate}%
              </tspan>
              <tspan x="50%" dy="1.5em" className="fill-muted-foreground text-xs">
                Win Rate
              </tspan>
            </text>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload;
                const percentage = ((data.value / total) * 100).toFixed(1);
                return (
                  <div className="rounded-xl border bg-card p-3 shadow-xl">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.value} trades ({percentage}%)
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm font-medium text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const WinLossPie = memo(WinLossPieComponent);
WinLossPie.displayName = "WinLossPie";
