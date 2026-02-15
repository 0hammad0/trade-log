"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const themes = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light mode for daytime use",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark mode for nighttime use",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follow your system settings",
  },
];

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how Trade Log looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:bg-accent",
                theme === t.value
                  ? "border-primary bg-primary/5"
                  : "border-transparent"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  theme === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <t.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
