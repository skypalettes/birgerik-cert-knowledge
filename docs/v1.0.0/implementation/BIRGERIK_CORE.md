# Birgerik Core 実装ドキュメント

> **対象リポジトリ:** `birgerik-core`（新規作成）
> **役割:** マザーシステム — REST API + 管理 UI + `@birgerik/types` パッケージ
> **プラットフォーム:** Vercel (Next.js App Router)
> **参照:** [ARCHITECTURE.md](../ARCHITECTURE.md) / [REQUIREMENTS.md](../REQUIREMENTS.md)

---

## 1. プロジェクト初期セットアップ

### 1.1 リポジトリ作成

```bash
npx create-next-app@latest birgerik-core \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*"
cd birgerik-core
```

### 1.2 依存パッケージ

```bash
# Core
pnpm add @supabase/supabase-js @supabase/ssr jose zod zustand

# UI
pnpm add react-hook-form @hookform/resolvers lucide-react clsx tailwind-merge
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add @uiw/react-md-editor @uiw/react-markdown-preview
pnpm add react-markdown remark-gfm remark-breaks rehype-sanitize rehype-highlight
pnpm add sonner next-themes framer-motion

# Dev
pnpm add -D @types/node @types/react @types/react-dom tsx
```

### 1.3 環境変数（`.env.local`）

```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
JWT_SECRET=<32文字以上のシークレット>
ALLOWED_ORIGINS=http://localhost:3000
```

### 1.4 package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "types:generate": "npx supabase gen types typescript --project-id <project-id> > src/lib/types/database.types.ts",
    "create-user": "tsx scripts/create-user.ts",
    "manage-user": "tsx scripts/manage-user.ts"
  }
}
```

---

## 2. ディレクトリ構成

```
birgerik-core/
├── packages/
│   └── types/                          # @birgerik/types（GitHub Packages で公開）
│       ├── src/
│       │   ├── api.ts                  # API レスポンス型
│       │   ├── study.ts               # 学習セッション型
│       │   ├── exam.ts                # 試験セッション型 ★新規
│       │   └── index.ts               # re-export
│       ├── tsconfig.json
│       └── package.json
├── src/
│   ├── app/
│   │   ├── api/v1/                    # REST API
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── me/route.ts
│   │   │   │   └── refresh/route.ts   ★新規
│   │   │   ├── certifications/
│   │   │   │   ├── route.ts           # GET(一覧) / POST(作成)
│   │   │   │   └── [id]/route.ts      # GET / PUT / DELETE
│   │   │   ├── question-sets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── questions/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── exams/                 ★新規
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── study/
│   │   │       ├── certifications/route.ts
│   │   │       ├── question-sets/[id]/route.ts
│   │   │       ├── questions/[questionSetId]/route.ts
│   │   │       └── exams/[questionSetId]/route.ts  ★新規
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── certifications/page.tsx
│   │   │   ├── question-sets/page.tsx
│   │   │   ├── questions/page.tsx
│   │   │   ├── exams/page.tsx         ★新規
│   │   │   └── users/page.tsx         ★新規
│   │   ├── layout.tsx
│   │   └── page.tsx                   # → /admin にリダイレクト
│   ├── components/
│   │   ├── admin/
│   │   │   ├── certification-form-modal.tsx
│   │   │   ├── question-set-form-modal.tsx
│   │   │   ├── question-form-modal.tsx
│   │   │   ├── exam-form-modal.tsx    ★新規
│   │   │   ├── user-form-modal.tsx    ★新規
│   │   │   ├── delete-dialog.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   └── markdown-split-editor.tsx
│   │   └── shared/
│   │       ├── error-message.tsx
│   │       └── loading-spinner.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── middleware.ts          # JWT 認証ミドルウェア
│   │   │   ├── response.ts           # レスポンスヘルパー
│   │   │   └── verify-supabase-token.ts
│   │   ├── auth/
│   │   │   └── jwt.ts                # JWT 生成・検証
│   │   ├── database/
│   │   │   ├── certifications.ts
│   │   │   ├── question-sets.ts
│   │   │   ├── questions.ts
│   │   │   ├── exams.ts              ★新規
│   │   │   └── study.ts
│   │   ├── actions/
│   │   │   ├── certifications.ts
│   │   │   ├── question-sets.ts
│   │   │   ├── questions.ts
│   │   │   ├── exams.ts              ★新規
│   │   │   ├── users.ts              ★新規
│   │   │   └── study.ts
│   │   ├── validations/
│   │   │   ├── certification.ts
│   │   │   ├── question-set.ts
│   │   │   ├── question.ts
│   │   │   ├── exam.ts               ★新規
│   │   │   └── user.ts               ★新規
│   │   ├── errors/
│   │   │   └── index.ts
│   │   ├── supabase/
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── markdown.ts
│   │       └── cn.ts
│   └── middleware.ts                  # CORS + Admin 認証
├── scripts/
│   ├── create-user.ts
│   └── manage-user.ts
├── docs/
│   └── api/
│       └── README.md
├── .env.local
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 3. `@birgerik/types` パッケージ

