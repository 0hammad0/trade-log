export type MarketType = 'stock' | 'crypto' | 'forex' | 'futures';
export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed' | 'cancelled';
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  market_type: MarketType;
  currency: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  lot_size: number | null;
  account_size: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  status: TradeStatus;
  profit_loss: number | null;
  profit_loss_percent: number | null;
  risk_percent: number | null;
  risk_reward: number | null;
  setup: string | null;
  notes: string | null;
  image_urls: string[] | null;
  trade_date: string;
  exit_date: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TradeTag {
  trade_id: string;
  tag_id: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: MoodType | null;
  image_urls: string[] | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  averageRiskReward: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  openTrades: number;
}

export interface TradeFilters {
  symbol?: string;
  marketType?: MarketType;
  direction?: TradeDirection;
  status?: TradeStatus;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface AnalyticsPeriod {
  startDate: string;
  endDate: string;
}

export interface SymbolPerformance {
  symbol: string;
  trades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
}

export interface SetupPerformance {
  setup: string;
  trades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
}

export interface AnalyticsStats {
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  payoffRatio: number;
  expectancy: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  bestTrade: number;
  worstTrade: number;
  averageTradeDuration: number; // in days
  longestWinStreak: number;
  longestLoseStreak: number;
  currentStreak: { type: 'win' | 'loss' | 'none'; count: number };
}

export interface MarketPerformance {
  market: MarketType;
  trades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
}
