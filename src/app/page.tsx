import Link from 'next/link'
import { BookOpen, LayoutDashboard, ArrowRight, FileQuestion } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // データベース接続テスト
  const { error } = await supabase
    .from('certifications')
    .select('count')
    .limit(1)
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* ヒーローセクション */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Birgerik
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600">
              資格取得を加速させる学習プラットフォーム
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              高品質な問題と詳細な解説で、効率的に資格試験の合格を目指せます
            </p>
          </div>

          {/* ステータス */}
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-sm font-medium text-gray-700">
              {error ? 'システム準備中' : 'システム稼働中'}
            </span>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/study">
              <Button size="lg" className="w-full sm:w-auto group">
                <BookOpen className="mr-2 h-5 w-5" />
                学習を始める
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/admin/certifications">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                管理画面
              </Button>
            </Link>
          </div>

          {/* 機能紹介 */}
          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">学習モード</h3>
              <p className="text-sm text-gray-600">
                問題を順番に、またはランダムに解いて知識を定着
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <LayoutDashboard className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">試験モード</h3>
              <p className="text-sm text-gray-600">
                本番形式で時間を計測して実力を確認
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileQuestion className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">詳細な解説</h3>
              <p className="text-sm text-gray-600">
                すべての問題に分かりやすい解説を掲載
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}