### 3.1 package.json

```json
{
  "name": "@birgerik/types",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "files": ["src"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/irunahub/birgerik-core.git",
    "directory": "packages/types"
  }
}
```

### 3.2 `src/api.ts` — API 型定義

```typescript
// ==================== データモデル ====================

export interface CertificationWithQuestionSets {
  id: string
  name: string
  description: string | null
  question_sets: QuestionSetSummary[]
}

export interface QuestionSetSummary {
  id: string
  name: string
  description: string | null
  question_count: number
  is_active: boolean        // ★追加: 公開/非公開
  has_exam: boolean          // ★追加: 試験設定の有無
}

export interface QuestionSetDetail {
  id: string
  name: string
  description: string | null
  certification_name: string
  question_count: number
  is_active: boolean         // ★追加
}

export interface QuestionWithChoices {
  id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  order_index: number | null
  choices: Choice[]
}

export interface Choice {
  id: string
  choice_text: string
  is_correct: boolean
  order_index: number | null
}

// ==================== 試験設定 ★新規 ====================

export interface ExamConfig {
  id: string
  question_set_id: string
  question_count: number
  time_limit_minutes: number
  passing_score: number
}

// ==================== API レスポンス ====================

export interface GetCertificationsResponse {
  certifications: CertificationWithQuestionSets[]
}

export interface GetQuestionSetResponse {
  question_set: QuestionSetDetail
}

export interface GetQuestionsResponse {
  questions: QuestionWithChoices[]
}

export interface GetExamConfigResponse {
  exam: ExamConfig
}

export interface ErrorResponse {
  error: string
}

export interface SuccessResponse<T> {
  success: true
  data: T
}
```

### 3.3 `src/study.ts` — 学習セッション型（現行踏襲）

```typescript
import type { QuestionWithChoices } from './api'

export interface UserAnswer {
  questionId: string
  selectedChoiceIds: string[]
  isCorrect: boolean
  answeredAt: Date
}

export interface StudySession {
  questionSetId: string
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
}

export interface StudyResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  incorrectQuestions: QuestionWithChoices[]
  duration: number
}
```

### 3.4 `src/exam.ts` — 試験セッション型 ★新規

```typescript
import type { QuestionWithChoices, ExamConfig } from './api'
import type { UserAnswer } from './study'

export interface ExamSession {
  examConfig: ExamConfig
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]        // ランダム抽出済み
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
  timeRemaining: number                   // 残り時間（秒）
}

export interface ExamResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number                        // 0–100
  passingScore: number                    // 0–100
  passed: boolean
  duration: number                        // ミリ秒
  incorrectQuestions: QuestionWithChoices[]
}
```

### 3.5 `src/index.ts`

```typescript
export * from './api'
export * from './study'
export * from './exam'
```

---

## 4. データベース

### 4.1 スキーマ変更 SQL

現行テーブルに対して以下を適用する。

```sql
-- question_sets に is_active カラム追加
ALTER TABLE question_sets
  ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- exams テーブル新規作成
CREATE TABLE exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id uuid NOT NULL UNIQUE REFERENCES question_sets(id),
  question_count integer NOT NULL CHECK (question_count > 0),
  time_limit_minutes integer NOT NULL CHECK (time_limit_minutes > 0),
  passing_score integer NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX idx_exams_question_set_id ON exams(question_set_id);
CREATE INDEX idx_question_sets_is_active ON question_sets(is_active);
```

### 4.2 Database 型再生成

スキーマ変更後に Supabase CLI で型を再生成する。

```bash
pnpm types:generate
```

---

## 5. 共通基盤（`src/lib/`）— 現行移植

以下のモジュールは現行リポジトリ `birgerik` から移植する。パターンは同一。

