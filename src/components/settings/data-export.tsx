"use client";

import { useState } from "react";
import { FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DataExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch all user data
      const [tradesRes, tagsRes, journalRes, profileRes] = await Promise.all([
        supabase.from("trades").select("*").order("trade_date", { ascending: false }),
        supabase.from("tags").select("*"),
        supabase.from("journal_entries").select("*").order("entry_date", { ascending: false }),
        supabase.from("profiles").select("*").single(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileRes.data,
        trades: tradesRes.data || [],
        tags: tagsRes.data || [],
        journalEntries: journalRes.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `tradelog_export_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download all your data as a JSON file for backup or migration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading}>
          {loading ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <FileJson className="mr-2 h-4 w-4" strokeWidth={1.5} />
          )}
          Export All Data
        </Button>
      </CardContent>
    </Card>
  );
}
