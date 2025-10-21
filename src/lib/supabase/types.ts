import { Database } from '@/lib/types/database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// 型付きSupabaseクライアント
export type TypedSupabaseClient = ReturnType<typeof createClient>

import { createClient } from './client'