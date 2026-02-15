"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOODS } from "@/constants/markets";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

function JournalEntryCardComponent({
  entry,
  onEdit,
  onDelete,
  className,
}: JournalEntryCardProps) {
  const mood = MOODS.find((m) => m.value === entry.mood);

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          {mood && (
            <span className="text-2xl" title={mood.label}>
              {mood.emoji}
            </span>
          )}
          <div>
            <p className="font-semibold">
              {entry.title || format(new Date(entry.entry_date), "EEEE")}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(entry.entry_date), "MMMM d, yyyy")}
            </p>
          </div>
        </div>

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
            <DropdownMenuItem onClick={() => onEdit?.(entry)}>
              <Edit className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(entry.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.content}
        </p>
      </CardContent>
    </Card>
  );
}

export const JournalEntryCard = memo(JournalEntryCardComponent);
JournalEntryCard.displayName = "JournalEntryCard";
