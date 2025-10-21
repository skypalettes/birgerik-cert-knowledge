'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ログインフォームのバリデーションスキーマ
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

/**
 * ログイン処理
 */
export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // フォームデータの取得
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // バリデーション
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

    // Supabase Authでログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
      }
    }

    // ユーザーのroleを確認
    const userRole = data.user?.user_metadata?.role
    if (userRole !== 'admin') {
      // 管理者でない場合はログアウト
      await supabase.auth.signOut()
      return {
        success: false,
        error: '管理者権限がありません',
      }
    }

    // キャッシュを再検証
    revalidatePath('/', 'layout')

    // 成功
    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during login:', error)
    return {
      success: false,
      error: 'ログイン処理中にエラーが発生しました',
    }
  }
}

/**
 * ログイン成功後のリダイレクト処理
 * （Server Componentから呼び出される）
 */
export async function redirectToAdmin() {
  redirect('/admin/certifications')
}

/**
 * ログアウト処理
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: 'ログアウト処理中にエラーが発生しました',
      }
    }

    // キャッシュを再検証
    revalidatePath('/', 'layout')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during logout:', error)
    return {
      success: false,
      error: 'ログアウト処理中にエラーが発生しました',
    }
  }
}