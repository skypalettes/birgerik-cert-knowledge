import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { LogoutButton } from '@/components/admin/logout-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // サーバーサイドでセッションチェック
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // ログインページ以外で未ログインの場合はログインページへ
  // （ミドルウェアで既にチェックされているが、念のため）
  if (!session?.user || session.user.user_metadata?.role !== 'admin') {
    return <>{children}</>
  }

  // ユーザー情報の取得
  const userEmail = session.user.email || '管理者'
  const userName = session.user.user_metadata?.name || userEmail.split('@')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin/certifications" className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  Birgerik Core
                </span>
              </Link>
              
              <nav className="hidden md:flex space-x-1">
                <Link
                  href="/admin/certifications"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  資格管理
                </Link>
                <Link
                  href="/admin/question-sets"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  問題集管理
                </Link>
                <Link
                  href="/admin/questions"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  問題管理
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex justify-around py-2">
            <Link
              href="/admin/certifications"
              className="px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              資格管理
            </Link>
            <Link
              href="/admin/question-sets"
              className="px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              問題集管理
            </Link>
            <Link
              href="/admin/questions"
              className="px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              問題管理
            </Link>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}