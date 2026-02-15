"use client";

import { memo } from "react";
import { format } from "date-fns";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Calendar,
  ZoomIn,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/constants/markets";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
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
  const isOpen = trade.status === "open";
  const isCancelled = trade.status === "cancelled";
  const positionSize = trade.entry_price * (trade.lot_size || trade.quantity || 1);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
        className
      )}
    >
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          isOpen && "bg-blue-500",
          isCancelled && "bg-gray-400",
          !isOpen && !isCancelled && isProfit && "bg-emerald-500",
          !isOpen && !isCancelled && isLoss && "bg-red-500",
          !isOpen && !isCancelled && !isProfit && !isLoss && "bg-gray-400"
        )}
      />

      <CardContent className="p-3 pl-4 sm:p-4 sm:pl-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Direction indicator */}
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10",
                trade.direction === "long"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              )}
            >
              {trade.direction === "long" ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" strokeWidth={2} />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 sm:h-5 sm:w-5" strokeWidth={2} />
              )}
            </div>

            {/* Symbol and meta */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-sm font-bold sm:text-base">{trade.symbol}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-4 px-1 text-[9px] font-medium uppercase sm:h-5 sm:px-1.5 sm:text-[10px]",
                    trade.direction === "long"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {trade.direction}
                </Badge>
                <Badge variant="outline" className="h-4 px-1 text-[9px] sm:h-5 sm:px-1.5 sm:text-[10px]">
                  {trade.market_type}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-[11px]">
                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="sm:hidden">{format(new Date(trade.trade_date), "MMM d, h:mm a")}</span>
                <span className="hidden sm:inline">{format(new Date(trade.trade_date), "MMM d, yyyy h:mm a")}</span>
              </div>
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            <Badge
              variant={isOpen ? "default" : isCancelled ? "secondary" : "outline"}
              className={cn(
                "h-5 text-[10px] sm:h-6 sm:text-[11px]",
                isOpen && "bg-blue-500 hover:bg-blue-500",
                !isOpen && !isCancelled && isProfit && "border-emerald-500 text-emerald-600",
                !isOpen && !isCancelled && isLoss && "border-red-500 text-red-600"
              )}
            >
              {trade.status === "open" ? "Open" : trade.status === "closed" ? "Closed" : "Cancelled"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(trade)}>
                  <Edit className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(trade.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* P&L Row - separate on mobile for closed trades */}
        {trade.status === "closed" && trade.profit_loss !== null && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                "text-base font-bold sm:text-lg",
                isProfit && "text-emerald-600 dark:text-emerald-400",
                isLoss && "text-red-600 dark:text-red-400"
              )}
            >
              {isProfit ? "+" : ""}{formatCurrency(trade.profit_loss, trade.currency)}
            </span>
            {trade.profit_loss_percent !== null && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isProfit && "text-emerald-600 dark:text-emerald-400",
                  isLoss && "text-red-600 dark:text-red-400"
                )}
              >
                ({isProfit ? "+" : ""}{trade.profit_loss_percent.toFixed(1)}%)
              </span>
            )}
          </div>
        )}

        {/* Main content - 2 column layout on large screens */}
        <div className="mt-2 flex flex-col gap-2 sm:mt-3 sm:gap-3 lg:flex-row lg:gap-6">
          {/* Left: Metrics */}
          <div className="flex-1 min-w-0">
            {/* Metrics grid - compact */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-2 lg:grid-cols-6">
              <div>
                <p className="text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">Entry</p>
                <p className="text-xs font-semibold sm:text-sm">{formatCurrency(trade.entry_price, trade.currency)}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">Exit</p>
                <p className="text-xs font-semibold sm:text-sm">
                  {trade.exit_price ? formatCurrency(trade.exit_price, trade.currency) : "—"}
                </p>
              </div>
              {trade.lot_size && (
                <div>
                  <p className="text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">Lot</p>
                  <p className="text-xs font-semibold sm:text-sm">{trade.lot_size}</p>
                </div>
              )}
              {trade.account_size && (
                <div>
                  <p className="text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">Account</p>
                  <p className="text-xs font-semibold sm:text-sm">{formatCurrency(trade.account_size, trade.currency)}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">Size</p>
                <p className="text-xs font-semibold sm:text-sm">{formatCurrency(positionSize, trade.currency)}</p>
              </div>
              {trade.stop_loss && (
                <div>
                  <p className="flex items-center gap-0.5 text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">
                    <ShieldAlert className="h-2 w-2 text-red-500 sm:h-2.5 sm:w-2.5" />SL
                  </p>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 sm:text-sm">
                    {formatCurrency(trade.stop_loss, trade.currency)}
                  </p>
                </div>
              )}
              {trade.take_profit && (
                <div>
                  <p className="flex items-center gap-0.5 text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">
                    <Target className="h-2 w-2 text-emerald-500 sm:h-2.5 sm:w-2.5" />TP
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:text-sm">
                    {formatCurrency(trade.take_profit, trade.currency)}
                  </p>
                </div>
              )}
              {trade.risk_reward !== null && trade.risk_reward !== undefined && (
                <div>
                  <p className="text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">R:R</p>
                  <p className="text-xs font-semibold sm:text-sm">1:{trade.risk_reward.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Setup and Notes - inline */}
            {(trade.setup || trade.notes) && (
              <div className="mt-2 flex flex-col gap-1 sm:mt-3 sm:gap-1.5">
                {trade.setup && (
                  <div className="flex items-start gap-1.5">
                    <span className="flex-shrink-0 text-[9px] font-medium uppercase text-muted-foreground sm:text-[10px]">Setup:</span>
                    <Badge variant="secondary" className="h-auto whitespace-normal text-[10px] font-medium leading-tight sm:text-xs">
                      {trade.setup}
                    </Badge>
                  </div>
                )}
                {trade.notes && (
                  <RichTextDisplay content={trade.notes} truncate className="text-[11px] text-muted-foreground sm:text-xs" />
                )}
              </div>
            )}
          </div>

          {/* Right: Images */}
          {trade.image_urls && trade.image_urls.length > 0 && (
            <div className="flex gap-1 sm:gap-1.5 lg:flex-col">
              {trade.image_urls.map((url, index) => (
                <Dialog key={url}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="group/img relative h-12 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted transition-all hover:border-primary hover:shadow-md sm:h-16 sm:w-24 sm:rounded-md lg:h-14 lg:w-20"
                    >
                      <Image
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover/img:scale-105"
                        sizes="96px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/img:bg-black/30">
                        <ZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover/img:opacity-100" />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="!h-[90vh] !max-h-[90vh] !w-[95vw] !max-w-[95vw] overflow-hidden border-0 bg-transparent p-0 shadow-none sm:!max-w-[95vw]"
                    showCloseButton={false}
                  >
                    <DialogTitle className="sr-only">
                      Screenshot {index + 1} of {trade.image_urls?.length}
                    </DialogTitle>
                    <DialogClose asChild>
                      <button
                        type="button"
                        className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-105"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </DialogClose>
                    <div className="flex h-[90vh] w-full items-center justify-center p-4">
                      <Image
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        width={1920}
                        height={1080}
                        className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                        sizes="95vw"
                        priority
                      />
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      {index + 1} / {trade.image_urls?.length}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const TradeCard = memo(TradeCardComponent);
TradeCard.displayName = "TradeCard";
