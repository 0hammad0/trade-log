"use client";

import { memo } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorStateComponent({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">
          Try again
        </Button>
      )}
    </div>
  );
}

export const ErrorState = memo(ErrorStateComponent);
ErrorState.displayName = "ErrorState";
