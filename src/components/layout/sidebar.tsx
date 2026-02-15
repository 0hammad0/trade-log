"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  BarChart3,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trades", href: "/trades", icon: LineChart },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

function SidebarComponent({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/25">
          <TrendingUp className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight">Trade Log</span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Trading Journal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-xl bg-gradient-to-r from-accent to-accent/50 p-3">
          <p className="text-xs font-medium text-foreground">Pro Tip</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Log trades consistently to improve your win rate
          </p>
        </div>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
Sidebar.displayName = "Sidebar";
