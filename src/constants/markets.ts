import type { MarketType } from '@/types';

export const MARKETS: { value: MarketType; label: string; icon: string }[] = [
  { value: 'stock', label: 'Stocks', icon: 'TrendingUp' },
  { value: 'crypto', label: 'Crypto', icon: 'Bitcoin' },
  { value: 'forex', label: 'Forex', icon: 'DollarSign' },
  { value: 'futures', label: 'Futures', icon: 'BarChart3' },
];

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'BTC', label: 'Bitcoin', symbol: '₿' },
  { value: 'ETH', label: 'Ethereum', symbol: 'Ξ' },
];

export const DIRECTIONS = [
  { value: 'long', label: 'Long' },
  { value: 'short', label: 'Short' },
] as const;

export const TRADE_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const MOODS = [
  { value: 'great', label: 'Great', emoji: '😊', color: 'text-green-500' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'text-emerald-500' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-500' },
  { value: 'bad', label: 'Bad', emoji: '😕', color: 'text-orange-500' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'text-red-500' },
] as const;

export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
];

export function getCurrencySymbol(currency: string): string {
  const found = CURRENCIES.find((c) => c.value === currency);
  return found?.symbol || currency;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}
