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
import { TradeForm } from "./trade-form";
import type { Trade } from "@/types";
import type { TradeFormValues } from "@/lib/validations/trade";
import type { Symbol } from "@/hooks/use-symbols";

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade?: Trade;
  onSubmit: (values: TradeFormValues) => Promise<void>;
  loading?: boolean;
  symbols?: Symbol[];
}

export function TradeDialog({
  open,
  onOpenChange,
  trade,
  onSubmit,
  loading,
  symbols = [],
}: TradeDialogProps) {
  const formId = useId();

  const handleSubmit = async (values: TradeFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-lg md:max-w-2xl lg:max-w-3xl"
      >
        {/* Fixed Header with shadow */}
        <DialogHeader className="relative z-10 flex-shrink-0 border-b bg-background px-4 py-3 shadow-sm sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg">{trade ? "Edit Trade" : "Add New Trade"}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="scrollbar-slim flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
          <TradeForm
            formId={formId}
            trade={trade}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            loading={loading}
            hideFooter
            symbols={symbols}
          />
        </div>

        {/* Fixed Footer with shadow */}
        <DialogFooter className="relative z-10 flex-shrink-0 border-t bg-background px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:px-6 sm:py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={loading} className="flex-1 sm:flex-none">
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {trade ? "Update Trade" : "Add Trade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
