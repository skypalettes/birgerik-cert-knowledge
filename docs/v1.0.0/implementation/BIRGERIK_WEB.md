# Birgerik Web 実装ドキュメント

> **対象リポジトリ:** `birgerik-web`（新規作成）
> **役割:** エンドユーザ向け学習・試験アプリケーション
> **プラットフォーム:** Vercel (Next.js App Router)
> **参照:** [ARCHITECTURE.md](../ARCHITECTURE.md) / [REQUIREMENTS.md](../REQUIREMENTS.md)

---

## 1. プロジェクト初期セットアップ

### 1.1 リポジトリ作成

```bash
npx create-next-app@latest birgerik-web \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*"
cd birgerik-web
```

### 1.2 依存パッケージ

```bash
# Core
pnpm add @birgerik/types zustand zod

# UI / Animation
pnpm add framer-motion lucide-react clsx tailwind-merge next-themes sonner

# Markdown
pnpm add react-markdown remark-gfm remark-breaks rehype-sanitize rehype-highlight
pnpm add @uiw/react-markdown-preview

# Forms
pnpm add react-hook-form @hookform/resolvers

# Dev
pnpm add -D @types/node @types/react @types/react-dom
```

### 1.3 環境変数（`.env.local`）

```env
NEXT_PUBLIC_API_BASE_URL=https://birgerik-core.vercel.app/api/v1
```

### 1.4 package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 1.5 `.npmrc`（GitHub Packages 認証）

```ini
@birgerik:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## 2. ディレクトリ構成

```
birgerik-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # ルートレイアウト
│   │   ├── page.tsx                      # ホーム → /study にリダイレクト
│   │   ├── study/                        # 学習モード
│   │   │   ├── layout.tsx                # 学習モード共通レイアウト（ヘッダー付き）
│   │   │   ├── page.tsx                  # 資格選択
│   │   │   └── [certId]/
│   │   │       ├── page.tsx              # 問題集選択
│   │   │       └── [setId]/
│   │   │           ├── mode-select/
│   │   │           │   └── page.tsx      # 学習モード選択（順番/ランダム）
│   │   │           ├── practice/
│   │   │           │   └── page.tsx      # 学習実施
│   │   │           └── result/
│   │   │               └── page.tsx      # 学習結果
│   │   └── exam/                         # 試験モード ★新規
│   │       ├── layout.tsx                # 試験モード共通レイアウト
│   │       ├── page.tsx                  # 試験選択
│   │       └── [setId]/
│   │           ├── confirm/
│   │           │   └── page.tsx          # 試験条件確認
│   │           ├── session/
│   │           │   └── page.tsx          # 試験実施
│   │           └── result/
│   │               └── page.tsx          # 試験結果
│   ├── components/
│   │   ├── study/                        # 学習モードコンポーネント
│   │   │   ├── certification-card.tsx
│   │   │   ├── question-set-card.tsx
│   │   │   ├── question-display.tsx
│   │   │   ├── choice-option.tsx
│   │   │   ├── answer-feedback.tsx
│   │   │   ├── study-progress.tsx
│   │   │   └── study-navigation.tsx
│   │   ├── exam/                         # 試験モードコンポーネント ★新規
│   │   │   ├── exam-card.tsx
│   │   │   ├── exam-confirm.tsx
│   │   │   ├── exam-question-display.tsx
│   │   │   ├── exam-choice-option.tsx
│   │   │   ├── exam-navigator.tsx
│   │   │   ├── exam-timer.tsx
│   │   │   └── exam-result-detail.tsx
│   │   └── shared/
│   │       ├── ui/
│   │       │   ├── button.tsx
│   │       │   ├── badge.tsx
│   │       │   ├── card.tsx
│   │       │   ├── modal.tsx
│   │       │   ├── empty-state.tsx
│   │       │   ├── markdown-renderer.tsx
│   │       │   └── progress-circle.tsx   # ★新規: 円形プログレス
│   │       └── wrong-questions-list.tsx
│   ├── store/
│   │   ├── study-store.ts                # 学習セッション状態管理
│   │   └── exam-store.ts                 # 試験セッション状態管理 ★新規
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts                 # Birgerik Core API クライアント
│   │   └── utils/
│   │       ├── markdown.ts               # Markdown 変換ユーティリティ
│   │       └── cn.ts                     # Tailwind クラス結合ユーティリティ
│   └── middleware.ts                     # （不要: 認証なし）
├── .env.local
├── .npmrc
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 3. API クライアント（`src/lib/api/client.ts`）

Birgerik Core の学習用エンドポイント（認証不要）を呼び出すクライアント。

