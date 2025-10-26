/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // レスポンスオブジェクトを作成
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabaseクライアントを作成（ミドルウェア用）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // リクエストとレスポンスの両方にクッキーを設定
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          // リクエストとレスポンスの両方からクッキーを削除
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // ✅ getUser()を使用してサーバー側で検証（セキュア）
  // getSession()はクライアント側のCookieから直接取得するため非推奨
  const { data: { user }, error } = await supabase.auth.getUser()

  // 管理者ルートの保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ログインページの場合
    if (request.nextUrl.pathname === '/admin/login') {
      // すでにログイン済みの場合は管理画面へリダイレクト
      if (user && !error) {
        const redirectUrl = new URL('/admin/certifications', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      // 未ログインの場合はログインページを表示
      return response
    }

    // 管理画面の他のページの場合
    // 未ログインまたはエラーがある場合はログインページへリダイレクト
    if (!user || error) {
      const redirectUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // roleチェック（user_metadataからroleを取得）
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      // 管理者権限がない場合は403ページへ
      const redirectUrl = new URL('/unauthorized', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下のパスにマッチ:
     * - /admin (管理者ルート全体)
     * - /admin/login
     * - /admin/certifications
     * - /admin/question-sets
     * - /admin/questions
     */
    '/admin/:path*',
  ],
}