### 5.1 `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component では無視 */ }
        },
      },
    }
  )
}
```

### 5.2 `lib/auth/jwt.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRATION = '7d'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] })
  if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Invalid token payload')
  }
  return { userId: payload.userId as string, email: payload.email as string }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
```

### 5.3 `lib/api/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { unauthorizedResponse, serverErrorResponse } from './response'
import type { JWTPayload } from '@/lib/auth/jwt'

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  if (!token) return unauthorizedResponse('認証トークンが必要です')
  try {
    const user = await verifyToken(token)
    return { user }
  } catch {
    return unauthorizedResponse('無効なトークンです')
  }
}

export function withAuth<T = void>(
  handler: (request: NextRequest, params: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Promise<T> }): Promise<NextResponse> => {
    const result = await authenticateRequest(request)
    if (result instanceof NextResponse) return result
    try {
      const params = await context.params
      return await handler(request, params)
    } catch (error) {
      console.error('API Error:', error)
      return serverErrorResponse('サーバーエラーが発生しました')
    }
  }
}
```

### 5.4 `lib/api/response.ts`

```typescript
import { NextResponse } from 'next/server'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status, headers: JSON_HEADERS })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: JSON_HEADERS })
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    { error: '入力内容に誤りがあります', fieldErrors: errors },
    { status: 422, headers: JSON_HEADERS }
  )
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401, headers: JSON_HEADERS })
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403, headers: JSON_HEADERS })
}

export function notFoundResponse(message = 'Not Found') {
  return NextResponse.json({ error: message }, { status: 404, headers: JSON_HEADERS })
}

export function serverErrorResponse(message = 'Internal Server Error') {
  return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS })
}
```

### 5.5 `lib/errors/index.ts`

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}が見つかりません`, 'NOT_FOUND', 404)
  }
}

export function handleSupabaseError(error: unknown): AppError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const e = error as { code: string; message?: string }
    switch (e.code) {
      case '23505': return new AppError('このデータは既に登録されています', 'UNIQUE_VIOLATION', 409)
      case '23503': return new AppError('関連するデータが見つかりません', 'FK_VIOLATION', 400)
      case 'PGRST116': return new NotFoundError('データ')
    }
  }
  return new DatabaseError('データベースエラーが発生しました')
}
```

### 5.6 `lib/database/` — DatabaseResult 型

全 database 関数は以下の型で結果を返す。

```typescript
export type DatabaseResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}
```

---

## 6. REST API 実装

### 6.1 認証エンドポイント

#### `POST /api/v1/auth/login`

```typescript
// src/app/api/v1/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signToken } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
  }
  const token = await signToken({ userId: data.user.id, email: data.user.email! })
  return NextResponse.json({
    success: true,
    data: {
      token,
      user: { id: data.user.id, email: data.user.email }
    }
  })
}
```

#### `GET /api/v1/auth/me`

```typescript
// withAuth で保護
export const GET = withAuth(async (request: NextRequest) => {
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  const payload = await verifyToken(token!)
  return successResponse({ userId: payload.userId, email: payload.email })
})
```

#### `POST /api/v1/auth/refresh` ★新規

```typescript
export const POST = withAuth(async (request: NextRequest) => {
  const oldToken = extractTokenFromHeader(request.headers.get('authorization'))
  const payload = await verifyToken(oldToken!)
  const newToken = await signToken({ userId: payload.userId, email: payload.email })
  return successResponse({ token: newToken })
})
```

### 6.2 管理 API（CRUD）パターン

全リソース（certifications / question-sets / questions / exams）は同一パターンで実装する。

#### 一覧 + 作成 (`route.ts`)

```typescript
// src/app/api/v1/certifications/route.ts
import { NextRequest } from 'next/server'
import { unstable_cache, revalidateTag } from 'next/cache'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api/response'
import { getCertifications, createCertification } from '@/lib/database/certifications'

// GET: 一覧取得（キャッシュ 60 秒）
export const GET = withAuth(async () => {
  try {
    const getCached = unstable_cache(
      async () => getCertifications(),
      ['certifications'],
      { revalidate: 60, tags: ['certifications'] }
    )
    const data = await getCached()
    return successResponse(data)
  } catch (error) {
    console.error('GET /certifications error:', error)
    return serverErrorResponse()
  }
})

