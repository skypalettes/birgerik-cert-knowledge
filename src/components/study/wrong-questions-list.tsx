'use client'

import { motion } from 'framer-motion'
import { XCircle, Eye } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { Question } from '@/store/study-store'
import { stripHtml } from '@/lib/utils/html'

interface WrongQuestionsListProps {
  wrongQuestions: Question[]
  onViewQuestion: (question: Question) => void
}

export function WrongQuestionsList({
  wrongQuestions,
  onViewQuestion,
}: WrongQuestionsListProps) {
  if (wrongQuestions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          全問正解です！
        </h3>
        <p className="text-gray-600">
          間違えた問題はありません。素晴らしい結果です！
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          間違えた問題 ({wrongQuestions.length}問)
        </h3>
      </div>

      <div className="space-y-3">
        {wrongQuestions.map((question, index) => {
          const questionPreview = stripHtml(question.question_text)
          const previewText =
            questionPreview.length > 80
              ? questionPreview.slice(0, 80) + '...'
              : questionPreview

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="danger" className="text-xs flex-shrink-0">
                          不正解
                        </Badge>
                        {question.is_multiple_choice && (
                          <Badge variant="warning" className="text-xs flex-shrink-0">
                            複数選択
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {previewText}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewQuestion(question)}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      詳細
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}