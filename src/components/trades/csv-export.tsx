"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Trade } from "@/types";

export function CSVExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: trades, error } = await supabase
        .from("trades")
        .select("*")
        .order("trade_date", { ascending: false });

      if (error) throw error;

      if (!trades || trades.length === 0) {
        toast.error("No trades to export");
        return;
      }

      // Format trades for CSV
      const csvData = trades.map((trade: Trade) => ({
        symbol: trade.symbol,
        market_type: trade.market_type,
        currency: trade.currency,
        direction: trade.direction,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price || "",
        quantity: trade.quantity,
        stop_loss: trade.stop_loss || "",
        take_profit: trade.take_profit || "",
        status: trade.status,
        profit_loss: trade.profit_loss || "",
        profit_loss_percent: trade.profit_loss_percent || "",
        risk_reward: trade.risk_reward || "",
        setup: trade.setup || "",
        notes: trade.notes || "",
        trade_date: trade.trade_date,
        exit_date: trade.exit_date || "",
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `trades_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${trades.length} trades`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export trades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : (
        <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
      )}
      Export
    </Button>
  );
}
