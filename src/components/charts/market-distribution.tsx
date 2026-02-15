"use client";

import { memo, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@/types";

interface MarketDistributionProps {
  trades: Trade[];
  loading: boolean;
}

const MARKET_COLORS: Record<string, string> = {
  stock: "#3b82f6",   // blue
  crypto: "#f59e0b",  // amber
  forex: "#10b981",   // emerald
  futures: "#8b5cf6", // violet
};

const MARKET_LABELS: Record<string, string> = {
  stock: "Stocks",
  crypto: "Crypto",
  forex: "Forex",
  futures: "Futures",
};

function MarketDistributionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mx-auto h-[160px] w-[160px] rounded-full" />
      </CardContent>
    </Card>
  );
}

function MarketDistributionComponent({ trades, loading }: MarketDistributionProps) {
  const data = useMemo(() => {
    const marketCounts = new Map<string, number>();

    trades.forEach((trade) => {
      const count = marketCounts.get(trade.market_type) || 0;
      marketCounts.set(trade.market_type, count + 1);
    });

    return Array.from(marketCounts.entries())
      .map(([market, count]) => ({
        name: MARKET_LABELS[market] || market,
        market,
        value: count,
        color: MARKET_COLORS[market] || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [trades]);

  if (loading) {
    return <MarketDistributionSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Market Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Market Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {total} trades across {data.length} market{data.length !== 1 ? "s" : ""}
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
                paddingAngle={2}
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
                  {total}
                </tspan>
                <tspan x="50%" dy="1.3em" className="fill-muted-foreground text-[10px]">
                  Trades
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

export const MarketDistribution = memo(MarketDistributionComponent);
MarketDistribution.displayName = "MarketDistribution";
