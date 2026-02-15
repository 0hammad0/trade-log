"use client";

import { memo } from "react";
import { LineChart } from "lucide-react";
import { TradeCard } from "./trade-card";
import { ScrollLoader } from "@/components/shared/scroll-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@/types";

interface TradeListProps {
  trades: Trade[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

function TradeListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TradeListComponent({
  trades,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
}: TradeListProps) {
  if (loading) {
    return <TradeListSkeleton />;
  }

  if (trades.length === 0) {
    return (
      <EmptyState
        icon={LineChart}
        title="No trades yet"
        description="Start logging your trades to track your performance and improve your strategy."
      />
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <TradeCard
          key={trade.id}
          trade={trade}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <ScrollLoader
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loading={loadingMore}
      />
    </div>
  );
}

export const TradeList = memo(TradeListComponent);
TradeList.displayName = "TradeList";
