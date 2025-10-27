import Link from 'next/link'
import { BookOpen, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { getCertificationsWithQuestionSets } from '@/lib/actions/study'
import { CertificationCard } from '@/components/study/certification-card'
import { EmptyState } from '@/components/shared/ui/empty-state'

export const metadata = {
  title: '学習モード - Birgerik',
  description: '問題を解いて知識を定着',
}

export default async function StudyPage() {
  const { data: certifications, error } = await getCertificationsWithQuestionSets()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">学習モード</h1>
            <p className="text-gray-600 mt-1">資格を選択して学習を始めましょう</p>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">エラー</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 資格一覧 */}
      {!error && certifications && certifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <Link key={cert.id} href={`/study/${cert.id}`}>
              <CertificationCard
                id={cert.id}
                name={cert.name}
                description={cert.description}
                questionSetCount={cert.question_sets.length}
              />
            </Link>
          ))}
        </div>
      ) : !error ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-gray-400" />}
          title="資格が登録されていません"
          description="管理者が資格と問題集を登録すると、ここに表示されます。"
          action={
            <Link href="/">
              <Button variant="secondary">ホームに戻る</Button>
            </Link>
          }
        />
      ) : null}

      {/* 学習のヒント */}
      {!error && certifications && certifications.length > 0 && (
        <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            学習のヒント
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>まずは資格を選択し、その中から学習したい問題集を選びましょう</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>順番に解くモードで基礎を固め、ランダムモードで実力を試しましょう</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>間違えた問題はしっかり解説を読んで理解を深めましょう</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}