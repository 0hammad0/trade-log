"use client";

import { useId } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { JournalEntryForm } from "./journal-entry-form";
import type { JournalEntry } from "@/types";
import type { JournalEntryFormValues } from "@/lib/validations/journal";

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry;
  onSubmit: (values: JournalEntryFormValues) => Promise<void>;
  loading?: boolean;
}

export function JournalDialog({
  open,
  onOpenChange,
  entry,
  onSubmit,
  loading,
}: JournalDialogProps) {
  const formId = useId();

  const handleSubmit = async (values: JournalEntryFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {/* Fixed Header with shadow */}
        <DialogHeader className="relative z-10 flex-shrink-0 border-b bg-background px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {entry ? "Edit Journal Entry" : "New Journal Entry"}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="scrollbar-slim flex-1 overflow-y-auto px-6 py-4">
          <JournalEntryForm
            formId={formId}
            entry={entry}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            loading={loading}
            hideFooter
          />
        </div>

        {/* Fixed Footer with shadow */}
        <DialogFooter className="relative z-10 flex-shrink-0 border-t bg-background px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={loading}>
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {entry ? "Update Entry" : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
