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
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Journal",
    description: "Write an entry",
    href: "/journal",
    icon: BookOpen,
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Analytics",
    description: "View performance",
    href: "/analytics",
    icon: BarChart3,
    color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    title: "Settings",
    description: "Manage account",
    href: "/settings",
    icon: Settings,
    color: "text-gray-500 bg-gray-100 dark:bg-gray-900/30",
  },
];

function QuickActionsComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:bg-accent hover:shadow-sm"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                  action.color
                )}
              >
                <action.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium">{action.title}</p>
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
