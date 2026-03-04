import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ==================== CORS for study API ====================
  if (pathname.startsWith('/api/v1/study')) {
    const origin = request.headers.get('origin') || ''
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
    const isAllowed = allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin === ''

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : '',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = NextResponse.next()
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
    }
    return response
  }

  // ==================== Admin Auth ====================
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    let response = NextResponse.next({ request })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const role = user.user_metadata?.role
    const allowedRoles = ['admin', 'question_manager']

    if (!allowedRoles.includes(role)) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin/login?error=forbidden', request.url))
    }

    // 問題管理者はユーザ管理ページにアクセス不可
    if (role === 'question_manager' && pathname.startsWith('/admin/users')) {
      return NextResponse.redirect(new URL('/admin/certifications', request.url))
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/v1/study/:path*',
  ],
}
