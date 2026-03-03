'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
})

export type LoginFormState = {
  success: boolean
  error?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
  }
}

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validatedFields = loginSchema.safeParse(rawFormData)
  if (!validatedFields.success) {
    return {
      success: false,
      error: '入力内容に誤りがあります',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' }
    }

    const userRole = data.user?.user_metadata?.role
    const allowedRoles = ['admin', 'question_manager']
    if (!allowedRoles.includes(userRole)) {
      await supabase.auth.signOut()
      return { success: false, error: '管理者権限がありません' }
    }

    revalidatePath('/', 'layout')
    redirect('/admin/certifications')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return { success: false, error: 'ログイン処理中にエラーが発生しました' }
  }
}

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) return { success: false, error: 'ログアウト処理中にエラーが発生しました' }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error during logout:', error)
    return { success: false, error: 'ログアウト処理中にエラーが発生しました' }
  }
}
