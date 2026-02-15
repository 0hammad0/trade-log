"use client";

import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";
import type { SymbolPerformance, SetupPerformance } from "@/types";

interface PerformanceTableProps {
  title: string;
  data: SymbolPerformance[] | SetupPerformance[];
  loading: boolean;
  currency?: string;
  type: "symbol" | "setup";
}

function PerformanceTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceTableComponent({
  title,
  data,
  loading,
  currency = "USD",
  type,
}: PerformanceTableProps) {
  if (loading) {
    return <PerformanceTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{type === "symbol" ? "Symbol" : "Setup"}</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Total P&L</TableHead>
                <TableHead className="text-right">Avg P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const name = type === "symbol"
                  ? (row as SymbolPerformance).symbol
                  : (row as SetupPerformance).setup;
                const isProfit = row.totalPnL > 0;
                const isLoss = row.totalPnL < 0;

                return (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-right">{row.trades}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          row.winRate >= 50
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {row.winRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        isProfit && "text-emerald-600 dark:text-emerald-400",
                        isLoss && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {formatCurrency(row.totalPnL, currency)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        row.averagePnL > 0 && "text-emerald-600 dark:text-emerald-400",
                        row.averagePnL < 0 && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {formatCurrency(row.averagePnL, currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export const PerformanceTable = memo(PerformanceTableComponent);
PerformanceTable.displayName = "PerformanceTable";
