import { z } from 'zod';

export const journalEntrySchema = z.object({
  title: z.string().max(200, 'Title too long').optional().nullable(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  mood: z.enum(['great', 'good', 'neutral', 'bad', 'terrible']).optional().nullable(),
  image_urls: z.array(z.string().url()).optional().nullable(),
  entry_date: z.string().min(1, 'Date is required'),
});

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;
