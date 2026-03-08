import { createAdminClient } from '@/lib/supabase/admin'
import type { DatabaseResult } from './types'

export interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
  last_sign_in_at: string | null
}

export async function getUsers(): Promise<DatabaseResult<AdminUser[]>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) return { success: false, error: error.message }

    const users: AdminUser[] = data.users.map((user) => ({
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
    }))

    return { success: true, data: users }
  } catch (error) {
    console.error('getUsers error:', error)
    return { success: false, error: 'ユーザー一覧の取得に失敗しました' }
  }
}

export async function createUser(
  email: string,
  password: string,
  role: string
): Promise<DatabaseResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
      email_confirm: true,
    })
    if (error) return { success: false, error: error.message }
    return { success: true, data: { id: data.user.id } }
  } catch (error) {
    console.error('createUser error:', error)
    return { success: false, error: 'ユーザーの作成に失敗しました' }
  }
}

export async function updateUser(
  id: string,
  updates: { email?: string; password?: string; role?: string }
): Promise<DatabaseResult> {
  try {
    const supabase = createAdminClient()
    const updateData: Record<string, unknown> = {}
    if (updates.email) updateData.email = updates.email
    if (updates.password) updateData.password = updates.password
    if (updates.role) updateData.user_metadata = { role: updates.role }

    const { error } = await supabase.auth.admin.updateUserById(id, updateData)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    console.error('updateUser error:', error)
    return { success: false, error: 'ユーザーの更新に失敗しました' }
  }
}

export async function deleteUser(id: string): Promise<DatabaseResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    console.error('deleteUser error:', error)
    return { success: false, error: 'ユーザーの削除に失敗しました' }
  }
}
