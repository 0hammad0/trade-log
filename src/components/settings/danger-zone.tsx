"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DangerZone() {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Delete all user data (RLS will handle cascading)
      await Promise.all([
        supabase.from("trades").delete().eq("user_id", user.id),
        supabase.from("tags").delete().eq("user_id", user.id),
        supabase.from("journal_entries").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("id", user.id),
      ]);

      // Sign out
      await supabase.auth.signOut();

      toast.success("Account deleted");
      router.push("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
          <CardTitle>Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Irreversible actions that will permanently affect your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data including:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>All trades and trading history</li>
                  <li>All journal entries</li>
                  <li>All tags and settings</li>
                  <li>Your profile information</li>
                </ul>
                <p>
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={confirmText !== "DELETE" || loading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
