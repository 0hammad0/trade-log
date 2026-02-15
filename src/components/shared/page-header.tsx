"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function PageHeaderComponent({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            {title}
          </span>
        </h1>
        {description && (
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}

export const PageHeader = memo(PageHeaderComponent);
PageHeader.displayName = "PageHeader";
