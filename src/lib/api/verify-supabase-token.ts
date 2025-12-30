import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Supabaseのアクセストークンを検証
 * Obsidianプラグイン用の認証に使用
 * banned状態のユーザーは自動的に拒否される
 */
export async function verifySupabaseToken(request: NextRequest): Promise<{
  valid: boolean
  userId?: string
  userEmail?: string
  error?: string
}> {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: '認証が必要です' }
    }

    const token = authHeader.substring(7) // "Bearer " を除去

    // Supabase Clientを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // トークンを検証してユーザー情報を取得
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return { valid: false, error: '無効なトークンです' }
    }

    // banned状態のチェックは Supabase が自動的に行う
    // getUser() が成功すれば、ユーザーはアクティブ

    return {
      valid: true,
      userId: data.user.id,
      userEmail: data.user.email,
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return { valid: false, error: '認証エラーが発生しました' }
  }
}
