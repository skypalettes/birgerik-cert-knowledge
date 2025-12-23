# Birgerik Core 分離プロジェクト - 提案資料 v3.0（シンプルアプローチ + パフォーマンス最適化）

## 📋 目次
1. [アプローチの比較](#アプローチの比較)
2. [推奨: 既存アプリに API 追加](#推奨-既存アプリに-api-追加)
3. [API パフォーマンス最適化](#api-パフォーマンス最適化)
4. [Fastify vs Next.js API Routes](#fastify-vs-nextjs-api-routes)
5. [実装ロードマップ](#実装ロードマップ)

---

## アプローチの比較

### オプション A: 既存アプリに API を追加（推奨 ✅）

#### プロジェクト構造
```
birgerik/（既存のまま）
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/                    # REST API（新規）
│   │   │       ├── certifications/
│   │   │       │   └── route.ts
│   │   │       ├── question-sets/
│   │   │       │   └── route.ts
│   │   │       ├── questions/
│   │   │       │   └── route.ts
│   │   │       ├── study/
│   │   │       │   └── route.ts
│   │   │       └── auth/
│   │   │           ├── login/route.ts
│   │   │           └── me/route.ts
│   │   ├── admin/                     # Web UI（既存）
│   │   │   ├── certifications/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts         # Server Actions（維持）
│   │   │   ├── question-sets/
│   │   │   └── questions/
│   │   └── study/                     # Web UI（既存）
│   │
│   ├── lib/
│   │   ├── database/                  # 共有 DB レイヤー（新規）
│   │   │   ├── client.ts              # Supabase Client
│   │   │   ├── certifications.ts      # CRUD functions
│   │   │   ├── question-sets.ts
│   │   │   ├── questions.ts
│   │   │   └── study.ts
│   │   ├── actions/                   # Server Actions（既存、リファクタリング）
│   │   │   └── study.ts
│   │   ├── supabase/                  # Supabase（既存）
│   │   ├── types/                     # Types（既存）
│   │   └── validations/               # Zod schemas（既存）
│   │
│   └── middleware.ts                  # Auth（既存）
│
├── package.json
├── next.config.ts
└── tsconfig.json
```

#### データフロー

**Web アプリ（高速）**:
```
Server Component/Server Action
    ↓
lib/database/certifications.ts (共有)
    ↓
Supabase
    ↓
Response (0ms ネットワークレイテンシー)
```

**Obsidian プラグイン（API 経由）**:
```
HTTP Request
    ↓
app/api/v1/certifications/route.ts
    ↓
lib/database/certifications.ts (同じコード)
    ↓
Supabase
    ↓
HTTP Response
```

#### メリット
- ✅ **超シンプル**：新しいツール不要（Turborepo なし）
- ✅ **学習コスト最小**：既存の Next.js 知識だけで OK
- ✅ **すぐに始められる**：今日から実装可能
- ✅ **1 つのプロジェクト**：デプロイが簡単
- ✅ **型の共有が容易**：同じ tsconfig、同じ型定義
- ✅ **段階的移行**：少しずつ進められる
- ✅ **Server Actions 維持**：Web アプリのパフォーマンス最高速

#### デメリット
- ⚠️ API と Web UI が同じプロジェクト（密結合）
- ⚠️ ビルドサイズが大きくなる可能性（実際はほぼ影響なし）

---

### オプション B: Fastify 別サーバー（高速）

#### プロジェクト構造
```
birgerik/（既存）              # Next.js Web アプリ
├── src/app/admin/             # Web UI
├── src/app/study/             # Web UI
└── ...

birgerik-api/（新規）          # Fastify API サーバー
├── src/
│   ├── routes/
│   │   ├── certifications.ts
│   │   ├── question-sets.ts
│   │   ├── questions.ts
│   │   └── auth.ts
│   ├── services/
│   │   └── database.ts        # DB レイヤー
│   ├── plugins/
│   │   ├── auth.ts
│   │   └── cors.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

#### メリット
- ✅ **超高速**：Fastify は Next.js API Routes の 2-3 倍速い
- ✅ **API 専用最適化**：Connection pooling、Caching など
- ✅ **独立したスケーリング**：API だけスケールアウト可能
- ✅ **本格的な API フレームワーク**：プラグインエコシステム

#### デメリット
- ❌ **2 つのプロジェクト管理**：複雑度が増加
- ❌ **型の共有が複雑**：npm package 化または手動同期が必要
- ❌ **Vercel デプロイが複雑**：2 つのプロジェクトを別々にデプロイ
- ❌ **開発環境**：2 つのサーバーを起動する必要がある

---

### オプション C: Turborepo Monorepo（中間）

#### メリット
- ✅ 完全な分離
- ✅ 型の共有が容易
- ✅ 高速ビルド

#### デメリット
- ⚠️ 学習コスト
- ⚠️ 初期セットアップ

---

### 比較表

| 項目 | オプション A<br/>（既存アプリ + API） | オプション B<br/>（Fastify 別サーバー） | オプション C<br/>（Turborepo） |
|------|-----------------------------------|--------------------------------------|----------------------------|
| **シンプルさ** | ⭐⭐⭐⭐⭐ 最もシンプル | ⭐⭐ 複雑 | ⭐⭐⭐ 中程度 |
| **学習コスト** | ⭐⭐⭐⭐⭐ 最小 | ⭐⭐⭐ 中程度 | ⭐⭐⭐ 中程度 |
| **Web パフォーマンス** | ⭐⭐⭐⭐⭐ 最速 | ⭐⭐⭐⭐⭐ 最速 | ⭐⭐⭐⭐⭐ 最速 |
| **API パフォーマンス** | ⭐⭐⭐⭐ 速い | ⭐⭐⭐⭐⭐ 最速 | ⭐⭐⭐⭐ 速い |
| **型の共有** | ⭐⭐⭐⭐⭐ 容易 | ⭐⭐ 困難 | ⭐⭐⭐⭐⭐ 容易 |
| **デプロイ** | ⭐⭐⭐⭐⭐ 簡単 | ⭐⭐ 複雑 | ⭐⭐⭐⭐ 簡単 |
| **開発体験** | ⭐⭐⭐⭐⭐ 最高 | ⭐⭐⭐ 普通 | ⭐⭐⭐⭐ 良い |
| **将来の拡張性** | ⭐⭐⭐ 中程度 | ⭐⭐⭐⭐ 良い | ⭐⭐⭐⭐⭐ 最高 |
| **推奨度** | ✅ **推奨** | ⚠️ 必要に応じて | ⚠️ 大規模化したら |

---

## 推奨: 既存アプリに API 追加

### なぜこのアプローチが最適か

1. **シンプルさ**: 新しいツールや構成を学ぶ必要がない
2. **段階的移行**: 今日から少しずつ進められる
3. **型の共有**: 追加の設定不要
4. **デプロイが簡単**: 既存の Vercel 設定をそのまま使える
5. **Server Actions 維持**: Web アプリのパフォーマンスは最高速
6. **十分な API パフォーマンス**: Obsidian プラグインには十分

### 実装例

#### 1. lib/database/certifications.ts（新規）

```typescript
// 共有 DB レイヤー
import { createClient } from '@/lib/supabase/server'
import { certificationSchema } from '@/lib/validations/certification'
import type { Database } from '@/lib/types/database.types'

type Certification = Database['public']['Tables']['certifications']['Row']

// GET - すべての認定資格を取得
export async function getCertifications(): Promise<Certification[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch certifications: ${error.message}`)
  }

  return data
}

// GET - 単一の認定資格を取得
export async function getCertification(id: string): Promise<Certification | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch certification: ${error.message}`)
  }

  return data
}

// POST - 認定資格を作成
export async function createCertification(input: unknown): Promise<Certification> {
  // バリデーション
  const validated = certificationSchema.parse(input)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create certification: ${error.message}`)
  }

  return data
}

// PUT - 認定資格を更新
export async function updateCertification(
  id: string,
  input: unknown
): Promise<Certification> {
  const validated = certificationSchema.parse(input)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update certification: ${error.message}`)
  }

  return data
}

// DELETE - 認定資格を削除
export async function deleteCertification(id: string): Promise<void> {
  const supabase = await createClient()

  // 関連する question_sets があるかチェック
  const { count } = await supabase
    .from('question_sets')
    .select('*', { count: 'exact', head: true })
    .eq('certification_id', id)

  if (count && count > 0) {
    throw new Error(
      `この認定資格には ${count} 個の問題セットが紐づいているため、削除できません。`
    )
  }

  const { error } = await supabase
    .from('certifications')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete certification: ${error.message}`)
  }
}
```

---

#### 2. app/admin/certifications/actions.ts（既存をリファクタリング）

```typescript
'use server'

import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/database/certifications'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

// Server Action - lib/database を呼び出すだけ
export async function getCertificationsAction() {
  return await getCertifications()
}

export async function createCertificationAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const input = {
      name: formData.get('name'),
      description: formData.get('description'),
    }

    const certification = await createCertification(input)

    revalidatePath('/admin/certifications')

    return { success: true, data: certification }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '不明なエラーが発生しました' }
  }
}

export async function updateCertificationAction(
  id: string,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const input = {
      name: formData.get('name'),
      description: formData.get('description'),
    }

    const certification = await updateCertification(id, input)

    revalidatePath('/admin/certifications')

    return { success: true, data: certification }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '不明なエラーが発生しました' }
  }
}

export async function deleteCertificationAction(id: string): Promise<ActionResult> {
  try {
    await deleteCertification(id)

    revalidatePath('/admin/certifications')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '不明なエラーが発生しました' }
  }
}
```

**ポイント**:
- Server Actions は薄いラッパーになる
- `lib/database` から同じロジックを呼び出す
- `revalidatePath` などの Next.js 固有機能はここに残す

---

#### 3. app/api/v1/certifications/route.ts（新規）

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/database/certifications'

// GET /api/v1/certifications - すべて取得
export async function GET(request: NextRequest) {
  try {
    const certifications = await getCertifications()
    return NextResponse.json({ data: certifications })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/certifications - 作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const certification = await createCertification(body)

    return NextResponse.json({ data: certification }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
```

**ポイント**:
- REST API として公開
- **同じ** `lib/database` を呼び出す
- ビジネスロジックの重複なし

---

#### 4. app/api/v1/certifications/[id]/route.ts（新規）

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  getCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/database/certifications'

// GET /api/v1/certifications/:id - 単一取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certification = await getCertification(params.id)

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: certification })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/v1/certifications/:id - 更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const certification = await updateCertification(params.id, body)

    return NextResponse.json({ data: certification })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}

// DELETE /api/v1/certifications/:id - 削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCertification(params.id)

    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
```

---

## API パフォーマンス最適化

### 1. データベースレベルの最適化（最も効果的）

#### A. Connection Pooling
```typescript
// lib/database/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Supabase はデフォルトで connection pooling を使用
// 追加設定不要
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // API では session 不要
    },
  }
)
```

#### B. Database Indexing
```sql
-- Supabase ダッシュボードで実行
-- certifications テーブル
CREATE INDEX IF NOT EXISTS idx_certifications_name ON certifications(name);

-- question_sets テーブル
CREATE INDEX IF NOT EXISTS idx_question_sets_certification_id ON question_sets(certification_id);

-- questions テーブル
CREATE INDEX IF NOT EXISTS idx_questions_question_set_id ON questions(question_set_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(order_index);

-- choices テーブル
CREATE INDEX IF NOT EXISTS idx_choices_question_id ON choices(question_id);
CREATE INDEX IF NOT EXISTS idx_choices_order_index ON choices(order_index);
```

**効果**: クエリ時間を **50-80% 削減**（50ms → 10-25ms）

---

#### C. Query Optimization
```typescript
// ❌ 悪い例：N+1 クエリ
export async function getCertificationsWithCounts() {
  const certifications = await getCertifications()

  for (const cert of certifications) {
    const { count } = await supabase
      .from('question_sets')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', cert.id)

    cert.questionSetCount = count
  }

  return certifications
}

// ✅ 良い例：単一クエリ
export async function getCertificationsWithCounts() {
  const { data, error } = await supabase
    .from('certifications')
    .select(`
      *,
      question_sets:question_sets(count)
    `)

  if (error) throw new Error(error.message)

  return data.map(cert => ({
    ...cert,
    questionSetCount: cert.question_sets[0].count,
  }))
}
```

**効果**: クエリ数を **N+1 → 1** に削減

---

### 2. レスポンスキャッシング（効果大）

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'

export const getCertificationsCached = unstable_cache(
  async () => {
    return await getCertifications()
  },
  ['certifications'],
  {
    revalidate: 60, // 60秒間キャッシュ
    tags: ['certifications'],
  }
)

// app/api/v1/certifications/route.ts
import { getCertificationsCached } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const certifications = await getCertificationsCached()
    return NextResponse.json({ data: certifications })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

**効果**: 2回目以降のリクエストが **50ms → 1ms** に短縮

---

### 3. Response Compression

```typescript
// next.config.ts
const nextConfig = {
  compress: true, // gzip/brotli 圧縮を有効化（デフォルトで有効）
}

export default nextConfig
```

**効果**: レスポンスサイズを **50-70% 削減**

---

### 4. API Response の最適化

```typescript
// ❌ 悪い例：不要なフィールドを返す
export async function GET(request: NextRequest) {
  const certifications = await supabase
    .from('certifications')
    .select('*') // すべてのフィールド

  return NextResponse.json({ data: certifications })
}

// ✅ 良い例：必要なフィールドのみ
export async function GET(request: NextRequest) {
  const certifications = await supabase
    .from('certifications')
    .select('id, name, description') // 必要なフィールドのみ

  return NextResponse.json({ data: certifications })
}
```

---

## Fastify vs Next.js API Routes

### パフォーマンス比較

| 指標 | Next.js API Routes | Fastify |
|-----|-------------------|---------|
| **リクエスト/秒** | ~10,000 | ~30,000 |
| **レイテンシー（フレームワーク）** | 10-15ms | 3-5ms |
| **メモリ使用量** | 高 | 低 |
| **起動時間** | 遅い | 速い |

### 実際のレスポンス時間内訳

```
Total Response Time = Network + Framework + DB + Processing

Obsidian Plugin からのリクエスト例:
- Network Latency: 50-200ms  ←最大のボトルネック
- Framework: 3-15ms          ←ここが Fastify で改善される
- DB Query: 10-100ms         ←最適化可能
- Processing: 1-5ms

合計: 64-320ms
```

**重要な発見**:
- **ネットワークレイテンシー（50-200ms）が支配的**
- Fastify で改善されるのは **Framework 部分のみ（10-15ms → 3-5ms）**
- 全体への影響は **約 5-10ms 改善**（相対的に小さい）

### Fastify を検討すべきケース

1. **超高トラフィック**（10,000+ req/s）
2. **極めて低レイテンシーが必要**（ゲーム、リアルタイムアプリ）
3. **API 専用サーバー**として独立運用したい

### Next.js API Routes で十分なケース

1. **通常のトラフィック**（< 1,000 req/s）✅ birgerik はこれ
2. **開発のシンプルさ優先**
3. **Web アプリと統合**

---

### Fastify 実装例（参考）

もし将来的に Fastify が必要になった場合：

```typescript
// birgerik-api/src/server.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { certificationRoutes } from './routes/certifications'

const fastify = Fastify({
  logger: true,
  requestTimeout: 30000,
})

// CORS
await fastify.register(cors, {
  origin: ['https://birgerik.vercel.app', 'obsidian://'],
})

// Routes
await fastify.register(certificationRoutes, { prefix: '/api/v1' })

// Start
fastify.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server listening at ${address}`)
})
```

```typescript
// birgerik-api/src/routes/certifications.ts
import { FastifyInstance } from 'fastify'
import { getCertifications, createCertification } from '../services/database'

export async function certificationRoutes(fastify: FastifyInstance) {
  // GET /api/v1/certifications
  fastify.get('/certifications', async (request, reply) => {
    try {
      const certifications = await getCertifications()
      return { data: certifications }
    } catch (error) {
      reply.code(500)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // POST /api/v1/certifications
  fastify.post('/certifications', async (request, reply) => {
    try {
      const certification = await createCertification(request.body)
      reply.code(201)
      return { data: certification }
    } catch (error) {
      reply.code(400)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })
}
```

**注意**: Fastify を使う場合、Vercel デプロイが複雑になります。

---

## 実装ロードマップ

### Phase 1: 共有 DB レイヤーの作成（2-3 日）

#### タスク
1. ✅ `lib/database/` ディレクトリ作成
2. ✅ `lib/database/client.ts` 作成（Supabase Client）
3. ✅ Certifications CRUD 関数を抽出
   - `lib/database/certifications.ts` 作成
   - `getCertifications`, `createCertification`, etc.
4. ✅ Question Sets CRUD 関数を抽出
   - `lib/database/question-sets.ts`
5. ✅ Questions CRUD 関数を抽出
   - `lib/database/questions.ts`
6. ✅ Study 関数を抽出
   - `lib/database/study.ts`

#### 成果物
- `lib/database/` パッケージ
- すべてのビジネスロジックが一箇所に

#### 検証
```bash
pnpm dev  # Web アプリが正常に動作
```

---

### Phase 2: Server Actions のリファクタリング（2-3 日）

#### タスク
1. ✅ `app/admin/certifications/actions.ts` を更新
   - `lib/database/certifications` からインポート
   - Server Actions は薄いラッパーに
2. ✅ `app/admin/question-sets/actions.ts` を更新
3. ✅ `app/admin/questions/actions.ts` を更新
4. ✅ `lib/actions/study.ts` を更新

#### 成果物
- リファクタリングされた Server Actions
- Web アプリが引き続き動作

---

### Phase 3: REST API の実装（3-4 日）

#### タスク
1. ✅ `app/api/v1/` ディレクトリ作成
2. ✅ 認証 API
   - `POST /api/v1/auth/login`
   - `GET /api/v1/auth/me`
3. ✅ Certifications CRUD API
   - `GET /api/v1/certifications`
   - `GET /api/v1/certifications/:id`
   - `POST /api/v1/certifications`
   - `PUT /api/v1/certifications/:id`
   - `DELETE /api/v1/certifications/:id`
4. ✅ Question Sets CRUD API
5. ✅ Questions CRUD API
6. ✅ Study API
   - `GET /api/v1/study/certifications`
   - `GET /api/v1/study/question-sets/:id`
   - `GET /api/v1/study/questions/:questionSetId`

#### 成果物
- 完全な REST API
- `lib/database` を呼び出すだけのシンプルな実装

#### 検証
```bash
# API テスト
curl http://localhost:3000/api/v1/certifications
```

---

### Phase 4: パフォーマンス最適化（1-2 日）

#### タスク
1. ✅ Database Indexing
   - Supabase ダッシュボードで index 作成
2. ✅ Query Optimization
   - N+1 クエリの修正
   - 必要なフィールドのみ select
3. ✅ Response Caching
   - `unstable_cache` の適用
4. ✅ Response Compression
   - next.config.ts で有効化（デフォルトで有効）

#### 成果物
- 最適化された API
- レスポンス時間 50-80% 削減

---

### Phase 5: デプロイと監視（1 日）

#### タスク
1. ✅ Vercel デプロイ
   - 環境変数の設定
   - CORS 設定
2. ✅ API ドキュメント作成（optional）
3. ✅ 監視設定
   - Vercel Analytics
   - エラーログ

#### 成果物
- Production デプロイ完了
- API ドキュメント

---

### Phase 6: Obsidian SDK（今後）

#### タスク
1. ✅ SDK パッケージ作成
2. ✅ API Client 実装
3. ✅ 型定義の export
4. ✅ npm package として公開（optional）

---

## 将来の拡張パス

### 現在 → 将来

```
【現在】
birgerik/
└── Next.js (Web + API)

↓ 必要に応じて

【将来 Option 1】
birgerik/
└── Next.js (Web + API)  ←そのまま
(パフォーマンス最適化で対応)

【将来 Option 2】
birgerik/           ←Next.js Web アプリ
birgerik-api/       ←Fastify API（超高速）
(トラフィックが増えたら)

【将来 Option 3】
Turborepo Monorepo
├── apps/web/
├── apps/core/
└── packages/
(大規模化、複数チーム開発)
```

---

## 次のステップ

### 承認事項
- [ ] **オプション A**（既存アプリに API 追加）で進めることに合意
- [ ] パフォーマンス最適化の優先順位
  1. Database Indexing（最も効果的）
  2. Query Optimization
  3. Response Caching
  4. （必要に応じて）Fastify 移行

### 技術的な質問
1. **API 認証方式**: JWT でよろしいでしょうか？
2. **キャッシュ戦略**: 60秒間キャッシュで OK ですか？
3. **API ドキュメント**: OpenAPI 仕様書を作成しますか？

### 実装開始の準備
承認いただければ、**Phase 1**（共有 DB レイヤーの作成）から即座に開始できます。

---

## まとめ

### 推奨アプローチ: 既存アプリに API 追加

**理由**:
1. ✅ **最もシンプル**：Turborepo 不要、学習コスト最小
2. ✅ **すぐに始められる**：今日から実装可能
3. ✅ **Web パフォーマンス維持**：Server Actions そのまま
4. ✅ **API パフォーマンス十分**：最適化で 50-80% 改善可能
5. ✅ **段階的移行**：必要に応じて Fastify や Turborepo に移行可能

**パフォーマンス最適化の優先順位**:
1. **Database Indexing**（最も効果的、50-80% 改善）
2. **Query Optimization**（N+1 削減）
3. **Response Caching**（2回目以降が爆速）
4. **Fastify**（必要になってから検討）

**Fastify について**:
- Fastify は Next.js より 2-3 倍速い
- ただし、全体のレスポンス時間への影響は **5-10ms 程度**
- ネットワークレイテンシー（50-200ms）の方が支配的
- **結論**: 通常のトラフィックでは Next.js API Routes で十分

---

**作成日**: 2025-12-23
**バージョン**: 3.0（シンプルアプローチ + パフォーマンス最適化）
**ステータス**: 提案中
