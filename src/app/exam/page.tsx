import Link from 'next/link'
import { ClipboardList, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'

export const metadata = {
  title: '試験モード - Birgerik',
  description: '本番形式で資格試験に挑戦',
}

export default function ExamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Birgerik
              </span>
            </Link>
            
            <nav className="flex space-x-1">
              <Link
                href="/study"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                学習モード
              </Link>
              <Link
                href="/exam"
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-md"
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
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            試験モード
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            本番形式で時間を計測して実力を確認
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-left space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                実装予定の機能
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">制限時間付き試験</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">ランダム出題</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">問題数カスタマイズ</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">合格判定と詳細な成績表示</span>
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
            <Link href="/study">
              <Button size="lg" className="w-full sm:w-auto">
                学習モードを試す
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}