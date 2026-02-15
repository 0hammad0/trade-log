"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, TrendingUp } from "lucide-react";
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trades", href: "/trades", icon: LineChart },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

function MobileNavComponent() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-16 flex-row items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <SheetTitle className="text-lg font-semibold">Trade Log</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SheetClose key={item.name} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  {item.name}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export const MobileNav = memo(MobileNavComponent);
MobileNav.displayName = "MobileNav";
