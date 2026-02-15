"use client";

import { memo } from "react";
import { BookOpen } from "lucide-react";
import { JournalEntryCard } from "./journal-entry-card";
import { ScrollLoader } from "@/components/shared/scroll-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { JournalEntry } from "@/types";

interface JournalListProps {
  entries: JournalEntry[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

function JournalListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function JournalListComponent({
  entries,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
}: JournalListProps) {
  if (loading) {
    return <JournalListSkeleton />;
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No journal entries yet"
        description="Start journaling to track your trading psychology, emotions, and lessons learned."
      />
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <JournalEntryCard
          key={entry.id}
          entry={entry}
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

export const JournalList = memo(JournalListComponent);
JournalList.displayName = "JournalList";
