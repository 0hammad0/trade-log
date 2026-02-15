"use client";

import { memo, useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/types";

interface DateRangePickerProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

const presets = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
  { label: "Year to date", value: "ytd" },
  { label: "All time", value: "all" },
  { label: "Custom", value: "custom" },
];

function getPresetDates(preset: string): AnalyticsPeriod {
  const today = new Date();

  switch (preset) {
    case "7d":
      return {
        startDate: format(subDays(today, 7), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "30d":
      return {
        startDate: format(subDays(today, 30), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "90d":
      return {
        startDate: format(subDays(today, 90), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "this-month":
      return {
        startDate: format(startOfMonth(today), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "last-month":
      const lastMonth = subMonths(today, 1);
      return {
        startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    case "ytd":
      return {
        startDate: format(startOfYear(today), "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      };
    case "all":
    default:
      return {
        startDate: "2020-01-01",
        endDate: format(today, "yyyy-MM-dd"),
      };
  }
}

function DateRangePickerComponent({ period, onPeriodChange }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState("30d");

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== "custom") {
      onPeriodChange(getPresetDates(preset));
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset === "custom" && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !period.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {period.startDate
                  ? format(new Date(period.startDate), "MMM d, yyyy")
                  : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={period.startDate ? new Date(period.startDate) : undefined}
                onSelect={(date) =>
                  date &&
                  onPeriodChange({
                    ...period,
                    startDate: format(date, "yyyy-MM-dd"),
                  })
                }
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !period.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {period.endDate
                  ? format(new Date(period.endDate), "MMM d, yyyy")
                  : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={period.endDate ? new Date(period.endDate) : undefined}
                onSelect={(date) =>
                  date &&
                  onPeriodChange({
                    ...period,
                    endDate: format(date, "yyyy-MM-dd"),
                  })
                }
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

export const DateRangePicker = memo(DateRangePickerComponent);
DateRangePicker.displayName = "DateRangePicker";
