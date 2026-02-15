"use client";

import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mx-auto h-[160px] w-[160px] rounded-full" />
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
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Win/Loss Ratio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No closed trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const winData = data.find(d => d.name === "Wins");
  const lossData = data.find(d => d.name === "Losses");
  const winRate = winData ? ((winData.value / total) * 100).toFixed(0) : "0";

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Win/Loss Ratio
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {winData?.value || 0}W / {lossData?.value || 0}L trades
        </p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-center gap-4 py-2">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                <tspan x="50%" dy="-0.3em" className="fill-foreground text-lg font-bold">
                  {winRate}%
                </tspan>
                <tspan x="50%" dy="1.3em" className="fill-muted-foreground text-[10px]">
                  Win Rate
                </tspan>
              </text>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  const percentage = ((d.value / total) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border bg-card p-2 shadow-lg">
                      <p className="text-sm font-semibold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.value} trades ({percentage}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const WinLossPie = memo(WinLossPieComponent);
WinLossPie.displayName = "WinLossPie";
