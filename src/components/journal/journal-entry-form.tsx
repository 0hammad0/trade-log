"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { journalEntrySchema, type JournalEntryFormValues } from "@/lib/validations/journal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MoodSelector } from "./mood-selector";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import type { JournalEntry, MoodType } from "@/types";

interface JournalEntryFormProps {
  entry?: JournalEntry;
  onSubmit: (values: JournalEntryFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function JournalEntryForm({
  entry,
  onSubmit,
  onCancel,
  loading = false,
}: JournalEntryFormProps) {
  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: entry?.title || "",
      content: entry?.content || "",
      mood: entry?.mood as MoodType || undefined,
      entry_date: entry?.entry_date || format(new Date(), "yyyy-MM-dd"),
    },
  });

  const handleSubmit = async (values: JournalEntryFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Date */}
        <FormField
          control={form.control}
          name="entry_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal sm:w-[280px]",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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

        {/* Mood */}
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How are you feeling?</FormLabel>
              <FormControl>
                <MoodSelector
                  value={field.value as MoodType | null}
                  onChange={(mood) => field.onChange(mood)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Great trading day, Lessons learned..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Journal Entry</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write about your trading day, market observations, lessons learned, emotions, and thoughts..."
                  className="min-h-[200px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {entry ? "Update Entry" : "Save Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
