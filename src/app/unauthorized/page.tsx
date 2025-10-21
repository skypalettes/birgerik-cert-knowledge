import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          アクセス権限がありません
        </h2>
        
        <p className="text-gray-600 mb-8">
          このページにアクセスする権限がありません。<br />
          管理者権限が必要です。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>ホームに戻る</Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="secondary">ログイン画面へ</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}