```typescript
// src/lib/api/client.ts
import type {
  GetCertificationsResponse,
  GetQuestionSetResponse,
  GetQuestionsResponse,
  GetExamConfigResponse,
} from '@birgerik/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 60 },   // ISR: 60 秒キャッシュ
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// 資格 + 問題集一覧
export async function getCertifications(): Promise<GetCertificationsResponse> {
  return apiFetch('/study/certifications')
}

// 問題集詳細
export async function getQuestionSetDetail(id: string): Promise<GetQuestionSetResponse> {
  return apiFetch(`/study/question-sets/${id}`)
}

// 問題 + 選択肢一覧
export async function getQuestions(questionSetId: string): Promise<GetQuestionsResponse> {
  return apiFetch(`/study/questions/${questionSetId}`)
}

// 試験設定 ★新規
export async function getExamConfig(questionSetId: string): Promise<GetExamConfigResponse> {
  return apiFetch(`/study/exams/${questionSetId}`)
}
```

---

## 4. Zustand ストア

### 4.1 学習ストア（`src/store/study-store.ts`）

現行 `birgerik` リポジトリから移植・整理する。

```typescript
// src/store/study-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { QuestionWithChoices, UserAnswer } from '@birgerik/types'

type StudyMode = 'sequential' | 'random' | 'review'

interface AnswerHistory {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
}

interface StudyState {
  // セッション情報
  questionSetId: string | null
  questionSetName: string | null
  certificationName: string | null
  mode: StudyMode | null

  // 問題データ
  questions: QuestionWithChoices[]
  currentIndex: number

  // ユーザー回答
  selectedChoiceIds: string[]
  answerHistory: AnswerHistory[]
  isAnswerSubmitted: boolean
  showExplanation: boolean

  // セッション状態
  isSessionActive: boolean
}

interface StudyActions {
  startSession: (params: {
    questionSetId: string
    questionSetName: string
    certificationName: string
    questions: QuestionWithChoices[]
    mode: StudyMode
  }) => void
  endSession: () => void
  toggleChoice: (choiceId: string, isMultiple: boolean) => void
  submitAnswer: () => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  toggleExplanation: () => void
  resetCurrentAnswer: () => void
  startReviewSession: () => void

  // Computed
  getCurrentQuestion: () => QuestionWithChoices | null
  getProgress: () => { current: number; total: number; percentage: number }
  getScore: () => { correct: number; total: number; percentage: number }
  getWrongQuestions: () => QuestionWithChoices[]
  isLastQuestion: () => boolean
  isFirstQuestion: () => boolean
}

const initialState: StudyState = {
  questionSetId: null,
  questionSetName: null,
  certificationName: null,
  mode: null,
  questions: [],
  currentIndex: 0,
  selectedChoiceIds: [],
  answerHistory: [],
  isAnswerSubmitted: false,
  showExplanation: false,
  isSessionActive: false,
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const useStudyStore = create<StudyState & StudyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: ({ questionSetId, questionSetName, certificationName, questions, mode }) => {
        const orderedQuestions = mode === 'random' ? shuffleArray(questions) : questions
        set({
          ...initialState,
          questionSetId,
          questionSetName,
          certificationName,
          mode,
          questions: orderedQuestions,
          isSessionActive: true,
        })
      },

      endSession: () => set(initialState),

      toggleChoice: (choiceId, isMultiple) => {
        if (get().isAnswerSubmitted) return
        set((state) => {
          if (isMultiple) {
            const exists = state.selectedChoiceIds.includes(choiceId)
            return {
              selectedChoiceIds: exists
                ? state.selectedChoiceIds.filter((id) => id !== choiceId)
                : [...state.selectedChoiceIds, choiceId],
            }
          }
          return { selectedChoiceIds: [choiceId] }
        })
      },

      submitAnswer: () => {
        const state = get()
        const question = state.questions[state.currentIndex]
        if (!question || state.isAnswerSubmitted) return

        const correctIds = question.choices
          .filter((c) => c.is_correct)
          .map((c) => c.id)
          .sort()
        const selectedSorted = [...state.selectedChoiceIds].sort()
        const isCorrect =
          correctIds.length === selectedSorted.length &&
          correctIds.every((id, i) => id === selectedSorted[i])

        const record: AnswerHistory = {
          questionId: question.id,
          selectedChoiceIds: state.selectedChoiceIds,
          isCorrect,
        }

        set((s) => ({
          isAnswerSubmitted: true,
          answerHistory: [
            ...s.answerHistory.filter((h) => h.questionId !== question.id),
            record,
          ],
        }))
      },

      nextQuestion: () =>
        set((s) => ({
          currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        })),

      previousQuestion: () =>
        set((s) => ({
          currentIndex: Math.max(s.currentIndex - 1, 0),
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        })),

      goToQuestion: (index) =>
        set({
          currentIndex: index,
          selectedChoiceIds: [],
          isAnswerSubmitted: false,
          showExplanation: false,
        }),

      toggleExplanation: () => set((s) => ({ showExplanation: !s.showExplanation })),

      resetCurrentAnswer: () =>
        set({ selectedChoiceIds: [], isAnswerSubmitted: false, showExplanation: false }),

      startReviewSession: () => {
        const state = get()
        const wrongIds = new Set(
          state.answerHistory.filter((h) => !h.isCorrect).map((h) => h.questionId)
        )
        const wrongQuestions = state.questions.filter((q) => wrongIds.has(q.id))
        set({
          ...initialState,
          questionSetId: state.questionSetId,
          questionSetName: state.questionSetName,
          certificationName: state.certificationName,
          mode: 'review',
          questions: wrongQuestions,
          isSessionActive: true,
        })
      },

      getCurrentQuestion: () => {
        const { questions, currentIndex } = get()
        return questions[currentIndex] ?? null
      },

      getProgress: () => {
        const { currentIndex, questions } = get()
        const total = questions.length
        return {
          current: currentIndex + 1,
          total,
          percentage: total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0,
        }
      },

      getScore: () => {
        const { answerHistory, questions } = get()
        const correct = answerHistory.filter((h) => h.isCorrect).length
        return {
          correct,
          total: questions.length,
          percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
        }
      },

      getWrongQuestions: () => {
        const { questions, answerHistory } = get()
        const wrongIds = new Set(
          answerHistory.filter((h) => !h.isCorrect).map((h) => h.questionId)
        )
        return questions.filter((q) => wrongIds.has(q.id))
      },

      isLastQuestion: () => {
        const { currentIndex, questions } = get()
        return currentIndex === questions.length - 1
      },

      isFirstQuestion: () => get().currentIndex === 0,
    }),
    {
      name: 'birgerik-study-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
```

