"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const handleSubmit = async (values: JournalEntryFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Journal Entry" : "New Journal Entry"}
          </DialogTitle>
        </DialogHeader>
        <JournalEntryForm
          entry={entry}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
