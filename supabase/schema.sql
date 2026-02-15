-- Trade Log Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  default_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Market info
  symbol TEXT NOT NULL,
  market_type TEXT NOT NULL CHECK (market_type IN ('stock', 'crypto', 'forex', 'futures')),
  currency TEXT DEFAULT 'USD',

  -- Trade details
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  quantity NUMERIC NOT NULL,
  stop_loss NUMERIC,
  take_profit NUMERIC,

  -- Results
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  profit_loss NUMERIC,
  profit_loss_percent NUMERIC,
  risk_percent NUMERIC,
  risk_reward NUMERIC,

  -- Metadata
  setup TEXT,
  notes TEXT,
  image_urls TEXT[],
  trade_date TIMESTAMPTZ NOT NULL,
  exit_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Trade-Tag junction
CREATE TABLE IF NOT EXISTS trade_tags (
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, tag_id)
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can CRUD their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Trades: Users can CRUD their own trades
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Tags: Users can CRUD their own tags
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Trade Tags: Users can CRUD their own trade tags
CREATE POLICY "Users can view own trade_tags"
  ON trade_tags FOR SELECT
  USING (trade_id IN (SELECT id FROM trades WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trade_tags"
  ON trade_tags FOR INSERT
  WITH CHECK (trade_id IN (SELECT id FROM trades WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trade_tags"
  ON trade_tags FOR DELETE
  USING (trade_id IN (SELECT id FROM trades WHERE user_id = auth.uid()));

-- Journal: Users can CRUD their own journal entries
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON trades(user_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON trades(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_tags_trade ON trade_tags(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_tags_tag ON trade_tags(tag_id);

-- Function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for trade screenshots (run this separately in Storage settings)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trade-images', 'trade-images', true);

-- Storage policies (run after creating the bucket)
-- CREATE POLICY "Users can upload trade images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'trade-images' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can view trade images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'trade-images');

-- CREATE POLICY "Users can delete own trade images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'trade-images' AND auth.uid()::text = (storage.foldername(name))[1]);
