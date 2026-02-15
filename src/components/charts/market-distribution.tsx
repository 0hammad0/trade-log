"use client";

import { memo, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@/types";

interface MarketDistributionProps {
  trades: Trade[];
  loading: boolean;
}

const COLORS = [
  "#3b82f6", // blue - stocks
  "#f59e0b", // amber - crypto
  "#10b981", // emerald - forex
  "#8b5cf6", // violet - futures
];

const MARKET_LABELS: Record<string, string> = {
  stock: "Stocks",
  crypto: "Crypto",
  forex: "Forex",
  futures: "Futures",
};

function MarketDistributionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" />
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
      .map(([market, count], index) => ({
        name: MARKET_LABELS[market] || market,
        value: count,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [trades]);

  if (loading) {
    return <MarketDistributionSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No trades yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload;
                const percentage = ((data.value / total) * 100).toFixed(1);
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{data.name}</p>
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
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const MarketDistribution = memo(MarketDistributionComponent);
MarketDistribution.displayName = "MarketDistribution";