// POST: 作成
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const result = await createCertification(body)
    if (!result.success) return errorResponse(result.error!)
    revalidateTag('certifications')
    return successResponse(result.data, 201)
  } catch (error) {
    console.error('POST /certifications error:', error)
    return serverErrorResponse()
  }
})
```

#### 個別操作 (`[id]/route.ts`)

```typescript
// src/app/api/v1/certifications/[id]/route.ts
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/response'
import { getCertification, updateCertification, deleteCertification } from '@/lib/database/certifications'
import { revalidateTag } from 'next/cache'

type Params = { id: string }

// GET: 詳細取得
export const GET = withAuth<Params>(async (_request, { id }) => {
  try {
    const data = await getCertification(id)
    if (!data) return notFoundResponse('資格が見つかりません')
    return successResponse(data)
  } catch (error) {
    console.error('GET /certifications/:id error:', error)
    return serverErrorResponse()
  }
})

// PUT: 更新
export const PUT = withAuth<Params>(async (request, { id }) => {
  try {
    const body = await request.json()
    const result = await updateCertification({ ...body, id })
    if (!result.success) return errorResponse(result.error!)
    revalidateTag('certifications')
    return successResponse(null)
  } catch (error) {
    console.error('PUT /certifications/:id error:', error)
    return serverErrorResponse()
  }
})

// DELETE: 削除
export const DELETE = withAuth<Params>(async (_request, { id }) => {
  try {
    const result = await deleteCertification(id)
    if (!result.success) return errorResponse(result.error!)
    revalidateTag('certifications')
    return successResponse(null)
  } catch (error) {
    console.error('DELETE /certifications/:id error:', error)
    return serverErrorResponse()
  }
})
```

### 6.3 Exams API ★新規

#### `lib/database/exams.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/errors'
import { examSchema, updateExamSchema } from '@/lib/validations/exam'
import type { DatabaseResult } from './types'

export async function getExams() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      question_set:question_sets (
        id,
        name,
        certification:certifications ( id, name )
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw handleSupabaseError(error)
  return data
}

export async function getExam(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      question_set:question_sets (
        id,
        name,
        certification:certifications ( id, name )
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw handleSupabaseError(error)
  return data
}

export async function createExam(input: unknown): Promise<DatabaseResult<{ id: string }>> {
  try {
    const result = examSchema.safeParse(input)
    if (!result.success) {
      return { success: false, error: '入力内容に誤りがあります' }
    }
    const supabase = await createClient()

    // question_count が問題集の総問題数以下であることを検証
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', result.data.question_set_id)
    if (count !== null && result.data.question_count > count) {
      return { success: false, error: `出題数は問題数（${count}問）以下にしてください` }
    }

    const { data, error } = await supabase
      .from('exams')
      .insert(result.data)
      .select('id')
      .single()
    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('createExam error:', error)
    return { success: false, error: '試験の作成に失敗しました' }
  }
}

export async function updateExam(input: unknown): Promise<DatabaseResult> {
  try {
    const result = updateExamSchema.safeParse(input)
    if (!result.success) {
      return { success: false, error: '入力内容に誤りがあります' }
    }
    const { id, ...data } = result.data
    const supabase = await createClient()

    // question_count バリデーション（作成と同様）
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_set_id', data.question_set_id)
    if (count !== null && data.question_count > count) {
      return { success: false, error: `出題数は問題数（${count}問）以下にしてください` }
    }

    const { error } = await supabase
      .from('exams')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }
    return { success: true }
  } catch (error) {
    console.error('updateExam error:', error)
    return { success: false, error: '試験の更新に失敗しました' }
  }
}

export async function deleteExam(id: string): Promise<DatabaseResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('exams').delete().eq('id', id)
    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }
    return { success: true }
  } catch (error) {
    console.error('deleteExam error:', error)
    return { success: false, error: '試験の削除に失敗しました' }
  }
}
```

#### `lib/validations/exam.ts`

```typescript
import { z } from 'zod'

export const examFormSchema = z.object({
  question_set_id: z.string().uuid('問題集を選択してください'),
  question_count: z.number().int().min(1, '1以上を指定してください'),
  time_limit_minutes: z.number().int().min(1, '1分以上を指定してください'),
  passing_score: z.number().int().min(0).max(100, '0〜100の範囲で指定してください'),
})

export const examSchema = examFormSchema

export const updateExamSchema = examSchema.extend({
  id: z.string().uuid(),
})

