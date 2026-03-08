import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['admin', 'question_manager'] as const
const ADMIN_ONLY_ROLES = ['admin'] as const

export type VerifyAuthResult =
  | { authorized: true; userId: string; role: string }
  | { authorized: false; error: string }

/**
 * Server Action 内でセッションと権限を検証する。
 * Middleware による保護に加え、二重チェックとして使用する。
 * admin / question_manager ロールを許可。
 */
export async function verifyAdminAccess(): Promise<VerifyAuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.warn('[Auth] Server Action: セッションが見つからないか期限切れ', { error: error?.message })
      return { authorized: false, error: 'セッションが切れました。再度ログインしてください。' }
    }

    const role: string = user.user_metadata?.role
    if (!ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
      console.warn('[Auth] Server Action: 不正なロール', { userId: user.id, role })
      return { authorized: false, error: '権限がありません。' }
    }

    return { authorized: true, userId: user.id, role }
  } catch (error) {
    console.error('[Auth] Server Action: 認証確認中にエラーが発生', error)
    return { authorized: false, error: 'セッションの確認に失敗しました。' }
  }
}

/**
 * admin ロールのみを許可する。ユーザー管理など高権限操作に使用。
 */
export async function verifyAdminOnlyAccess(): Promise<VerifyAuthResult> {
  const result = await verifyAdminAccess()
  if (!result.authorized) return result

  if (!ADMIN_ONLY_ROLES.includes(result.role as typeof ADMIN_ONLY_ROLES[number])) {
    console.warn('[Auth] Server Action: admin ロールが必要', { userId: result.userId, role: result.role })
    return { authorized: false, error: '管理者権限が必要です。' }
  }

  return result
}