### 4.2 試験ストア（`src/store/exam-store.ts`）★新規

```typescript
// src/store/exam-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { QuestionWithChoices, ExamConfig } from '@birgerik/types'

interface AnswerRecord {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
}

interface ExamState {
  // 試験設定
  examConfig: ExamConfig | null
  questionSetName: string | null
  certificationName: string | null

  // 問題
  questions: QuestionWithChoices[]       // ランダム抽出済み
  currentIndex: number

  // 回答
  selectedChoiceIds: string[]
  answerHistory: AnswerRecord[]

  // タイマー
  timeRemaining: number                  // 残り秒数
  isTimerRunning: boolean

  // セッション状態
  isSessionActive: boolean
  isFinished: boolean
  startedAt: number | null               // Date.now()
  finishedAt: number | null
}

interface ExamActions {
  startExam: (params: {
    examConfig: ExamConfig
    questionSetName: string
    certificationName: string
    questions: QuestionWithChoices[]     // 抽出・シャッフル済み
  }) => void
  endExam: () => void
  abandonExam: () => void

  // 回答操作
  toggleChoice: (choiceId: string, isMultiple: boolean) => void
  saveCurrentAnswer: () => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void

  // タイマー
  tickTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void

  // 採点・完了
  finishExam: () => void

  // Computed
  getCurrentQuestion: () => QuestionWithChoices | null
  getProgress: () => { current: number; total: number; answeredCount: number }
  getAnswerForQuestion: (questionId: string) => AnswerRecord | undefined
  getExamResult: () => {
    totalQuestions: number
    correctCount: number
    accuracy: number
    passed: boolean
    passingScore: number
    duration: number
    incorrectQuestions: QuestionWithChoices[]
  } | null
  isLastQuestion: () => boolean
  isFirstQuestion: () => boolean
}

const initialState: ExamState = {
  examConfig: null,
  questionSetName: null,
  certificationName: null,
  questions: [],
  currentIndex: 0,
  selectedChoiceIds: [],
  answerHistory: [],
  timeRemaining: 0,
  isTimerRunning: false,
  isSessionActive: false,
  isFinished: false,
  startedAt: null,
  finishedAt: null,
}

function shuffleAndSample<T>(array: T[], count: number): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

export const useExamStore = create<ExamState & ExamActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startExam: ({ examConfig, questionSetName, certificationName, questions }) => {
        const sampled = shuffleAndSample(questions, examConfig.question_count)
        set({
          ...initialState,
          examConfig,
          questionSetName,
          certificationName,
          questions: sampled,
          timeRemaining: examConfig.time_limit_minutes * 60,
          isTimerRunning: true,
          isSessionActive: true,
          startedAt: Date.now(),
        })
      },

      endExam: () => set(initialState),
      abandonExam: () => set(initialState),

      toggleChoice: (choiceId, isMultiple) => {
        if (get().isFinished) return
        set((state) => {
          if (isMultiple) {
            const exists = state.selectedChoiceIds.includes(choiceId)
            return {
              selectedChoiceIds: exists
                ? state.selectedChoiceIds.filter((id) => id !== choiceId)
                : [...state.selectedChoiceIds, choiceId],
            }
          }
          return { selectedChoiceIds: [choiceId] }
        })
      },

      saveCurrentAnswer: () => {
        const state = get()
        const question = state.questions[state.currentIndex]
        if (!question || state.selectedChoiceIds.length === 0) return

        const correctIds = question.choices
          .filter((c) => c.is_correct)
          .map((c) => c.id)
          .sort()
        const selectedSorted = [...state.selectedChoiceIds].sort()
        const isCorrect =
          correctIds.length === selectedSorted.length &&
          correctIds.every((id, i) => id === selectedSorted[i])

        const record: AnswerRecord = {
          questionId: question.id,
          selectedChoiceIds: state.selectedChoiceIds,
          isCorrect,
        }
        set((s) => ({
          answerHistory: [
            ...s.answerHistory.filter((h) => h.questionId !== question.id),
            record,
          ],
        }))
      },

      goToQuestion: (index) => {
        get().saveCurrentAnswer()
        const prev = get().answerHistory.find(
          (h) => h.questionId === get().questions[index]?.id
        )
        set({
          currentIndex: index,
          selectedChoiceIds: prev?.selectedChoiceIds ?? [],
        })
      },

      nextQuestion: () => {
        get().saveCurrentAnswer()
        const state = get()
        if (state.currentIndex >= state.questions.length - 1) return
        const next = state.currentIndex + 1
        const prev = state.answerHistory.find(
          (h) => h.questionId === state.questions[next]?.id
        )
        set({ currentIndex: next, selectedChoiceIds: prev?.selectedChoiceIds ?? [] })
      },

      previousQuestion: () => {
        get().saveCurrentAnswer()
        const state = get()
        if (state.currentIndex === 0) return
        const prev = state.currentIndex - 1
        const prevAnswer = state.answerHistory.find(
          (h) => h.questionId === state.questions[prev]?.id
        )
        set({ currentIndex: prev, selectedChoiceIds: prevAnswer?.selectedChoiceIds ?? [] })
      },

      tickTimer: () => {
        set((s) => {
          if (!s.isTimerRunning || s.timeRemaining <= 0) return {}
          const next = s.timeRemaining - 1
          if (next <= 0) {
            // 時間切れ → 自動終了（finishExam ロジックを呼ぶ）
            return { timeRemaining: 0, isTimerRunning: false }
          }
          return { timeRemaining: next }
        })
      },

      pauseTimer: () => set({ isTimerRunning: false }),
      resumeTimer: () => set({ isTimerRunning: true }),

      finishExam: () => {
        get().saveCurrentAnswer()
        set({ isFinished: true, isTimerRunning: false, finishedAt: Date.now() })
      },

      getCurrentQuestion: () => {
        const { questions, currentIndex } = get()
        return questions[currentIndex] ?? null
      },

      getProgress: () => {
        const { currentIndex, questions, answerHistory } = get()
        return {
          current: currentIndex + 1,
          total: questions.length,
          answeredCount: answerHistory.length,
        }
      },

      getAnswerForQuestion: (questionId) =>
        get().answerHistory.find((h) => h.questionId === questionId),

      getExamResult: () => {
        const state = get()
        if (!state.isFinished || !state.examConfig) return null
        const { answerHistory, questions, startedAt, finishedAt, examConfig } = state
        const correctCount = answerHistory.filter((h) => h.isCorrect).length
        const totalQuestions = questions.length
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
        const wrongIds = new Set(answerHistory.filter((h) => !h.isCorrect).map((h) => h.questionId))
        return {
          totalQuestions,
          correctCount,
          accuracy,
          passed: accuracy >= examConfig.passing_score,
          passingScore: examConfig.passing_score,
          duration: finishedAt && startedAt ? finishedAt - startedAt : 0,
          incorrectQuestions: questions.filter((q) => wrongIds.has(q.id)),
        }
      },

      isLastQuestion: () => {
        const { currentIndex, questions } = get()
        return currentIndex === questions.length - 1
      },
      isFirstQuestion: () => get().currentIndex === 0,
    }),
    {
      name: 'birgerik-exam-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
```