export type ExamFormInput = z.infer<typeof examFormSchema>
```

### 6.4 学習用エンドポイント

#### `GET /api/v1/study/certifications`

現行を移植。`is_active = true` の問題集のみ返却するように変更する。

```typescript
// lib/database/study.ts 内
export async function getCertificationsWithQuestionSets() {
  const supabase = await createClient()

  // 有効な問題集のみ取得
  const { data: certifications } = await supabase
    .from('certifications')
    .select(`
      id, name, description,
      question_sets!inner (
        id, name, description, is_active
      )
    `)
    .eq('question_sets.is_active', true)        // ★ is_active フィルタ
    .order('name')

  // 問題数カウント + has_exam フラグ取得
  // ... 省略: 現行の N+1 最適化パターンを踏襲
}
```

#### `GET /api/v1/study/exams/:questionSetId` ★新規

```typescript
// src/app/api/v1/study/exams/[questionSetId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { questionSetId: string }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { questionSetId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exams')
    .select('id, question_set_id, question_count, time_limit_minutes, passing_score')
    .eq('question_set_id', questionSetId)
    .single()

  if (error) {
    return NextResponse.json({ error: '試験設定が見つかりません' }, { status: 404 })
  }
  return NextResponse.json(
    { exam: data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
      }
    }
  )
}
```

### 6.5 `question_sets` への `is_active` 対応

#### Database 層の変更

```typescript
// lib/database/question-sets.ts — createQuestionSet
// is_active を含めてインサート（デフォルト true）

// lib/database/question-sets.ts — updateQuestionSet
// is_active を更新可能に
```

#### バリデーションの変更

```typescript
// lib/validations/question-set.ts
export const questionSetFormSchema = z.object({
  certification_id: z.string().uuid('資格を選択してください'),
  name: z.string().min(1, '名前は必須です').max(100).trim(),
  description: z.string().max(500).trim(),
  is_active: z.boolean().default(true),          // ★追加
})
```

---

## 7. 管理 UI 実装

### 7.1 共通パターン

全管理ページは以下のパターンで実装する。

**ページ構成（Server Component）:**

```typescript
// src/app/admin/certifications/page.tsx
import { getCertifications } from '@/lib/database/certifications'
import { CertificationList } from '@/components/admin/certification-list'

export default async function CertificationsPage() {
  const certifications = await getCertifications()
  return (
    <div>
      <h1>資格管理</h1>
      <CertificationList initialData={certifications} />
    </div>
  )
}
```

**Client Component（一覧 + モーダル）:**

```typescript
'use client'
// react-hook-form + zodResolver でフォーム管理
// Server Action を呼び出して CRUD 操作
// sonner で toast 通知
// モーダルで作成・編集フォームを表示
```

**Server Action パターン:**

```typescript
'use server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createXxx(formData: XxxFormInput): Promise<ActionResult<{ id: string }>> {
  const result = schema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: '入力エラー', fieldErrors: result.error.flatten().fieldErrors }
  }
  const dbResult = await dbCreate(result.data)
  if (!dbResult.success) return dbResult
  revalidatePath('/admin/xxx')
  return dbResult
}
```

### 7.2 試験管理 UI ★新規

**`src/app/admin/exams/page.tsx`**

- 試験一覧テーブル（問題集名・出題数・制限時間・合格ライン）
- 作成ボタン → モーダル
- 編集・削除ボタン

**`src/components/admin/exam-form-modal.tsx`**

フォームフィールド:

| フィールド | 型 | UI | 備考 |
|-----------|----|----|------|
| question_set_id | select | 問題集ドロップダウン | 既に試験設定がある問題集は除外 |
| question_count | number | 数値入力 | 問題数以下のバリデーション |
| time_limit_minutes | number | 数値入力 | 分単位 |
| passing_score | number | 数値入力 / スライダー | 0–100% |

### 7.3 ユーザ管理 UI ★新規

**`src/app/admin/users/page.tsx`**

- ユーザ一覧テーブル（メール・ロール・作成日）
- 作成・編集・削除

**`src/components/admin/user-form-modal.tsx`**

フォームフィールド:

| フィールド | 型 | UI |
|-----------|----|----|
| email | string | メール入力 |
| password | string | パスワード入力（作成時のみ） |
| role | select | admin / user |

**`lib/database/users.ts`** — Supabase Auth Admin API を使用:

```typescript
import { createClient } from '@supabase/supabase-js'

// Service Role Key を使用した管理用クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  // ...
}

