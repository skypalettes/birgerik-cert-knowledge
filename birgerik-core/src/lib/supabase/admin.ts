import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

/**
 * Supabase Service Role クライアント。
 * RLS をバイパスするため、必ず Server Action 内で認証確認済みの場合のみ使用すること。
 * クライアントサイドへ公開してはならない。
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
