'use server'

import { revalidatePath } from 'next/cache'
import { userCreateSchema, userUpdateSchema } from '@/lib/validations/user'
import {
  getUsers as dbGetUsers,
  createUser as dbCreateUser,
  updateUser as dbUpdateUser,
  deleteUser as dbDeleteUser,
  type AdminUser,
} from '@/lib/database/users'

export type { AdminUser }

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function getUsers(): Promise<AdminUser[]> {
  const result = await dbGetUsers()
  if (!result.success) throw new Error(result.error)
  return result.data!
}

export async function createUser(formData: {
  email: string
  password: string
  role: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const result = userCreateSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbCreateUser(result.data.email, result.data.password, result.data.role)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/users')
    return dbResult
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'ユーザーの作成に失敗しました' }
  }
}

export async function updateUser(
  id: string,
  formData: { email?: string; password?: string; role?: string }
): Promise<ActionResult> {
  try {
    const result = userUpdateSchema.safeParse({ id, ...formData })
    if (!result.success) {
      return {
        success: false,
        error: '入力内容に誤りがあります',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const dbResult = await dbUpdateUser(id, formData)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/users')
    return dbResult
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'ユーザーの更新に失敗しました' }
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const dbResult = await dbDeleteUser(id)
    if (!dbResult.success) return dbResult
    revalidatePath('/admin/users')
    return dbResult
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'ユーザーの削除に失敗しました' }
  }
}