export async function createUser(email: string, password: string, role: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { role },
    email_confirm: true,
  })
  // ...
}
```

### 7.4 問題集管理 — `is_active` トグル追加

問題集の一覧テーブルに「公開/非公開」トグルスイッチを追加する。

```typescript
// 問題集一覧テーブルのカラムに追加
<td>
  <ToggleSwitch
    checked={questionSet.is_active}
    onChange={() => toggleIsActive(questionSet.id, !questionSet.is_active)}
    label={questionSet.is_active ? '公開中' : '非公開'}
  />
</td>
```

---

## 8. Middleware（CORS + Admin 保護）

### 8.1 `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- CORS（/api/v1/*）---
  if (pathname.startsWith('/api/v1')) {
    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(request),
      })
    }
    // 通常リクエストに CORS ヘッダー付与
    const response = NextResponse.next()
    Object.entries(corsHeaders(request)).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

  // --- Admin 保護（/admin/*）---
  if (pathname.startsWith('/admin')) {
    // Supabase セッション確認 → 未ログイン or role !== 'admin' → リダイレクト
    // ... 現行パターン踏襲
  }

  return NextResponse.next()
}

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  const isStudyApi = request.nextUrl.pathname.startsWith('/api/v1/study')
  const allowedOrigin = isStudyApi ? '*' : (process.env.ALLOWED_ORIGINS || '')

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/v1/:path*'],
}
```

### 8.2 CORS ポリシー

| API | CORS Origin |
|-----|-------------|
| 管理 API (`/api/v1/certifications` 等) | `ALLOWED_ORIGINS` 環境変数 |
| 学習 API (`/api/v1/study/*`) | `*`（全オリジン許可） |

---

## 9. キャッシュ戦略

| 対象 | 方式 | TTL | 無効化 |
|------|------|-----|--------|
| 管理 API GET | `unstable_cache` | 60 秒 | `revalidateTag()` (POST/PUT/DELETE 時) |
| 学習 API GET | HTTP Cache-Control | `s-maxage=60, stale-while-revalidate=30` | 自動 |
| 管理 UI | `revalidatePath()` | 即時 | Server Action 後 |

**キャッシュタグ一覧:**

| タグ | 使用箇所 |
|------|---------|
| `certifications` | 資格一覧 |
| `question-sets` | 問題集一覧 |
| `questions` | 問題一覧 |
| `exams` | 試験一覧 ★新規 |

---

## 10. 実装順序

以下の順序で段階的に実装する。

### Phase 1: 基盤セットアップ

1. Next.js プロジェクト作成 + 依存パッケージインストール
2. `packages/types` パッケージ作成（全型定義）
3. `lib/supabase/` — Supabase クライアント
4. `lib/auth/jwt.ts` — JWT 認証
5. `lib/api/` — middleware + response ヘルパー
6. `lib/errors/` — エラーハンドリング
7. `middleware.ts` — CORS + Admin 保護
8. DB スキーマ変更（`is_active` + `exams` テーブル）

### Phase 2: 現行機能移植

9. `lib/database/certifications.ts` — 移植
10. `lib/database/question-sets.ts` — 移植 + `is_active` 対応
11. `lib/database/questions.ts` — 移植
12. `lib/database/study.ts` — 移植 + `is_active` フィルタ
13. `lib/validations/` — 全バリデーション移植 + 新規追加
14. REST API ルート移植（auth / certifications / question-sets / questions / study）
15. `lib/actions/` — Server Actions 移植

### Phase 3: 新規機能

16. `lib/database/exams.ts` — 試験 DB 層
17. REST API `/api/v1/exams` — 試験 CRUD
18. REST API `/api/v1/study/exams/:questionSetId` — 学習用試験取得
19. `lib/database/users.ts` — ユーザ管理 DB 層
20. `lib/actions/exams.ts` — 試験 Server Actions
21. `lib/actions/users.ts` — ユーザ Server Actions

### Phase 4: 管理 UI

22. Admin レイアウト + サイドバー
23. ログインページ
24. 資格管理ページ（移植）
25. 問題集管理ページ（移植 + `is_active` トグル）
26. 問題管理ページ（移植）
27. 試験管理ページ（★新規）
28. ユーザ管理ページ（★新規）

### Phase 5: `@birgerik/types` 公開

29. GitHub Packages 設定
30. `npm publish` で公開

---

## 11. 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon キー |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role キー（ユーザ管理用） |
| `JWT_SECRET` | ✅ | JWT 署名シークレット（32 文字以上） |
| `ALLOWED_ORIGINS` | ✅ | 管理 API の許可オリジン |

---

*作成日: 2026-02-19*
*対象バージョン: Birgerik v1.0.0*
