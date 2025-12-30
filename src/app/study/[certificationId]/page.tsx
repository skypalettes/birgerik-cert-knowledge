import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { getCertificationsWithQuestionSets } from '@/lib/actions/study'
import { QuestionSetCard } from '@/components/study/question-set-card'
import { EmptyState } from '@/components/shared/ui/empty-state'
import type { QuestionSetSummary } from '@birgerik/types'

interface Props {
  params: Promise<{ certificationId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { certificationId } = await params
  const { data: certifications } = await getCertificationsWithQuestionSets()
  const certification = certifications?.find((c) => c.id === certificationId)

  return {
    title: certification
      ? `${certification.name} - 学習モード - Birgerik`
      : '学習モード - Birgerik',
    description: certification?.description || '問題集を選択して学習を始めましょう',
  }
}

export default async function QuestionSetsPage({ params }: Props) {
  const { certificationId } = await params
  const { data: certifications, error } = await getCertificationsWithQuestionSets()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">エラー</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const certification = certifications?.find((c) => c.id === certificationId)

  if (!certification) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/study">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              資格一覧に戻る
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {certification.name}
            </h1>
            {certification.description && (
              <p className="text-gray-600 mt-1">{certification.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* 問題集一覧 */}
      {certification.question_sets.length > 0 ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              問題集を選択
            </h2>
            <p className="text-gray-600">
              学習したい問題集を選んで、学習モードを開始しましょう
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certification.question_sets.map((set: QuestionSetSummary) => (
              <Link
                key={set.id}
                href={`/study/${certificationId}/${set.id}/mode-select`}
              >
                <QuestionSetCard
                  id={set.id}
                  name={set.name}
                  description={set.description}
                  questionCount={set.question_count}
                />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-gray-400" />}
          title="問題集が登録されていません"
          description="この資格にはまだ問題集が登録されていません。"
          action={
            <Link href="/study">
              <Button variant="secondary">資格一覧に戻る</Button>
            </Link>
          }
        />
      )}
    </div>
  )
}