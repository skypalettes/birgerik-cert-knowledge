import { LoginForm } from './login-form'
import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '管理者ログイン - Birgerik',
  description: 'Birgerik管理画面へのログイン',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Birgerik Core
          </h1>
          <p className="text-gray-600">
            管理者ログイン
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>

        {/* フッター */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* 開発用ヒント */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800 mb-2 font-semibold">
            💡 開発者向け情報
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">
            管理者ユーザーをSupabase Dashboardで作成してください。<br />
            Authentication → Users → Add user<br />
            User Metadataに <code className="bg-blue-100 px-1 rounded">{"role: admin"}</code> を設定
          </p>
        </div>
      </div>
    </div>
  )
}