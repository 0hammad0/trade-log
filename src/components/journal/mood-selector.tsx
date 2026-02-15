"use client";

import { memo } from "react";
import { MOODS } from "@/constants/markets";
import { cn } from "@/lib/utils";
import type { MoodType } from "@/types";

interface MoodSelectorProps {
  value?: MoodType | null;
  onChange: (mood: MoodType | null) => void;
  className?: string;
}

function MoodSelectorComponent({ value, onChange, className }: MoodSelectorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(value === mood.value ? null : mood.value)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all duration-200",
            value === mood.value
              ? "scale-110 bg-primary/10 ring-2 ring-primary"
              : "bg-muted hover:bg-accent hover:scale-105"
          )}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}

export const MoodSelector = memo(MoodSelectorComponent);
MoodSelector.displayName = "MoodSelector";
