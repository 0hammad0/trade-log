"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { tradeFormSchema, type TradeFormValues, type TradeFormInput } from "@/lib/validations/trade";
import { MARKETS, CURRENCIES, DIRECTIONS, TRADE_STATUSES } from "@/constants/markets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ImageUpload } from "./image-upload";
import { SymbolCombobox } from "./symbol-combobox";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";
import type { Symbol } from "@/hooks/use-symbols";

interface TradeFormProps {
  trade?: Trade;
  onSubmit: (values: TradeFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  formId?: string;
  hideFooter?: boolean;
  symbols?: Symbol[];
}

export function TradeForm({
  trade,
  onSubmit,
  onCancel,
  loading = false,
  formId,
  hideFooter = false,
  symbols = [],
}: TradeFormProps) {
  const form = useForm<TradeFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tradeFormSchema) as any,
    defaultValues: {
      symbol: trade?.symbol || "",
      market_type: trade?.market_type || "crypto",
      currency: trade?.currency || "USD",
      direction: trade?.direction || "long",
      entry_price: trade?.entry_price || undefined,
      exit_price: trade?.exit_price || undefined,
      quantity: trade?.quantity || 1,
      lot_size: trade?.lot_size || undefined,
      account_size: trade?.account_size || undefined,
      stop_loss: trade?.stop_loss || undefined,
      take_profit: trade?.take_profit || undefined,
      status: trade?.status || "open",
      manual_pnl: trade?.profit_loss || undefined,
      setup: trade?.setup || "",
      notes: trade?.notes || "",
      image_urls: trade?.image_urls || [],
      trade_date: trade?.trade_date?.split("T")[0] || format(new Date(), "yyyy-MM-dd"),
      exit_date: trade?.exit_date?.split("T")[0] || undefined,
    },
  });

  const watchStatus = form.watch("status");

  useEffect(() => {
    if (watchStatus === "closed" && !form.getValues("exit_date")) {
      form.setValue("exit_date", format(new Date(), "yyyy-MM-dd"));
    }
  }, [watchStatus, form]);

  const handleSubmit = async (values: TradeFormInput) => {
    // Values are validated by zod, safe to cast
    await onSubmit(values as TradeFormValues);
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        {/* Row 1: Symbol, Market Type, Currency */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <SymbolCombobox
                    value={field.value}
                    onChange={field.onChange}
                    symbols={symbols}
                    disabled={loading}
                    placeholder="Search or add..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="market_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Market</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MARKETS.map((market) => (
                      <SelectItem key={market.value} value={market.value}>
                        {market.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.symbol} {currency.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Direction, Status */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIRECTIONS.map((dir) => (
                      <SelectItem key={dir.value} value={dir.value}>
                        {dir.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TRADE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Entry, Exit, Lot Size */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <FormField
            control={form.control}
            name="entry_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lot_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lot Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : parseFloat(val));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Account Size, Stop Loss, Take Profit */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <FormField
            control={form.control}
            name="account_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="10000"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stop_loss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stop Loss</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="take_profit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Take Profit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: Trade Date, Exit Date, P&L (when closed) */}
        <div className={cn("grid gap-2 sm:gap-3", watchStatus === "closed" ? "grid-cols-3" : "grid-cols-2")}>
          <FormField
            control={form.control}
            name="trade_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs sm:text-sm">Trade Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-2 pr-1 text-left font-normal text-xs sm:text-sm sm:pl-3 sm:pr-3",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "MMM d, yy")
                        ) : (
                          <span>Pick</span>
                        )}
                        <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exit_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs sm:text-sm">Exit Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-2 pr-1 text-left font-normal text-xs sm:text-sm sm:pl-3 sm:pr-3",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "MMM d, yy")
                        ) : (
                          <span>Pick</span>
                        )}
                        <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)
                      }
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {watchStatus === "closed" && (
            <FormField
              control={form.control}
              name="manual_pnl"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs sm:text-sm">P&L</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Auto"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : parseFloat(val));
                      }}
                      className="text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Row 6: Setup */}
        <FormField
          control={form.control}
          name="setup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setup / Strategy</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Breakout, VWAP bounce, Support test"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 7: Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="What did you observe? Any lessons learned?"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 8: Screenshots */}
        <FormField
          control={form.control}
          name="image_urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Screenshots</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ?? []}
                  onChange={field.onChange}
                  maxImages={4}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Max 4 images, 5MB each
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions - only show if not hidden (for standalone use) */}
        {!hideFooter && (
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {trade ? "Update Trade" : "Add Trade"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
