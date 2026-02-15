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
  data: { day: string; pnl: number; trades: number }[];
  loading: boolean;
  currency?: string;
}

function DayOfWeekChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Day of Week</CardTitle>
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
          <CardTitle>Performance by Day of Week</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={weekdayData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
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
                    <p className="font-medium">{data.day}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.trades} trades
                    </p>
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
