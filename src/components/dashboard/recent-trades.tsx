"use client";

import { memo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";
import type { Trade } from "@/types";

interface RecentTradesProps {
  trades: Trade[];
  loading: boolean;
}

function RecentTradesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentTradesComponent({ trades, loading }: RecentTradesProps) {
  if (loading) {
    return <RecentTradesSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Trades</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/trades">
            View all
            <ArrowRight className="ml-1 h-4 w-4" strokeWidth={1.5} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No trades yet
          </p>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => {
              const isProfit = (trade.profit_loss || 0) > 0;
              const isLoss = (trade.profit_loss || 0) < 0;

              return (
                <div key={trade.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      trade.direction === "long"
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    )}
                  >
                    {trade.direction === "long" ? (
                      <ArrowUpRight
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <ArrowDownRight
                        className="h-4 w-4 text-red-600 dark:text-red-400"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.symbol}</span>
                      <Badge variant="secondary" className="text-xs">
                        {trade.market_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(trade.trade_date), "MMM d")}
                    </p>
                  </div>
                  {trade.profit_loss !== null ? (
                    <span
                      className={cn(
                        "font-semibold",
                        isProfit && "text-emerald-600 dark:text-emerald-400",
                        isLoss && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {formatCurrency(trade.profit_loss, trade.currency)}
                    </span>
                  ) : (
                    <Badge variant="outline">Open</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const RecentTrades = memo(RecentTradesComponent);
RecentTrades.displayName = "RecentTrades";
