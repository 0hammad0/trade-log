"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TradeForm } from "./trade-form";
import type { Trade } from "@/types";
import type { TradeFormValues } from "@/lib/validations/trade";

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade?: Trade;
  onSubmit: (values: TradeFormValues) => Promise<void>;
  loading?: boolean;
}

export function TradeDialog({
  open,
  onOpenChange,
  trade,
  onSubmit,
  loading,
}: TradeDialogProps) {
  const handleSubmit = async (values: TradeFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trade ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        </DialogHeader>
        <TradeForm
          trade={trade}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
