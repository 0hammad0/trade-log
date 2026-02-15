"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import type { TradeFormValues } from "@/lib/validations/trade";

interface CSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (trades: TradeFormValues[]) => Promise<void>;
}

interface ParsedRow {
  symbol?: string;
  market_type?: string;
  direction?: string;
  entry_price?: string;
  exit_price?: string;
  quantity?: string;
  stop_loss?: string;
  take_profit?: string;
  status?: string;
  setup?: string;
  notes?: string;
  trade_date?: string;
  exit_date?: string;
  currency?: string;
}

export function CSVImport({ open, onOpenChange, onImport }: CSVImportProps) {
  const [loading, setLoading] = useState(false);
  const [parsedTrades, setParsedTrades] = useState<TradeFormValues[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrors([]);
    setParsedTrades([]);

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const trades: TradeFormValues[] = [];
        const parseErrors: string[] = [];

        results.data.forEach((row, index) => {
          try {
            if (!row.symbol || !row.entry_price || !row.quantity || !row.trade_date) {
              parseErrors.push(`Row ${index + 1}: Missing required fields`);
              return;
            }

            const trade: TradeFormValues = {
              symbol: row.symbol.toUpperCase(),
              market_type: (row.market_type?.toLowerCase() as "stock" | "crypto" | "forex" | "futures") || "stock",
              currency: row.currency || "USD",
              direction: (row.direction?.toLowerCase() as "long" | "short") || "long",
              entry_price: parseFloat(row.entry_price),
              exit_price: row.exit_price ? parseFloat(row.exit_price) : undefined,
              quantity: parseFloat(row.quantity),
              stop_loss: row.stop_loss ? parseFloat(row.stop_loss) : undefined,
              take_profit: row.take_profit ? parseFloat(row.take_profit) : undefined,
              status: (row.status?.toLowerCase() as "open" | "closed" | "cancelled") || "open",
              setup: row.setup || undefined,
              notes: row.notes || undefined,
              trade_date: row.trade_date,
              exit_date: row.exit_date || undefined,
            };

            if (isNaN(trade.entry_price) || isNaN(trade.quantity)) {
              parseErrors.push(`Row ${index + 1}: Invalid numeric values`);
              return;
            }

            trades.push(trade);
          } catch {
            parseErrors.push(`Row ${index + 1}: Parse error`);
          }
        });

        setParsedTrades(trades);
        setErrors(parseErrors);
        setLoading(false);
      },
      error: (error) => {
        setErrors([error.message]);
        setLoading(false);
      },
    });
  }, []);

  const handleImport = async () => {
    if (parsedTrades.length === 0) return;

    setLoading(true);
    try {
      await onImport(parsedTrades);
      toast.success(`Imported ${parsedTrades.length} trades successfully`);
      onOpenChange(false);
      setParsedTrades([]);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import trades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Trades from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your trades. Required columns: symbol, entry_price, quantity, trade_date
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload */}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-accent/50">
            <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-medium">Click to upload CSV</p>
            <p className="text-xs text-muted-foreground">or drag and drop</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-sm text-muted-foreground">Processing...</span>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Errors found</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {errors.length > 5 && (
                  <li>... and {errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Success preview */}
          {parsedTrades.length > 0 && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">
                  {parsedTrades.length} trades ready to import
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from(new Set(parsedTrades.map((t) => t.symbol)))
                  .slice(0, 5)
                  .map((symbol) => (
                    <span
                      key={symbol}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
                    >
                      {symbol}
                    </span>
                  ))}
                {Array.from(new Set(parsedTrades.map((t) => t.symbol))).length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{Array.from(new Set(parsedTrades.map((t) => t.symbol))).length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Template download */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" strokeWidth={1.5} />
            <a
              href="/csv-template.csv"
              download
              className="underline-offset-4 hover:underline"
            >
              Download CSV template
            </a>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading || parsedTrades.length === 0}
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              Import {parsedTrades.length} Trades
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
