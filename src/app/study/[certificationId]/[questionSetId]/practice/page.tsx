import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'

interface Props {
  params: Promise<{
    certificationId: string
    questionSetId: string
  }>
  searchParams: Promise<{ mode?: string }>
}

export default async function PracticePage({ params, searchParams }: Props) {
  const { certificationId, questionSetId } = await params
  const { mode } = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href={`/study/${certificationId}/${questionSetId}/mode-select`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            モード選択に戻る
          </Button>
        </Link>
      </div>

      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">学習画面</h1>

        <p className="text-lg text-gray-600 mb-8">
          選択されたモード:{' '}
          <span className="font-semibold text-blue-600">
            {mode === 'sequential' ? '順番に解く' : 'ランダムに解く'}
          </span>
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
          <div className="text-left space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Phase 3.2で実装予定
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">問題表示コンポーネント</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">
                  選択肢選択UI（単一/複数対応）
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">
                  正解・不正解フィードバック
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">解説表示</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">プログレスバー</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">中断・再開機能</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/study/${certificationId}/${questionSetId}/mode-select`}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              モード選択に戻る
            </Button>
          </Link>
          <Link href="/study">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              学習モードトップへ
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Phase 3.1完了 - Phase 3.2へ続く
        </div>
      </div>
    </div>
  )
}