---

## 5. ページ実装

### 5.1 ルートページ（`src/app/page.tsx`）

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/study')
}
```

### 5.2 学習モード — 資格選択（`src/app/study/page.tsx`）

```typescript
import { getCertifications } from '@/lib/api/client'
import { CertificationCard } from '@/components/study/certification-card'
import { EmptyState } from '@/components/shared/ui/empty-state'

export default async function StudyPage() {
  const { certifications } = await getCertifications()

  if (certifications.length === 0) {
    return <EmptyState title="資格がありません" description="管理者にお問い合わせください" />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">学習する資格を選択</h1>
      <p className="text-gray-500 mb-8">取り組みたい資格・カテゴリを選んでください</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <CertificationCard key={cert.id} certification={cert} />
        ))}
      </div>
    </div>
  )
}
```

### 5.3 学習モード — 問題集選択（`src/app/study/[certId]/page.tsx`）

```typescript
import { getCertifications } from '@/lib/api/client'
import { QuestionSetCard } from '@/components/study/question-set-card'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ certId: string }> }

export default async function CertificationPage({ params }: Props) {
  const { certId } = await params
  const { certifications } = await getCertifications()
  const cert = certifications.find((c) => c.id === certId)
  if (!cert) notFound()

  // is_active === true の問題集のみ表示（APIで既にフィルタ済み）
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{cert.name}</h1>
      {cert.description && <p className="text-gray-500 mb-8">{cert.description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cert.question_sets.map((qs) => (
          <QuestionSetCard key={qs.id} certId={certId} questionSet={qs} />
        ))}
      </div>
    </div>
  )
}
```

### 5.4 学習モード — モード選択（`src/app/study/[certId]/[setId]/mode-select/page.tsx`）

```typescript
import { getQuestionSetDetail } from '@/lib/api/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default async function ModeSelectPage({ params }: Props) {
  const { certId, setId } = await params
  const { question_set } = await getQuestionSetDetail(setId).catch(() => notFound() as never)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">{question_set.name}</h1>
      <p className="text-gray-500 mb-8">{question_set.question_count} 問</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href={`/study/${certId}/${setId}/practice?mode=sequential`}>
          <ModeCard
            icon="📋"
            title="順番に解く"
            description="問題を順番に解き、基礎を固める"
          />
        </Link>
        <Link href={`/study/${certId}/${setId}/practice?mode=random`}>
          <ModeCard
            icon="🔀"
            title="ランダムに解く"
            description="問題をシャッフルして実力を試す"
          />
        </Link>
      </div>
    </div>
  )
}

function ModeCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="border rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="font-bold text-lg mb-1">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  )
}
```

### 5.5 学習モード — 問題実施（`src/app/study/[certId]/[setId]/practice/page.tsx`）

```typescript
'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStudyStore } from '@/store/study-store'
import { getQuestions, getQuestionSetDetail } from '@/lib/api/client'
import { QuestionDisplay } from '@/components/study/question-display'
import { ChoiceOption } from '@/components/study/choice-option'
import { AnswerFeedback } from '@/components/study/answer-feedback'
import { StudyProgress } from '@/components/study/study-progress'
import { StudyNavigation } from '@/components/study/study-navigation'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default function PracticePage({ params }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = (searchParams.get('mode') ?? 'sequential') as 'sequential' | 'random'
  const store = useStudyStore()

  // セッション初期化
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const { certId, setId } = await params
      if (store.isSessionActive && store.questionSetId === setId) return

      const [{ question_set }, { questions }] = await Promise.all([
        getQuestionSetDetail(setId),
        getQuestions(setId),
      ])
      if (!cancelled) {
        store.startSession({
          questionSetId: setId,
          questionSetName: question_set.name,
          certificationName: question_set.certification_name,
          questions,
          mode,
        })
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const question = store.getCurrentQuestion()
  if (!question) return <div className="flex items-center justify-center h-64">読み込み中...</div>

  const { certId, setId } = /* resolved params */ { certId: '', setId: '' } // resolved in useEffect

  const handleFinish = async () => {
    const { certId, setId } = await params
    router.push(`/study/${certId}/${setId}/result`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <StudyProgress
        current={store.getProgress().current}
        total={store.getProgress().total}
        score={store.getScore()}
      />
      <QuestionDisplay question={question} />
      <div className="space-y-3 my-6">
        {question.choices.map((choice) => (
          <ChoiceOption
            key={choice.id}
            choice={choice}
            isSelected={store.selectedChoiceIds.includes(choice.id)}
            isSubmitted={store.isAnswerSubmitted}
            onToggle={() => store.toggleChoice(choice.id, question.is_multiple_choice)}
          />
        ))}
      </div>
      {store.isAnswerSubmitted && (
        <AnswerFeedback
          isCorrect={store.answerHistory.at(-1)?.isCorrect ?? false}
          explanation={question.explanation}
          showExplanation={store.showExplanation}
          onToggleExplanation={store.toggleExplanation}
        />
      )}
      <StudyNavigation
        isFirst={store.isFirstQuestion()}
        isLast={store.isLastQuestion()}
        isSubmitted={store.isAnswerSubmitted}
        hasSelection={store.selectedChoiceIds.length > 0}
        onPrevious={store.previousQuestion}
        onNext={store.nextQuestion}
        onSubmit={store.submitAnswer}
        onReset={store.resetCurrentAnswer}
        onFinish={handleFinish}
      />
    </div>
  )
}
```

### 5.6 学習モード — 結果（`src/app/study/[certId]/[setId]/result/page.tsx`）

```typescript
'use client'

import { useStudyStore } from '@/store/study-store'
import { WrongQuestionsList } from '@/components/shared/wrong-questions-list'
import { ProgressCircle } from '@/components/shared/ui/progress-circle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default function ResultPage({ params }: Props) {
  const { certId, setId } = use(params)
  const store = useStudyStore()
  const router = useRouter()
  const score = store.getScore()
  const wrongQuestions = store.getWrongQuestions()
  const modeLabel = store.mode === 'random' ? 'ランダム' : store.mode === 'review' ? '復習' : '順番'

  const handleReview = () => {
    store.startReviewSession()
    router.push(`/study/${certId}/${setId}/practice?mode=review`)
  }

  const handleRetry = () => {
    router.push(`/study/${certId}/${setId}/mode-select`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-5xl mb-4">🏆</div>
      <h1 className="text-3xl font-bold mb-2">
        {score.percentage >= 80 ? '素晴らしい！' : score.percentage >= 60 ? 'よくできました！' : 'もう少し頑張ろう！'}
      </h1>
      <p className="text-gray-500 mb-8">{store.questionSetName} — {modeLabel}モード</p>

      <div className="flex justify-center mb-8">
        <ProgressCircle percentage={score.percentage} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-600">{score.percentage}%</div>
          <div className="text-sm text-gray-500 mt-1">正答率</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold">{score.correct}/{score.total}</div>
          <div className="text-sm text-gray-500 mt-1">正解数</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-600">{modeLabel}</div>
          <div className="text-sm text-gray-500 mt-1">モード</div>
        </div>
      </div>

      <WrongQuestionsList questions={wrongQuestions} />

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        {wrongQuestions.length > 0 && (
          <button onClick={handleReview} className="btn-primary">
            間違えた問題を復習
          </button>
        )}
        <button onClick={handleRetry} className="btn-secondary">
          もう一度挑戦
        </button>
        <Link href="/study" className="btn-outline">
          学習トップへ
        </Link>
      </div>
    </div>
  )
}
```

---

## 6. 試験モード ★新規

### 6.1 試験選択（`src/app/exam/page.tsx`）

```typescript
import { getCertifications } from '@/lib/api/client'
import { ExamCard } from '@/components/exam/exam-card'

export default async function ExamPage() {
  const { certifications } = await getCertifications()

  // has_exam === true の問題集のみ抽出
  const examItems = certifications.flatMap((cert) =>
    cert.question_sets
      .filter((qs) => qs.has_exam)
      .map((qs) => ({ ...qs, certificationName: cert.name }))
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">試験モード</h1>
      <p className="text-gray-500 mb-8">制限時間・合格ライン付きで実力を試せます</p>
      {examItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">試験が設定された問題集がありません</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examItems.map((item) => (
            <ExamCard key={item.id} questionSet={item} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 6.2 試験条件確認（`src/app/exam/[setId]/confirm/page.tsx`）

```typescript
import { getQuestionSetDetail, getExamConfig } from '@/lib/api/client'
import { ExamConfirm } from '@/components/exam/exam-confirm'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ setId: string }> }

export default async function ExamConfirmPage({ params }: Props) {
  const { setId } = await params
  const [qsResult, examResult] = await Promise.all([
    getQuestionSetDetail(setId).catch(() => null),
    getExamConfig(setId).catch(() => null),
  ])
  if (!qsResult || !examResult) notFound()

  return (
    <ExamConfirm
      questionSet={qsResult.question_set}
      examConfig={examResult.exam}
    />
  )
}
```

**`src/components/exam/exam-confirm.tsx`**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useExamStore } from '@/store/exam-store'
import { getQuestions } from '@/lib/api/client'
import type { QuestionSetDetail, ExamConfig } from '@birgerik/types'

type Props = { questionSet: QuestionSetDetail; examConfig: ExamConfig }

export function ExamConfirm({ questionSet, examConfig }: Props) {
  const router = useRouter()
  const store = useExamStore()

  const handleStart = async () => {
    const { questions } = await getQuestions(questionSet.id)
    store.startExam({
      examConfig,
      questionSetName: questionSet.name,
      certificationName: questionSet.certification_name,
      questions,
    })
    router.push(`/exam/${questionSet.id}/session`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{questionSet.name}</h1>
      <div className="bg-gray-50 rounded-xl p-6 space-y-4 mb-8">
        <InfoRow label="出題数" value={`${examConfig.question_count} 問`} />
        <InfoRow label="制限時間" value={`${examConfig.time_limit_minutes} 分`} />
        <InfoRow label="合格ライン" value={`${examConfig.passing_score}%`} />
      </div>
      <div className="text-sm text-gray-500 mb-6 space-y-1">
        <p>・問題はランダムに出題されます</p>
        <p>・解答中はフィードバック・解説は表示されません</p>
        <p>・時間切れになると自動的に採点されます</p>
      </div>
      <button onClick={handleStart} className="w-full btn-primary text-lg py-4">
        試験を開始する
      </button>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-lg">{value}</span>
    </div>
  )
}
```

### 6.3 試験実施（`src/app/exam/[setId]/session/page.tsx`）

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useExamStore } from '@/store/exam-store'
import { ExamTimer } from '@/components/exam/exam-timer'
import { ExamNavigator } from '@/components/exam/exam-navigator'
import { ExamQuestionDisplay } from '@/components/exam/exam-question-display'
import { ExamChoiceOption } from '@/components/exam/exam-choice-option'
import { use } from 'react'

type Props = { params: Promise<{ setId: string }> }

export default function ExamSessionPage({ params }: Props) {
  const { setId } = use(params)
  const router = useRouter()
  const store = useExamStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // タイマー制御
  useEffect(() => {
    if (!store.isSessionActive || store.isFinished) return

    timerRef.current = setInterval(() => {
      store.tickTimer()
      if (store.timeRemaining <= 1) {
        // 時間切れ
        store.finishExam()
        router.push(`/exam/${setId}/result`)
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [store.isSessionActive, store.isFinished])

  // セッションが存在しない場合
  if (!store.isSessionActive) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">試験セッションが見つかりません</p>
        <button onClick={() => router.push('/exam')} className="btn-secondary">
          試験選択に戻る
        </button>
      </div>
    )
  }

  const question = store.getCurrentQuestion()
  const progress = store.getProgress()

  const handleFinish = () => {
    const unanswered = progress.total - progress.answeredCount
    if (unanswered > 0) {
      const ok = confirm(`未回答の問題が ${unanswered} 問あります。終了しますか？`)
      if (!ok) return
    }
    store.finishExam()
    router.push(`/exam/${setId}/result`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー: タイマー + 進捗 */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <ExamTimer seconds={store.timeRemaining} />
        <span className="text-sm text-gray-500">
          {progress.current} / {progress.total} 問
        </span>
        <button
          onClick={handleFinish}
          className="btn-danger text-sm px-4 py-2"
        >
          終了する
        </button>
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* メインエリア */}
        <div className="flex-1">
          {question && (
            <>
              <ExamQuestionDisplay question={question} currentIndex={store.currentIndex} />
              <div className="space-y-3 my-6">
                {question.choices.map((choice) => (
                  <ExamChoiceOption
                    key={choice.id}
                    choice={choice}
                    isSelected={store.selectedChoiceIds.includes(choice.id)}
                    onToggle={() => store.toggleChoice(choice.id, question.is_multiple_choice)}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={store.previousQuestion}
                  disabled={store.isFirstQuestion()}
                  className="btn-outline"
                >
                  前の問題
                </button>
                <button
                  onClick={store.nextQuestion}
                  disabled={store.isLastQuestion()}
                  className="btn-primary"
                >
                  次の問題
                </button>
              </div>
            </>
          )}
        </div>

        {/* サイドバー: 問題ナビゲーター */}
        <aside className="w-48 hidden lg:block">
          <ExamNavigator
            questions={store.questions}
            currentIndex={store.currentIndex}
            answerHistory={store.answerHistory}
            onGoTo={store.goToQuestion}
          />
        </aside>
      </div>
    </div>
  )
}
```

### 6.4 試験結果（`src/app/exam/[setId]/result/page.tsx`）

```typescript
'use client'

import { useExamStore } from '@/store/exam-store'
import { ExamResultDetail } from '@/components/exam/exam-result-detail'
import Link from 'next/link'
import { use } from 'react'

type Props = { params: Promise<{ setId: string }> }

export default function ExamResultPage({ params }: Props) {
  const { setId } = use(params)
  const store = useExamStore()
  const result = store.getExamResult()

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p>試験結果が見つかりません</p>
        <Link href="/exam" className="btn-secondary">試験選択へ</Link>
      </div>
    )
  }

  const durationMin = Math.floor(result.duration / 60000)
  const durationSec = Math.floor((result.duration % 60000) / 1000)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* 合否バナー */}
      <div className={`rounded-2xl p-8 text-center mb-8 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="text-6xl mb-3">{result.passed ? '🎉' : '😢'}</div>
        <div className={`text-4xl font-black mb-1 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
          {result.passed ? '合格' : '不合格'}
        </div>
        <div className="text-gray-500">
          {result.accuracy}% / 合格ライン {result.passingScore}%
        </div>
      </div>

      {/* スコア詳細 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{result.accuracy}%</div>
          <div className="text-sm text-gray-500 mt-1">正答率</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold">{result.correctCount}/{result.totalQuestions}</div>
          <div className="text-sm text-gray-500 mt-1">正解数</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold">{durationMin}:{String(durationSec).padStart(2, '0')}</div>
          <div className="text-sm text-gray-500 mt-1">所要時間</div>
        </div>
      </div>

      {/* 間違えた問題詳細 */}
      <ExamResultDetail incorrectQuestions={result.incorrectQuestions} />

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link href={`/exam/${setId}/confirm`} className="btn-primary flex-1 text-center">
          もう一度挑戦
        </Link>
        <Link href="/exam" className="btn-outline flex-1 text-center">
          試験選択へ
        </Link>
      </div>
    </div>
  )
}
```

---

## 7. コンポーネント実装

### 7.1 試験タイマー（`src/components/exam/exam-timer.tsx`）

```typescript
'use client'

import { useMemo } from 'react'

type Props = { seconds: number }

export function ExamTimer({ seconds }: Props) {
  const { minutes, secs, isWarning, isCritical } = useMemo(() => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return {
      minutes: m,
      secs: s,
      isWarning: seconds <= 300,    // 残り 5 分
      isCritical: seconds <= 60,    // 残り 1 分
    }
  }, [seconds])

  return (
    <div
      className={`font-mono text-2xl font-bold tabular-nums transition-colors ${
        isCritical ? 'text-red-600 animate-pulse' : isWarning ? 'text-orange-500' : 'text-gray-800'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}
```

### 7.2 問題ナビゲーター（`src/components/exam/exam-navigator.tsx`）

```typescript
type AnswerRecord = { questionId: string; isCorrect: boolean }
type Props = {
  questions: Array<{ id: string }>
  currentIndex: number
  answerHistory: AnswerRecord[]
  onGoTo: (index: number) => void
}

export function ExamNavigator({ questions, currentIndex, answerHistory, onGoTo }: Props) {
  const answerMap = new Map(answerHistory.map((h) => [h.questionId, h]))

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs font-semibold text-gray-500 mb-3">問題一覧</div>
      <div className="grid grid-cols-4 gap-2">
        {questions.map((q, i) => {
          const answer = answerMap.get(q.id)
          const isActive = i === currentIndex
          return (
            <button
              key={q.id}
              onClick={() => onGoTo(i)}
              className={`
                w-8 h-8 rounded-lg text-xs font-bold transition-all
                ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${!answer ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}
              `}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> 未回答
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100 inline-block" /> 回答済
        </span>
      </div>
    </div>
  )
}
```

### 7.3 Markdown レンダラー（`src/components/shared/ui/markdown-renderer.tsx`）

現行 `birgerik` リポジトリのものをそのまま移植する。

```typescript
// 現行リポジトリの src/components/shared/ui/markdown-renderer.tsx を移植
// parseMarkdownToHtml() ユーティリティと合わせて移植
```

### 7.4 円形プログレス（`src/components/shared/ui/progress-circle.tsx`）★新規

```typescript
type Props = { percentage: number; size?: number }

export function ProgressCircle({ percentage, size = 120 }: Props) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={8}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#3b82f6' : '#ef4444'}
        strokeWidth={8}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{ transform: `rotate(90deg)`, transformOrigin: 'center' }}
        fill="#111"
        fontSize={24}
        fontWeight="bold"
      >
        {percentage}%
      </text>
    </svg>
  )
}
```

---

## 8. Markdown ユーティリティ（`src/lib/utils/markdown.ts`）

現行 `birgerik` リポジトリの `src/lib/utils/markdown.ts` をそのまま移植する。

---

## 9. 共通 UI ユーティリティ（`src/lib/utils/cn.ts`）

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 10. レイアウト

### 10.1 学習モードレイアウト（`src/app/study/layout.tsx`）

```typescript
import Link from 'next/link'

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/study" className="text-xl font-black text-blue-600">Birgerik</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/study" className="text-gray-600 hover:text-blue-600">学習</Link>
            <Link href="/exam" className="text-gray-600 hover:text-blue-600">試験</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

### 10.2 試験モードレイアウト（`src/app/exam/layout.tsx`）

試験実施中はヘッダーをシンプルにする（ナビゲーションを非表示）。

```typescript
export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
```

---

## 11. ページ・コンポーネント対応表

| ページ | データ取得 | 状態管理 | 主要コンポーネント |
|--------|-----------|---------|------------------|
| `/study` | `getCertifications()` | なし | `CertificationCard` |
| `/study/[certId]` | `getCertifications()` | なし | `QuestionSetCard` |
| `/study/.../mode-select` | `getQuestionSetDetail()` | なし | — |
| `/study/.../practice` | `getQuestions()`, `getQuestionSetDetail()` | `useStudyStore` | `QuestionDisplay`, `ChoiceOption`, `AnswerFeedback` |
| `/study/.../result` | — | `useStudyStore` | `ProgressCircle`, `WrongQuestionsList` |
| `/exam` | `getCertifications()` | なし | `ExamCard` |
| `/exam/[setId]/confirm` | `getQuestionSetDetail()`, `getExamConfig()` | なし | `ExamConfirm` |
| `/exam/[setId]/session` | — | `useExamStore` | `ExamTimer`, `ExamNavigator`, `ExamQuestionDisplay` |
| `/exam/[setId]/result` | — | `useExamStore` | `ExamResultDetail`, `ProgressCircle` |

---

## 12. 実装順序

### Phase 1: 基盤セットアップ

1. Next.js プロジェクト作成 + 依存パッケージインストール
2. `@birgerik/types` のインポート設定（`.npmrc`）
3. `lib/api/client.ts` — API クライアント
4. `lib/utils/cn.ts` — ユーティリティ
5. `lib/utils/markdown.ts` — Markdown ユーティリティ（現行から移植）
6. `components/shared/ui/` — 基本 UI コンポーネント（現行から移植）
7. ルートレイアウト + ホーム → リダイレクト

### Phase 2: 学習モード（現行移植）

8. 学習ストア（`store/study-store.ts`）
9. 学習コンポーネント群（`components/study/`）
10. 学習ページ群（`app/study/`）
11. 動作確認

### Phase 3: 試験モード（新規実装）

12. 試験ストア（`store/exam-store.ts`）
13. 試験コンポーネント群（`components/exam/`）
14. 試験ページ群（`app/exam/`）
15. タイマー動作確認
16. 採点・合否ロジック確認

### Phase 4: UI 仕上げ

17. Framer Motion アニメーション追加
18. レスポンシブ調整
19. ダークモード（任意）
20. エラーハンドリング・not-found ページ

---

## 13. 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | Birgerik Core の API ベース URL（例: `https://birgerik-core.vercel.app/api/v1`） |

---

## 14. デプロイ設定（`next.config.ts`）

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @birgerik/types の型インポートに必要な場合
  transpilePackages: ['@birgerik/types'],
}

export default nextConfig
```

---

*作成日: 2026-02-19*
*対象バージョン: Birgerik v1.0.0*
