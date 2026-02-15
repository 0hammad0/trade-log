"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { MARKETS, DIRECTIONS, TRADE_STATUSES } from "@/constants/markets";
import type { TradeFilters as TradeFiltersType } from "@/types";

interface TradeFiltersProps {
  filters: TradeFiltersType;
  onFiltersChange: (filters: TradeFiltersType) => void;
}

function TradeFiltersComponent({ filters, onFiltersChange }: TradeFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.symbol || "");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== filters.symbol) {
        onFiltersChange({ ...filters, symbol: searchValue || undefined });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    setSearchValue("");
    onFiltersChange({});
  }, [onFiltersChange]);

  const activeFilterCount = [
    filters.marketType,
    filters.direction,
    filters.status,
    filters.symbol,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by symbol..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Trades</h4>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Market</label>
              <Select
                value={filters.marketType || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    marketType: value === "all" ? undefined : (value as TradeFiltersType["marketType"]),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All markets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All markets</SelectItem>
                  {MARKETS.map((market) => (
                    <SelectItem key={market.value} value={market.value}>
                      {market.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Direction</label>
              <Select
                value={filters.direction || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    direction: value === "all" ? undefined : (value as TradeFiltersType["direction"]),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All directions</SelectItem>
                  {DIRECTIONS.map((dir) => (
                    <SelectItem key={dir.value} value={dir.value}>
                      {dir.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value === "all" ? undefined : (value as TradeFiltersType["status"]),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {TRADE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const TradeFilters = memo(TradeFiltersComponent);
TradeFilters.displayName = "TradeFilters";
