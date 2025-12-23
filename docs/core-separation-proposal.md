# Birgerik Core 分離プロジェクト - 提案資料 v2.0（ハイブリッドアプローチ）

## 📋 目次
1. [パフォーマンス分析](#パフォーマンス分析)
2. [アーキテクチャ選択肢の比較](#アーキテクチャ選択肢の比較)
3. [推奨: ハイブリッドアーキテクチャ](#推奨-ハイブリッドアーキテクチャ)
4. [技術スタック詳細](#技術スタック詳細)
5. [マイグレーションロードマップ](#マイグレーションロードマップ)
6. [パフォーマンス比較](#パフォーマンス比較)

---

## パフォーマンス分析

### Server Actions vs REST API のパフォーマンス

#### Server Actions（現状）⚡
```typescript
// Server Component から直接呼び出し
const certifications = await getCertifications() // 0ms ネットワークレイテンシー
```

**特徴**:
- ✅ **サーバー内で直接実行**（ネットワークレイテンシー 0ms）
- ✅ **Streaming レスポンス**対応
- ✅ **Suspense** との統合
- ✅ **自動的な revalidation**
- ✅ **最高のパフォーマンス**

---

#### REST API 経由 🐌
```typescript
// HTTP リクエストが必要
const response = await fetch('/api/v1/certifications')
const certifications = await response.json() // +50-200ms
```

**追加されるオーバーヘッド**:
- ❌ HTTP リクエスト/レスポンス（**+50-200ms**）
- ❌ JSON シリアライゼーション/デシリアライゼーション（**+10-30ms**）
- ❌ 認証ヘッダーの検証（**+5-10ms**）
- ❌ ミドルウェアチェーン（**+5-10ms**）

**合計**: **70-250ms の追加レイテンシー**

---

### 結論

**birgerik-web で Server Actions を削除すると、確実にパフォーマンスが低下します。**

---

## アーキテクチャ選択肢の比較

### オプション 1: ハイブリッドアーキテクチャ（推奨 ✅）

#### 構成
```
┌────────────────────────────────────────────────────────┐
│                   Vercel Platform                      │
│  ┌──────────────────────────────────────────────┐     │
│  │            Turborepo Monorepo                │     │
│  │                                              │     │
│  │  ┌────────────────────────────────────┐     │     │
│  │  │ packages/database-layer            │     │     │
│  │  │ - Supabase Client                  │     │     │
│  │  │ - DB Query Functions               │     │     │
│  │  │ - Business Logic                   │     │     │
│  │  └───────┬──────────────────┬─────────┘     │     │
│  │          │                  │               │     │
│  │  ┌───────▼────────┐  ┌──────▼──────────┐   │     │
│  │  │ apps/web       │  │ apps/core       │   │     │
│  │  │ (Next.js)      │  │ (API Server)    │   │     │
│  │  │                │  │                 │   │     │
│  │  │ Server Actions │  │ REST API        │   │     │
│  │  │ ↓              │  │ ↓               │   │     │
│  │  │ @repo/db       │  │ @repo/db        │   │     │
│  │  └────────────────┘  └─────────────────┘   │     │
│  │                             │               │     │
│  │  ┌────────────────────────┐ │               │     │
│  │  │ packages/shared        │ │               │     │
│  │  │ - Types                │←┘               │     │
│  │  │ - Validation           │                 │     │
│  │  └────────────────────────┘                 │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘

External Clients:
┌──────────────────┐
│ Obsidian Plugin  │──────┐
└──────────────────┘      │
┌──────────────────┐      ▼
│ Mobile Apps      │────► apps/core REST API
└──────────────────┘
```

#### 特徴
- **apps/web**: Server Actions を**維持**（高速）
- **apps/core**: REST API として公開（外部クライアント用）
- **packages/database-layer**: DB 操作ロジックを共有
- **packages/shared**: 型定義、バリデーションを共有

#### メリット
- ✅ **Web アプリは最高速度を維持**（Server Actions）
- ✅ **外部クライアントは REST API でアクセス可能**
- ✅ **ビジネスロジックの重複なし**（共有パッケージ）
- ✅ **段階的移行が可能**
- ✅ **型安全性の保証**

#### デメリット
- ⚠️ 2 つのエントリーポイント（Web + API）を維持
- ⚠️ ビジネスロジックを共有パッケージ化する必要がある

---

### オプション 2: 完全 API 化

#### 構成
- birgerik-web も birgerik-core の API を使用
- すべてのクライアントが同じ API を使用

#### メリット
- ✅ 統一されたアクセスパターン
- ✅ API のテストがしやすい

#### デメリット
- ❌ **Web アプリのパフォーマンスが 70-250ms 低下**
- ❌ Server Actions の利点をすべて失う
- ❌ ネットワークエラーの処理が複雑化

---

### オプション 3: tRPC

#### 構成
- birgerik-core を tRPC サーバーとして実装
- birgerik-web と Obsidian は tRPC クライアントを使用

#### メリット
- ✅ **型安全な RPC 通信**
- ✅ Server Actions に近い開発体験
- ✅ 自動的な型推論

#### デメリット
- ⚠️ Obsidian プラグインでの tRPC 使用は追加設定が必要
- ⚠️ REST API ではないため、他のプラットフォームからの利用が難しい
- ⚠️ 学習コスト

---

### オプション 4: GraphQL

#### 構成
- birgerik-core を GraphQL サーバーとして実装
- すべてのクライアントが GraphQL クエリを使用

#### メリット
- ✅ 柔軟なデータ取得
- ✅ オーバーフェッチングの削減

#### デメリット
- ❌ 複雑なセットアップ
- ❌ パフォーマンスオーバーヘッド
- ❌ 学習コスト高

---

### 比較表

| アーキテクチャ | Web パフォーマンス | 外部クライアント対応 | 開発体験 | 複雑度 | 推奨度 |
|--------------|-----------------|-------------------|---------|-------|-------|
| **ハイブリッド** | ⭐⭐⭐⭐⭐ 最速 | ⭐⭐⭐⭐⭐ REST API | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ **推奨** |
| 完全 API 化 | ⭐⭐ 遅い | ⭐⭐⭐⭐⭐ REST API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ |
| tRPC | ⭐⭐⭐⭐ 速い | ⭐⭐⭐ tRPC のみ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ |
| GraphQL | ⭐⭐⭐ 普通 | ⭐⭐⭐⭐ GraphQL | ⭐⭐⭐ | ⭐⭐ | ❌ |

---

## 推奨: ハイブリッドアーキテクチャ

### アーキテクチャ詳細

#### 1. プロジェクト構造

```
birgerik/
├── apps/
│   ├── web/                              # Web アプリ（既存）
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── certifications/
│   │   │   │   │   │   ├── page.tsx      # Server Component
│   │   │   │   │   │   └── actions.ts    # Server Actions（維持）
│   │   │   │   │   ├── question-sets/
│   │   │   │   │   └── questions/
│   │   │   │   ├── study/
│   │   │   │   └── page.tsx
│   │   │   ├── components/               # React Components
│   │   │   └── middleware.ts             # Auth
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── core/                             # API サーバー（新規）
│       ├── src/
│       │   ├── app/
│       │   │   └── api/
│       │   │       └── v1/
│       │   │           ├── certifications/
│       │   │           │   └── route.ts   # REST API
│       │   │           ├── question-sets/
│       │   │           │   └── route.ts
│       │   │           ├── questions/
│       │   │           │   └── route.ts
│       │   │           ├── study/
│       │   │           │   └── route.ts
│       │   │           └── auth/
│       │   │               ├── login/route.ts
│       │   │               └── me/route.ts
│       │   ├── lib/
│       │   │   ├── auth/                 # JWT 認証
│       │   │   │   ├── jwt.ts
│       │   │   │   └── middleware.ts
│       │   │   └── utils/
│       │   └── middleware.ts
│       ├── package.json
│       └── next.config.ts
│
├── packages/
│   ├── database-layer/                   # DB 操作の共有（新規）
│   │   ├── src/
│   │   │   ├── client.ts                 # Supabase Client
│   │   │   ├── certifications/
│   │   │   │   ├── index.ts
│   │   │   │   ├── get.ts                # getCertifications()
│   │   │   │   ├── create.ts             # createCertification()
│   │   │   │   ├── update.ts             # updateCertification()
│   │   │   │   └── delete.ts             # deleteCertification()
│   │   │   ├── question-sets/
│   │   │   │   └── ...
│   │   │   ├── questions/
│   │   │   │   └── ...
│   │   │   └── study/
│   │   │       └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                           # 型、バリデーション
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   └── database.ts
│   │   │   ├── validations/
│   │   │   │   ├── certification.ts
│   │   │   │   ├── question-set.ts
│   │   │   │   └── question.ts
│   │   │   └── errors/
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── obsidian-sdk/                     # Obsidian 用 SDK（今後）
│       ├── src/
│       │   └── client.ts                 # API Client
│       ├── package.json
│       └── tsconfig.json
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

#### 2. コード例

##### packages/database-layer/src/certifications/get.ts
```typescript
import { createClient } from '../client'
import type { Certification } from '@repo/shared/types'

export async function getCertifications(): Promise<Certification[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch certifications: ${error.message}`)
  }

  return data
}

export async function getCertification(id: string): Promise<Certification | null> {
  const supabase = createClient()

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
```

##### packages/database-layer/src/certifications/create.ts
```typescript
import { createClient } from '../client'
import { certificationSchema } from '@repo/shared/validations'
import type { Certification } from '@repo/shared/types'

export async function createCertification(
  input: unknown
): Promise<Certification> {
  // バリデーション
  const validated = certificationSchema.parse(input)

  const supabase = createClient()

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
```

---

##### apps/web/src/app/admin/certifications/actions.ts（既存を維持）
```typescript
'use server'

import { getCertifications, createCertification } from '@repo/database-layer/certifications'
import { revalidatePath } from 'next/cache'

// Server Action - そのまま使用
export async function getCertificationsAction() {
  return await getCertifications()
}

export async function createCertificationAction(formData: FormData) {
  const input = {
    name: formData.get('name'),
    description: formData.get('description'),
  }

  const certification = await createCertification(input)

  revalidatePath('/admin/certifications')

  return { success: true, data: certification }
}
```

**ポイント**:
- Server Actions は維持
- `@repo/database-layer` から DB 操作をインポート
- ビジネスロジックは共有

---

##### apps/core/src/app/api/v1/certifications/route.ts（新規）
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCertifications, createCertification } from '@repo/database-layer/certifications'

// GET /api/v1/certifications
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

// POST /api/v1/certifications
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
- **同じ** `@repo/database-layer` を使用
- ビジネスロジックの重複なし

---

##### packages/obsidian-sdk/src/client.ts（今後）
```typescript
import type { Certification } from '@repo/shared/types'

export class BirgerikClient {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  async getCertifications(): Promise<Certification[]> {
    const response = await fetch(`${this.apiUrl}/api/v1/certifications`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const { data } = await response.json()
    return data
  }

  // ... 他の CRUD メソッド
}
```

**ポイント**:
- Obsidian プラグインは REST API を使用
- 型定義は `@repo/shared` から共有

---

#### 3. データフロー

##### Web アプリ（高速）
```
User Action
    ↓
Server Component/Server Action
    ↓
@repo/database-layer
    ↓
Supabase
    ↓
Response (0ms network latency)
```

##### Obsidian プラグイン
```
User Action
    ↓
Obsidian Plugin
    ↓
HTTP Request
    ↓
apps/core REST API
    ↓
@repo/database-layer
    ↓
Supabase
    ↓
HTTP Response
```

---

## 技術スタック詳細

### Turborepo 設定

#### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

#### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### Root package.json
```json
{
  "name": "birgerik-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

---

### packages/database-layer/package.json
```json
{
  "name": "@repo/database-layer",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@repo/shared": "workspace:*",
    "@supabase/supabase-js": "^2.45.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

---

### apps/web/package.json（既存に追加）
```json
{
  "name": "birgerik-web",
  "dependencies": {
    "@repo/database-layer": "workspace:*",
    "@repo/shared": "workspace:*",
    // ... 既存の依存関係
  }
}
```

---

### apps/core/package.json
```json
{
  "name": "birgerik-core",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001"
  },
  "dependencies": {
    "@repo/database-layer": "workspace:*",
    "@repo/shared": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.1.0"
  }
}
```

---

## マイグレーションロードマップ

### Phase 1: プロジェクト構造のセットアップ（2-3 日）

#### タスク
1. ✅ Turborepo のインストール
   ```bash
   npm install -g turbo
   pnpm init
   ```

2. ✅ ディレクトリ構造の作成
   ```bash
   mkdir -p apps/web apps/core
   mkdir -p packages/database-layer packages/shared
   ```

3. ✅ 既存コードを `apps/web` に移動
   ```bash
   # 既存の src/, public/, package.json などを apps/web/ へ
   ```

4. ✅ `packages/shared` の作成
   - `src/lib/types/` を移動
   - `src/lib/validations/` を移動
   - `src/lib/errors/` を移動

5. ✅ Workspace 設定
   - `pnpm-workspace.yaml` 作成
   - `turbo.json` 作成
   - Root `package.json` 作成

#### 成果物
- Turborepo monorepo 構造
- 既存の Web アプリが `apps/web` で動作

#### 検証
```bash
cd apps/web
pnpm dev  # http://localhost:3000 で動作確認
```

---

### Phase 2: packages/database-layer の抽出（3-4 日）

#### タスク
1. ✅ `packages/database-layer` プロジェクト作成
   ```bash
   cd packages/database-layer
   pnpm init
   ```

2. ✅ Supabase Client の移動
   - `src/lib/supabase/server.ts` → `packages/database-layer/src/client.ts`

3. ✅ Server Actions からビジネスロジックを抽出

   **例: Certifications**
   - `apps/web/src/app/admin/certifications/actions.ts` から抽出
   - → `packages/database-layer/src/certifications/get.ts`
   - → `packages/database-layer/src/certifications/create.ts`
   - → `packages/database-layer/src/certifications/update.ts`
   - → `packages/database-layer/src/certifications/delete.ts`

4. ✅ 同様に Question Sets、Questions、Study を抽出

5. ✅ Server Actions を更新
   - `@repo/database-layer` からインポート
   - Server Actions は薄いラッパーとして維持

#### 成果物
- `@repo/database-layer` パッケージ
- リファクタリングされた Server Actions
- Web アプリが引き続き動作

#### 検証
```bash
pnpm dev  # Web アプリが正常に動作
```

---

### Phase 3: apps/core API サーバーの構築（4-5 日）

#### タスク
1. ✅ `apps/core` プロジェクト作成
   ```bash
   cd apps/core
   pnpm init
   pnpm add next react react-dom
   ```

2. ✅ Next.js API Routes のセットアップ
   - `src/app/api/v1/` ディレクトリ作成

3. ✅ 認証 API の実装
   - `POST /api/v1/auth/login`
   - `GET /api/v1/auth/me`
   - JWT トークン発行

4. ✅ CRUD API の実装
   - Certifications: GET, GET/:id, POST, PUT/:id, DELETE/:id
   - Question Sets: 同上
   - Questions: 同上
   - Study: GET certifications, GET question-sets/:id, GET questions/:questionSetId

5. ✅ エラーハンドリング
   - 統一されたエラーレスポンス
   - バリデーションエラー
   - 認証エラー

6. ✅ CORS 設定
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     const response = NextResponse.next()
     response.headers.set('Access-Control-Allow-Origin', '*')
     response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
     return response
   }
   ```

#### 成果物
- 完全な REST API
- OpenAPI 仕様書（optional）

#### 検証
```bash
cd apps/core
pnpm dev  # http://localhost:3001

# API テスト
curl http://localhost:3001/api/v1/certifications
```

---

### Phase 4: Vercel デプロイ設定（1-2 日）

#### タスク
1. ✅ Vercel プロジェクト設定
   - Turborepo を検出
   - Build settings:
     - Framework: Next.js
     - Root Directory: `apps/web` (Web) / `apps/core` (API)

2. ✅ ルーティング設定

   **オプション A: 単一プロジェクト（推奨）**
   ```json
   // vercel.json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "http://birgerik-core.vercel.app/api/:path*"
       }
     ]
   }
   ```

   **オプション B: 別々のプロジェクト**
   - `birgerik-web.vercel.app` (Web UI)
   - `birgerik-core.vercel.app` (API)

3. ✅ 環境変数の設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (API only)
   - `JWT_SECRET` (API only)

#### 成果物
- Production デプロイ
- 動作確認

---

### Phase 5: Obsidian プラグイン SDK（今後）

#### タスク
1. ✅ `packages/obsidian-sdk` 作成
2. ✅ API Client の実装
3. ✅ 型定義の export
4. ✅ npm package として公開（optional）

#### 成果物
- `@repo/obsidian-sdk` または npm package
- ドキュメント

---

## パフォーマンス比較

### レイテンシー測定（予測）

| 操作 | Server Actions | REST API | 差分 |
|-----|---------------|----------|------|
| Certifications 一覧取得 | 50ms | 120ms | **+70ms** |
| Certification 作成 | 80ms | 180ms | **+100ms** |
| Questions 一覧取得（100件） | 150ms | 300ms | **+150ms** |
| Question 作成（+ Choices） | 200ms | 350ms | **+150ms** |
| Study Session 開始 | 100ms | 200ms | **+100ms** |

**結論**: ハイブリッドアプローチなら、Web アプリは Server Actions を使い続けるため、**パフォーマンス劣化ゼロ**。

---

## リスクと対策

### リスク 1: ビジネスロジックの重複
**内容**: Server Actions と API で同じロジックを書いてしまう

**対策**:
- ✅ `@repo/database-layer` で一元管理
- ✅ 両方から同じ関数をインポート
- ✅ 単一責任の原則

---

### リスク 2: 型の同期
**内容**: packages/shared の型定義がずれる

**対策**:
- ✅ Turborepo の依存関係管理
- ✅ TypeScript の strict mode
- ✅ CI/CD で型チェック

---

### リスク 3: 認証の複雑化
**内容**: Server Actions（Cookie） vs API（JWT）

**対策**:
- Phase 1-2: Server Actions は Supabase Auth をそのまま使用
- Phase 3: API は JWT を発行
- 将来的に統一（optional）

---

### リスク 4: デプロイの複雑化
**内容**: 2 つのアプリをデプロイ

**対策**:
- ✅ Vercel の Turborepo サポート
- ✅ 単一リポジトリで管理
- ✅ 同時デプロイ

---

## 次のステップ

### 承認事項
- [ ] **ハイブリッドアプローチ**で進めることに合意
- [ ] **Turborepo** を使用することに合意
- [ ] マイグレーションスケジュール（約 2-3 週間）の確認

### 技術的な質問
1. **API の認証方式**: JWT でよろしいでしょうか？（Supabase Auth との併用）
2. **Vercel デプロイ**: 単一プロジェクトか、別々のプロジェクトか？
3. **API ドキュメント**: OpenAPI 仕様書を作成しますか？

### 実装開始の準備
承認いただければ、すぐに **Phase 1**（Turborepo セットアップ）から開始できます。

---

## まとめ

### なぜハイブリッドアプローチが最適か

1. ✅ **Web アプリのパフォーマンスを維持**（Server Actions）
2. ✅ **外部クライアント対応**（REST API）
3. ✅ **ビジネスロジックの重複なし**（共有パッケージ）
4. ✅ **段階的移行が可能**
5. ✅ **型安全性の保証**
6. ✅ **将来的な拡張性**（Mobile、Obsidian）

### ご質問への回答

**Q1: Server Actions 削除によるパフォーマンス低下は防げるか？**
→ **A: はい。Server Actions を維持することで防げます。**

**Q2: モノレポにせず、Web は Server Action、それ以外は API という構造は可能か？**
→ **A: はい。それがまさにこのハイブリッドアプローチです。**

**Q3: Obsidian プラグインで Server Action は使えるか？**
→ **A: いいえ。REST API が必要です。**

---

**作成日**: 2025-12-23
**バージョン**: 2.0（ハイブリッドアプローチ）
**ステータス**: 提案中
