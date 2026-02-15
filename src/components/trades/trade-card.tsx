"use client";

import { memo } from "react";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";
import type { Trade } from "@/types";

interface TradeCardProps {
  trade: Trade;
  onEdit?: (trade: Trade) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

function TradeCardComponent({
  trade,
  onEdit,
  onDelete,
  className,
}: TradeCardProps) {
  const isProfit = (trade.profit_loss || 0) > 0;
  const isLoss = (trade.profit_loss || 0) < 0;
  const isPending = trade.status === "open";

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Direction indicator */}
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                trade.direction === "long"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              )}
            >
              {trade.direction === "long" ? (
                <ArrowUpRight
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={1.5}
                />
              ) : (
                <ArrowDownRight
                  className="h-5 w-5 text-red-600 dark:text-red-400"
                  strokeWidth={1.5}
                />
              )}
            </div>

            {/* Symbol and market */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{trade.symbol}</span>
                <Badge variant="secondary" className="text-xs">
                  {trade.market_type}
                </Badge>
                {isPending && (
                  <Badge variant="outline" className="text-xs">
                    Open
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(trade.trade_date), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(trade)}>
                <Edit className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(trade.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Trade details */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Entry</p>
            <p className="font-medium">
              {formatCurrency(trade.entry_price, trade.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Exit</p>
            <p className="font-medium">
              {trade.exit_price
                ? formatCurrency(trade.exit_price, trade.currency)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium">{trade.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">P&L</p>
            {trade.profit_loss !== null ? (
              <div className="flex items-center gap-1">
                {isProfit ? (
                  <TrendingUp
                    className="h-4 w-4 text-emerald-500"
                    strokeWidth={1.5}
                  />
                ) : isLoss ? (
                  <TrendingDown
                    className="h-4 w-4 text-red-500"
                    strokeWidth={1.5}
                  />
                ) : null}
                <span
                  className={cn(
                    "font-semibold",
                    isProfit && "text-emerald-600 dark:text-emerald-400",
                    isLoss && "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatCurrency(trade.profit_loss, trade.currency)}
                </span>
              </div>
            ) : (
              <span className="font-medium text-muted-foreground">—</span>
            )}
          </div>
        </div>

        {/* Setup/Notes preview */}
        {(trade.setup || trade.notes) && (
          <div className="mt-4 border-t pt-4">
            {trade.setup && (
              <Badge variant="outline" className="mr-2">
                {trade.setup}
              </Badge>
            )}
            {trade.notes && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {trade.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const TradeCard = memo(TradeCardComponent);
TradeCard.displayName = "TradeCard";
