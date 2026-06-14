import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
let supabaseClient: SupabaseClient | null = null

export function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.')
  }
}

export function getSupabaseClient() {
  assertSupabaseConfig()

  supabaseClient ??= createClient(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}