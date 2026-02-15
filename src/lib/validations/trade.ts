import { z } from 'zod';

export const tradeFormSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20, 'Symbol too long'),
  market_type: z.enum(['stock', 'crypto', 'forex', 'futures']),
  currency: z.string().min(1, 'Currency is required'),
  direction: z.enum(['long', 'short']),
  entry_price: z.number().positive('Entry price must be positive'),
  exit_price: z.number().positive('Exit price must be positive').optional().nullable(),
  quantity: z.number().positive('Quantity must be positive').optional().default(1),
  lot_size: z.number().positive('Lot size must be positive').optional().nullable(),
  account_size: z.number().positive('Account size must be positive').optional().nullable(),
  stop_loss: z.number().positive('Stop loss must be positive').optional().nullable(),
  take_profit: z.number().positive('Take profit must be positive').optional().nullable(),
  status: z.enum(['open', 'closed', 'cancelled']),
  manual_pnl: z.number().optional().nullable(),
  setup: z.string().max(100, 'Setup name too long').optional().nullable(),
  notes: z.string().max(5000, 'Notes too long').optional().nullable(),
  image_urls: z.array(z.string().url()).optional().nullable(),
  trade_date: z.string().min(1, 'Trade date is required'),
  exit_date: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

// Input type for form - allows undefined for numeric fields
export type TradeFormInput = {
  symbol: string;
  market_type: 'stock' | 'crypto' | 'forex' | 'futures';
  currency: string;
  direction: 'long' | 'short';
  entry_price: number | undefined;
  exit_price: number | null | undefined;
  quantity?: number | undefined;
  lot_size: number | null | undefined;
  account_size: number | null | undefined;
  stop_loss: number | null | undefined;
  take_profit: number | null | undefined;
  status: 'open' | 'closed' | 'cancelled';
  manual_pnl: number | null | undefined;
  setup: string | null | undefined;
  notes: string | null | undefined;
  image_urls: string[] | null | undefined;
  trade_date: string;
  exit_date: string | null | undefined;
  tags?: string[];
};

export const tagFormSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(30, 'Tag name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;
