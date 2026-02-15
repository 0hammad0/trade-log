"use client";

import { memo } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Edit, Trash2, MoreHorizontal, ZoomIn, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { MOODS } from "@/constants/markets";
import { cn } from "@/lib/utils";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
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
      <CardContent className="space-y-3">
        <RichTextDisplay content={entry.content} />

        {/* Images */}
        {entry.image_urls && entry.image_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {entry.image_urls.map((url, index) => (
              <Dialog key={url}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group/img relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted transition-all hover:border-primary hover:shadow-md sm:h-20 sm:w-32"
                  >
                    <Image
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      className="object-cover transition-transform group-hover/img:scale-105"
                      sizes="128px"
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
                    Screenshot {index + 1} of {entry.image_urls?.length}
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
                    {index + 1} / {entry.image_urls?.length}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const JournalEntryCard = memo(JournalEntryCardComponent);
JournalEntryCard.displayName = "JournalEntryCard";
