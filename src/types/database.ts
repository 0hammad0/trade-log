export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          default_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          symbol: string
          market_type: string
          currency: string
          direction: string
          entry_price: number
          exit_price: number | null
          quantity: number
          stop_loss: number | null
          take_profit: number | null
          status: string
          profit_loss: number | null
          profit_loss_percent: number | null
          risk_percent: number | null
          risk_reward: number | null
          setup: string | null
          notes: string | null
          image_urls: string[] | null
          trade_date: string
          exit_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          market_type: string
          currency?: string
          direction: string
          entry_price: number
          exit_price?: number | null
          quantity: number
          stop_loss?: number | null
          take_profit?: number | null
          status?: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          risk_percent?: number | null
          risk_reward?: number | null
          setup?: string | null
          notes?: string | null
          image_urls?: string[] | null
          trade_date: string
          exit_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          market_type?: string
          currency?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          quantity?: number
          stop_loss?: number | null
          take_profit?: number | null
          status?: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          risk_percent?: number | null
          risk_reward?: number | null
          setup?: string | null
          notes?: string | null
          image_urls?: string[] | null
          trade_date?: string
          exit_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      trade_tags: {
        Row: {
          trade_id: string
          tag_id: string
        }
        Insert: {
          trade_id: string
          tag_id: string
        }
        Update: {
          trade_id?: string
          tag_id?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood: string | null
          entry_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          mood?: string | null
          entry_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood?: string | null
          entry_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
