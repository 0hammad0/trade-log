"use client";

import { useState, useCallback } from "react";
import { Plus, Upload } from "lucide-react";
import { useTrades } from "@/hooks/use-trades";
import { useSymbols } from "@/hooks/use-symbols";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  TradeList,
  TradeDialog,
  TradeFilters,
  CSVImport,
  CSVExport,
} from "@/components/trades";
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
import type { Trade, TradeFilters as TradeFiltersType } from "@/types";
import type { TradeFormValues } from "@/lib/validations/trade";

export default function TradesPage() {
  const [filters, setFilters] = useState<TradeFiltersType>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  const {
    trades,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    createTrade,
    updateTrade,
    deleteTrade,
    refresh,
  } = useTrades(filters);

  const { symbols, addOrUpdateSymbol } = useSymbols();

  const handleCreateTrade = useCallback(async (values: TradeFormValues) => {
    setFormLoading(true);
    try {
      await createTrade(values);
      // Track symbol usage
      await addOrUpdateSymbol(values.symbol, values.market_type);
      toast.success("Trade added successfully", {
        description: `${values.symbol} ${values.direction} position`,
      });
    } catch (error) {
      console.error("Create trade error:", error);
      toast.error("Failed to add trade");
      throw error;
    } finally {
      setFormLoading(false);
    }
  }, [createTrade, addOrUpdateSymbol]);

  const handleUpdateTrade = useCallback(async (values: TradeFormValues) => {
    if (!editingTrade) return;
    setFormLoading(true);
    try {
      await updateTrade(editingTrade.id, values);
      // Track symbol usage
      await addOrUpdateSymbol(values.symbol, values.market_type);
      toast.success("Trade updated successfully");
      setEditingTrade(undefined);
    } catch (error) {
      console.error("Update trade error:", error);
      toast.error("Failed to update trade");
      throw error;
    } finally {
      setFormLoading(false);
    }
  }, [editingTrade, updateTrade, addOrUpdateSymbol]);

  const handleDeleteTrade = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteTrade(deleteId);
      toast.success("Trade deleted");
      setDeleteId(null);
    } catch (error) {
      console.error("Delete trade error:", error);
      toast.error("Failed to delete trade");
    }
  }, [deleteId, deleteTrade]);

  const handleImport = useCallback(async (trades: TradeFormValues[]) => {
    for (const trade of trades) {
      await createTrade(trade);
    }
    refresh();
  }, [createTrade, refresh]);

  const handleEdit = useCallback((trade: Trade) => {
    setEditingTrade(trade);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTrade(undefined);
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trades"
        description="Track and manage all your trades"
        action={
          <div className="flex gap-2">
            <CSVExport />
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="px-2 sm:px-3">
              <Upload className="h-4 w-4 sm:mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)} className="px-2 sm:px-3">
              <Plus className="h-4 w-4 sm:mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Add Trade</span>
            </Button>
          </div>
        }
      />

      <TradeFilters filters={filters} onFiltersChange={setFilters} />

      <TradeList
        trades={trades}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TradeDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        trade={editingTrade}
        onSubmit={editingTrade ? handleUpdateTrade : handleCreateTrade}
        loading={formLoading}
        symbols={symbols}
      />

      <CSVImport
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrade}
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
