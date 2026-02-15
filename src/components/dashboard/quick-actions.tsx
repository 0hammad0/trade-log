"use client";

import { memo } from "react";
import Link from "next/link";
import { Plus, BookOpen, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Add Trade",
    description: "Log a new trade",
    href: "/trades",
    icon: Plus,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 dark:from-indigo-500/30 dark:to-indigo-600/20",
  },
  {
    title: "Journal",
    description: "Write an entry",
    href: "/journal",
    icon: BookOpen,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-gradient-to-br from-violet-500/20 to-violet-600/10 dark:from-violet-500/30 dark:to-violet-600/20",
  },
  {
    title: "Analytics",
    description: "View performance",
    href: "/analytics",
    icon: BarChart3,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/30 dark:to-emerald-600/20",
  },
  {
    title: "Settings",
    description: "Manage account",
    href: "/settings",
    icon: Settings,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-gradient-to-br from-slate-500/20 to-slate-600/10 dark:from-slate-500/30 dark:to-slate-600/20",
  },
];

function QuickActionsComponent() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-transparent bg-accent/50 p-3 transition-all duration-300 hover:border-border hover:bg-accent hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                  action.bgColor,
                  action.color
                )}
              >
                <action.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const QuickActions = memo(QuickActionsComponent);
QuickActions.displayName = "QuickActions";
