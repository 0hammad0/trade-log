"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Symbol } from "@/hooks/use-symbols";

interface SymbolComboboxProps {
  value: string;
  onChange: (value: string) => void;
  symbols: Symbol[];
  disabled?: boolean;
  placeholder?: string;
}

export function SymbolCombobox({
  value,
  onChange,
  symbols,
  disabled = false,
  placeholder = "Search or add symbol...",
}: SymbolComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredSymbols = useMemo(() => {
    if (!search.trim()) {
      return symbols.slice(0, 15);
    }

    const upperSearch = search.toUpperCase();
    return symbols.filter(s =>
      s.symbol.includes(upperSearch)
    ).slice(0, 15);
  }, [symbols, search]);

  const exactMatch = useMemo(() => {
    if (!search.trim()) return null;
    const upperSearch = search.toUpperCase();
    return symbols.find(s => s.symbol === upperSearch);
  }, [symbols, search]);

  const showAddOption = search.trim() && !exactMatch;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue.toUpperCase());
    setOpen(false);
    setSearch("");
  };

  const handleAddNew = () => {
    if (search.trim()) {
      onChange(search.toUpperCase().trim());
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? (
            <span className="font-medium uppercase">{value}</span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[200] w-[--radix-popover-trigger-width] p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search symbol..."
            value={search}
            onValueChange={setSearch}
            className="uppercase"
          />
          <CommandList className="scrollbar-slim">
            {/* Add new option */}
            {showAddOption && (
              <>
                <CommandGroup>
                  <CommandItem
                    value={`add-${search}`}
                    onSelect={handleAddNew}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    <span>Add </span>
                    <span className="ml-1 font-semibold uppercase">{search.toUpperCase()}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      New
                    </Badge>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Recent/Search results */}
            <CommandGroup heading={search ? "Results" : "Recent"}>
              {filteredSymbols.length === 0 && !showAddOption ? (
                <CommandEmpty>No symbols found.</CommandEmpty>
              ) : (
                filteredSymbols.map((symbol) => (
                  <CommandItem
                    key={symbol.id}
                    value={symbol.symbol}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.toUpperCase() === symbol.symbol
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{symbol.symbol}</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {symbol.market_type}
                    </Badge>
                    {!search && (
                      <span className="ml-auto flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {symbol.use_count}
                      </span>
                    )}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
