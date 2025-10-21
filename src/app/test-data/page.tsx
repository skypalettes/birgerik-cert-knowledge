/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'

export default async function TestDataPage() {
  const supabase = await createClient()

  // 資格データ取得
  const { data: certifications, error: certError } = await supabase
    .from('certifications')
    .select('*')
    .order('created_at', { ascending: true })

  // 問題集データ取得（資格情報も含む）
  const { data: questionSets, error: qsError } = await supabase
    .from('question_sets')
    .select(`
      *,
      certifications (
        name
      )
    `)
    .order('created_at', { ascending: true })

  // 問題データ取得（問題集情報も含む）
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select(`
      *,
      question_sets (
        name
      )
    `)
    .order('order_index', { ascending: true })

  // 選択肢データ取得（問題情報も含む）
  const { data: choices, error: cError } = await supabase
    .from('choices')
    .select(`
      *,
      questions (
        question_text
      )
    `)
    .order('order_index', { ascending: true })

  const hasError = certError || qsError || qError || cError

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            テストデータ確認
          </h1>
          <p className="text-gray-600">
            Phase 0で投入したテストデータの取得確認
          </p>
        </div>

        {/* ステータス */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>データベース接続状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusRow
                label="資格データ"
                isSuccess={!certError && !!certifications}
                count={certifications?.length || 0}
              />
              <StatusRow
                label="問題集データ"
                isSuccess={!qsError && !!questionSets}
                count={questionSets?.length || 0}
              />
              <StatusRow
                label="問題データ"
                isSuccess={!qError && !!questions}
                count={questions?.length || 0}
              />
              <StatusRow
                label="選択肢データ"
                isSuccess={!cError && !!choices}
                count={choices?.length || 0}
              />
            </div>
          </CardContent>
        </Card>

        {hasError && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="text-red-600">
                <p className="font-semibold mb-2">エラーが発生しました:</p>
                {certError && <p className="text-sm">- 資格: {certError.message}</p>}
                {qsError && <p className="text-sm">- 問題集: {qsError.message}</p>}
                {qError && <p className="text-sm">- 問題: {qError.message}</p>}
                {cError && <p className="text-sm">- 選択肢: {cError.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 資格一覧 */}
        {certifications && certifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>資格一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-gray-600">{cert.description}</p>
                    <p className="text-xs text-gray-500 mt-2">ID: {cert.id}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 問題集一覧 */}
        {questionSets && questionSets.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>問題集一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questionSets.map((qset: any) => (
                  <div
                    key={qset.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {qset.name}
                      </h3>
                      <Badge variant="info">
                        {qset.certifications?.name || '不明'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{qset.description}</p>
                    <p className="text-xs text-gray-500 mt-2">ID: {qset.id}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 問題一覧 */}
        {questions && questions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>問題一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question: any) => {
                  const questionChoices = choices?.filter(
                    (c: any) => c.question_id === question.id
                  )
                  const correctCount = questionChoices?.filter(
                    (c: any) => c.is_correct
                  ).length || 0

                  return (
                    <div
                      key={question.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="info">
                              {question.question_sets?.name || '不明'}
                            </Badge>
                            <Badge variant={question.is_multiple_choice ? 'warning' : 'success'}>
                              {question.is_multiple_choice ? '複数選択' : '単一選択'}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {question.question_text}
                          </h3>
                        </div>
                      </div>

                      {/* 選択肢 */}
                      <div className="space-y-2 mb-3">
                        {questionChoices?.map((choice: any, idx: number) => (
                          <div
                            key={choice.id}
                            className={`flex items-start gap-2 p-2 rounded ${
                              choice.is_correct
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <span className="text-sm font-medium text-gray-600">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="text-sm text-gray-900 flex-1">
                              {choice.choice_text}
                            </span>
                            {choice.is_correct && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 解説 */}
                      {question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-xs font-semibold text-blue-900 mb-1">
                            解説
                          </p>
                          <p className="text-sm text-blue-800">
                            {question.explanation}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-3">
                        ID: {question.id} | 正解数: {correctCount}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatusRow({
  label,
  isSuccess,
  count,
}: {
  label: string
  isSuccess: boolean
  count: number
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <Badge variant={isSuccess ? 'success' : 'danger'}>
        {count}件
      </Badge>
    </div>
  )
}