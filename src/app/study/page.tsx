import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'

export const metadata = {
  title: '学習モード - Birgerik',
  description: '問題を解いて知識を定着',
}

export default function StudyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Birgerik
              </span>
            </Link>
            
            <nav className="flex space-x-1">
              <Link
                href="/study"
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-md"
              >
                学習モード
              </Link>
              <Link
                href="/exam"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                試験モード
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            学習モード
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            問題を順番に、またはランダムに解いて知識を定着
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-left space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                実装予定の機能
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">資格・問題集の選択</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">順番 / ランダム出題モード</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">即時フィードバックと詳細な解説</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">学習進捗の保存と再開</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">間違えた問題の復習機能</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </Link>
            <Link href="/exam">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                試験モードを見る
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            Phase 3で実装予定
          </div>
        </div>
      </main>
    </div>
  )
}