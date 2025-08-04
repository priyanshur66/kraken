import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Comment {
  id: string;
  market_id: number;
  wallet_address: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentInsert {
  market_id: number;
  wallet_address: string;
  content: string;
}
