"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useJournal } from "@/hooks/use-journal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { JournalList, JournalDialog } from "@/components/journal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { JournalEntry } from "@/types";
import type { JournalEntryFormValues } from "@/lib/validations/journal";

export default function JournalPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  const {
    entries,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useJournal();

  const handleCreateEntry = useCallback(async (values: JournalEntryFormValues) => {
    setFormLoading(true);
    try {
      await createEntry(values);
      toast.success("Journal entry saved");
    } catch (error) {
      console.error("Create entry error:", error);
      toast.error("Failed to save entry");
      throw error;
    } finally {
      setFormLoading(false);
    }
  }, [createEntry]);

  const handleUpdateEntry = useCallback(async (values: JournalEntryFormValues) => {
    if (!editingEntry) return;
    setFormLoading(true);
    try {
      await updateEntry(editingEntry.id, values);
      toast.success("Entry updated");
      setEditingEntry(undefined);
    } catch (error) {
      console.error("Update entry error:", error);
      toast.error("Failed to update entry");
      throw error;
    } finally {
      setFormLoading(false);
    }
  }, [editingEntry, updateEntry]);

  const handleDeleteEntry = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteEntry(deleteId);
      toast.success("Entry deleted");
      setDeleteId(null);
    } catch (error) {
      console.error("Delete entry error:", error);
      toast.error("Failed to delete entry");
    }
  }, [deleteId, deleteEntry]);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingEntry(undefined);
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal"
        description="Document your trading journey, emotions, and lessons learned"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
            New Entry
          </Button>
        }
      />

      <JournalList
        entries={entries}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <JournalDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        entry={editingEntry}
        onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
        loading={formLoading}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
