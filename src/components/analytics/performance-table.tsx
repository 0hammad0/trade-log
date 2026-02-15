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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
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

  // Only show top 5 entries to keep it compact
  const displayData = data.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top {Math.min(5, data.length)} of {data.length}
        </p>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No data available
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 text-xs">{type === "symbol" ? "Symbol" : "Setup"}</TableHead>
                  <TableHead className="h-8 text-right text-xs">#</TableHead>
                  <TableHead className="h-8 text-right text-xs">Win%</TableHead>
                  <TableHead className="h-8 text-right text-xs">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((row) => {
                  const name = type === "symbol"
                    ? (row as SymbolPerformance).symbol
                    : (row as SetupPerformance).setup;
                  const isProfit = row.totalPnL > 0;
                  const isLoss = row.totalPnL < 0;

                  return (
                    <TableRow key={name} className="hover:bg-muted/50">
                      <TableCell className="py-2 text-sm font-medium">
                        <span className="max-w-[80px] truncate block sm:max-w-none">
                          {name}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-right text-sm">{row.trades}</TableCell>
                      <TableCell className="py-2 text-right text-sm">
                        <span
                          className={cn(
                            row.winRate >= 50
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {row.winRate.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-2 text-right text-sm font-medium",
                          isProfit && "text-emerald-600 dark:text-emerald-400",
                          isLoss && "text-red-600 dark:text-red-400"
                        )}
                      >
                        {formatCurrency(row.totalPnL, currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const PerformanceTable = memo(PerformanceTableComponent);
PerformanceTable.displayName = "PerformanceTable";
