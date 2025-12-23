# Birgerik Core 分離プロジェクト - 提案資料

## 📋 目次
1. [現状分析](#現状分析)
2. [目標アーキテクチャ](#目標アーキテクチャ)
3. [実装アプローチの比較](#実装アプローチの比較)
4. [推奨アプローチ: Turborepo](#推奨アプローチ-turborepo)
5. [技術スタック](#技術スタック)
6. [マイグレーションロードマップ](#マイグレーションロードマップ)
7. [リスクと対策](#リスクと対策)

---

## 現状分析

### 現在のアーキテクチャ
```
┌─────────────────────────────────────┐
│         Birgerik (Monolith)         │
│  ┌──────────────────────────────┐   │
│  │  Next.js 15 App Router       │   │
│  │  - Server Components         │   │
│  │  - Client Components         │   │
│  │  - Server Actions (CRUD)     │   │
│  └──────────────┬───────────────┘   │
│                 │                    │
│  ┌──────────────▼───────────────┐   │
│  │  Supabase Client             │   │
│  │  - Auth                      │   │
│  │  - PostgreSQL                │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 主な特徴
- **フレームワーク**: Next.js 15 (App Router)
- **API パターン**: Server Actions（REST API なし）
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth (Cookie-based)
- **ファイル数**: 67 TypeScript ファイル、28 React コンポーネント
- **デプロイ**: Vercel

### 課題
1. ❌ REST API が存在しない（Server Actions のみ）
2. ❌ Supabase クライアントに強く結合
3. ❌ UI と ビジネスロジックの分離が不完全
4. ❌ Obsidian プラグインや モバイルアプリから接続不可

---

## 目標アーキテクチャ

### 分離後のアーキテクチャ
```
┌──────────────────────────────────────────────────────────────┐
│                        Vercel Platform                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Turborepo Monorepo                      │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐     │    │
│  │  │  apps/birgerik-core (API Backend)          │     │    │
│  │  │  - REST/GraphQL API                        │     │    │
│  │  │  - Database CRUD Operations                │     │    │
│  │  │  - Authentication & Authorization          │     │    │
│  │  │  - Supabase Client                         │     │    │
│  │  └────────────────┬───────────────────────────┘     │    │
│  │                   │ API                             │    │
│  │  ┌────────────────▼───────────────────────────┐     │    │
│  │  │  apps/birgerik-web (Web UI)                │     │    │
│  │  │  - Next.js Frontend                        │     │    │
│  │  │  - React Components                        │     │    │
│  │  │  - Study/Practice UI                       │     │    │
│  │  └────────────────────────────────────────────┘     │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐     │    │
│  │  │  packages/shared                           │     │    │
│  │  │  - TypeScript Types                        │     │    │
│  │  │  - Validation Schemas (Zod)                │     │    │
│  │  │  - Shared Utilities                        │     │    │
│  │  └────────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

External Clients:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Obsidian Plugin │────▶│ birgerik-core   │◀────│   iOS/Android   │
│                 │     │    API          │     │      Apps       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### コンポーネント構成

#### 1. **apps/birgerik-core** (API Backend)
- **役割**: DB CRUD、認証、ビジネスロジック
- **技術**: Next.js API Routes または Fastify/Express
- **公開**: REST API (または GraphQL)
- **デプロイ**: Vercel Serverless Functions

#### 2. **apps/birgerik-web** (Web Frontend)
- **役割**: Web UI（管理画面 + 学習画面）
- **技術**: Next.js 15 (App Router)
- **データ取得**: birgerik-core API 経由
- **デプロイ**: Vercel (Static + SSR)

#### 3. **packages/shared** (共有ライブラリ)
- **TypeScript 型定義**
- **Zod バリデーションスキーマ**
- **共通ユーティリティ関数**

#### 4. **Future Clients**
- **Obsidian Plugin**: TypeScript/JavaScript
- **Mobile Apps**: React Native / Swift / Kotlin

---

## 実装アプローチの比較

### オプション 1: Turborepo (推奨 ✅)

#### メリット
- ✅ **Vercel 公式**: Vercel による開発・最適化
- ✅ **高速ビルド**: Remote Caching、Incremental Builds
- ✅ **依存関係管理**: Workspace 間のコード共有が簡単
- ✅ **既存プロジェクト移行**: 段階的な移行が可能
- ✅ **スケーラビリティ**: 将来的に packages を追加しやすい
- ✅ **TypeScript サポート**: 型の共有が容易
- ✅ **単一デプロイ**: Vercel に monorepo として一括デプロイ

#### デメリット
- ⚠️ 学習コスト: Turborepo の設定とワークフロー
- ⚠️ 初期セットアップ: ディレクトリ構造の再編成が必要

#### 適用性
- **最適**: 中〜大規模プロジェクト、複数アプリケーション
- **Vercel デプロイ**: ネイティブサポート
- **チーム開発**: 複数人での開発に最適

---

### オプション 2: pnpm Workspaces

#### メリット
- ✅ 軽量でシンプル
- ✅ 高速な依存関係インストール
- ✅ Monorepo の基本機能は揃っている

#### デメリット
- ❌ ビルドキャッシュなし（手動で設定必要）
- ❌ タスクオーケストレーションが弱い
- ❌ Vercel との統合は手動

#### 適用性
- **最適**: 小規模プロジェクト、シンプルな構成

---

### オプション 3: Nx

#### メリット
- ✅ 強力なビルドキャッシュ
- ✅ 高度な依存関係グラフ
- ✅ プラグインエコシステム

#### デメリット
- ❌ 複雑で高機能すぎる
- ❌ 学習コストが高い
- ❌ Vercel デプロイの公式サポートが弱い

#### 適用性
- **最適**: エンタープライズレベルの大規模プロジェクト

---

### オプション 4: 別リポジトリ (Polyrepo)

#### メリット
- ✅ 完全な独立性
- ✅ 個別のデプロイ・バージョン管理

#### デメリット
- ❌ コード共有が困難（npm package 化が必要）
- ❌ 型の同期が難しい
- ❌ リファクタリングが複雑
- ❌ バージョン管理の手間

#### 適用性
- **最適**: 完全に独立した製品を作る場合

---

## 推奨アプローチ: Turborepo

### 理由
1. **Vercel ネイティブサポート**: デプロイが簡単
2. **段階的移行**: 既存コードを少しずつ移行可能
3. **型安全性**: packages/shared で型を共有
4. **拡張性**: 将来的に Obsidian/Mobile 用 SDK も追加可能
5. **開発体験**: 高速ビルド、Hot Reload

### プロジェクト構成

```
birgerik/
├── apps/
│   ├── core/                         # API Backend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── api/
│   │   │   │       ├── v1/
│   │   │   │       │   ├── certifications/
│   │   │   │       │   │   └── route.ts
│   │   │   │       │   ├── question-sets/
│   │   │   │       │   │   └── route.ts
│   │   │   │       │   ├── questions/
│   │   │   │       │   │   └── route.ts
│   │   │   │       │   ├── study/
│   │   │   │       │   │   └── route.ts
│   │   │   │       │   └── auth/
│   │   │   │       │       ├── login/route.ts
│   │   │   │       │       └── logout/route.ts
│   │   │   ├── lib/
│   │   │   │   ├── db/               # Database layer
│   │   │   │   │   ├── client.ts
│   │   │   │   │   └── queries/
│   │   │   │   ├── auth/             # Auth middleware
│   │   │   │   │   ├── jwt.ts
│   │   │   │   │   └── middleware.ts
│   │   │   │   └── utils/
│   │   │   └── middleware.ts
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── web/                          # Web Frontend
│       ├── src/
│       │   ├── app/                  # Next.js pages (既存)
│       │   ├── components/           # React components (既存)
│       │   ├── lib/
│       │   │   ├── api/              # API client (新規)
│       │   │   │   └── client.ts     # fetch wrapper
│       │   │   └── store/            # Zustand (既存)
│       │   └── middleware.ts         # Client-side auth
│       ├── package.json
│       └── next.config.ts
│
├── packages/
│   ├── shared/                       # 共有ライブラリ
│   │   ├── src/
│   │   │   ├── types/                # Database types
│   │   │   │   ├── index.ts
│   │   │   │   └── database.ts
│   │   │   ├── validations/          # Zod schemas
│   │   │   │   ├── certification.ts
│   │   │   │   ├── question-set.ts
│   │   │   │   └── question.ts
│   │   │   ├── errors/               # Error classes
│   │   │   │   └── index.ts
│   │   │   └── utils/                # Shared utilities
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── eslint-config/                # 共有 ESLint 設定
│   │   └── package.json
│   │
│   └── typescript-config/            # 共有 tsconfig
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
│
├── turbo.json                        # Turborepo 設定
├── package.json                      # Root package.json
└── pnpm-workspace.yaml               # Workspace 設定
```

---

## 技術スタック

### apps/birgerik-core (API)

#### オプション A: Next.js API Routes (推奨 ✅)
```typescript
// apps/core/src/app/api/v1/certifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/client'
import { z } from 'zod'
import { certificationSchema } from '@repo/shared/validations'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certifications')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = certificationSchema.parse(body)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('certifications')
    .insert(validated)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

**メリット**:
- Next.js と統一された開発体験
- Vercel Serverless Functions に最適化
- TypeScript ネイティブ
- 既存のコードをほぼそのまま移行可能

**デメリット**:
- API 専用フレームワークではない
- ミドルウェアが複雑になる可能性

---

#### オプション B: Fastify
```typescript
// apps/core/src/index.ts
import Fastify from 'fastify'
import { certificationRoutes } from './routes/certifications'

const fastify = Fastify({ logger: true })

fastify.register(certificationRoutes, { prefix: '/api/v1' })

fastify.listen({ port: 3001 }, (err) => {
  if (err) throw err
})
```

**メリット**:
- 高速なパフォーマンス
- 本格的な API フレームワーク
- プラグインエコシステム

**デメリット**:
- Vercel デプロイが複雑
- Next.js との開発体験が異なる

---

### apps/birgerik-web (Frontend)

#### API クライアント
```typescript
// apps/web/src/lib/api/client.ts
import { Certification } from '@repo/shared/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  private getToken(): string {
    // Cookie or localStorage から JWT 取得
    return localStorage.getItem('auth_token') || ''
  }

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    const { data } = await this.fetch<{ data: Certification[] }>('/certifications')
    return data
  }

  async createCertification(certification: Partial<Certification>): Promise<Certification> {
    const { data } = await this.fetch<{ data: Certification }>('/certifications', {
      method: 'POST',
      body: JSON.stringify(certification),
    })
    return data
  }

  // ... 他の CRUD メソッド
}

export const apiClient = new ApiClient()
```

#### Server Component での使用
```typescript
// apps/web/src/app/admin/certifications/page.tsx
import { apiClient } from '@/lib/api/client'
import { CertificationList } from '@/components/admin/certifications/certification-list'

export default async function CertificationsPage() {
  const certifications = await apiClient.getCertifications()

  return <CertificationList initialCertifications={certifications} />
}
```

---

### packages/shared

#### 型定義
```typescript
// packages/shared/src/types/database.ts
export interface Certification {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface QuestionSet {
  id: string
  name: string
  description: string | null
  certification_id: string
  created_at: string
  updated_at: string
}

// ... 他の型
```

#### バリデーション
```typescript
// packages/shared/src/validations/certification.ts
import { z } from 'zod'

export const certificationSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().nullable(),
})

export const certificationFormSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim(),
})

export type CertificationInput = z.infer<typeof certificationSchema>
export type CertificationFormInput = z.infer<typeof certificationFormSchema>
```

---

## マイグレーションロードマップ

### Phase 1: プロジェクト構造のセットアップ (1-2 日)

#### タスク
1. ✅ Turborepo のインストールと設定
2. ✅ ディレクトリ構造の作成
3. ✅ `packages/shared` の作成
4. ✅ 既存コードを `apps/web` に移動
5. ✅ 型定義とバリデーションを `packages/shared` に移動

#### 成果物
- Turborepo monorepo 構造
- 既存の Web アプリが動作する状態

---

### Phase 2: birgerik-core API の構築 (3-5 日)

#### タスク
1. ✅ `apps/core` プロジェクトの作成
2. ✅ 認証 API の実装
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/logout`
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
- API ドキュメント（OpenAPI/Swagger）
- 単体テスト

---

### Phase 3: birgerik-web の API クライアント化 (3-5 日)

#### タスク
1. ✅ API クライアントの実装
2. ✅ Server Actions を API 呼び出しに置き換え
   - Admin pages
   - Study pages
3. ✅ 認証フローの更新
4. ✅ エラーハンドリングの統一
5. ✅ 環境変数の設定

#### 成果物
- API 経由でデータ取得する Web アプリ
- Server Actions の完全削除

---

### Phase 4: テストとデプロイ (2-3 日)

#### タスク
1. ✅ E2E テスト
2. ✅ パフォーマンステスト
3. ✅ Vercel へのデプロイ設定
   - `apps/core` → `/api/*` へルーティング
   - `apps/web` → `/` へルーティング
4. ✅ 環境変数の設定（production）
5. ✅ CI/CD パイプライン

#### 成果物
- Production デプロイ
- 監視・ログ設定

---

### Phase 5: Obsidian プラグイン対応 (今後)

#### タスク
1. ✅ Obsidian プラグイン用 SDK の作成 (`packages/obsidian-sdk`)
2. ✅ CORS 設定の調整
3. ✅ API ドキュメントの公開
4. ✅ プラグインのプロトタイプ開発

---

## リスクと対策

### リスク 1: パフォーマンス劣化
**内容**: Server Actions → REST API で Network Latency が増加

**対策**:
- API を同じ Vercel プロジェクトにデプロイ（内部通信は高速）
- Response Caching (SWR, React Query)
- データの事前フェッチ (Server Components)

---

### リスク 2: 認証の複雑化
**内容**: Supabase Auth の Cookie-based から JWT への移行

**対策**:
- 段階的移行: 最初は Supabase Auth をそのまま使用
- API で Supabase の Session Token を検証
- 将来的に独自 JWT に移行（optional）

---

### リスク 3: 型の同期
**内容**: API と Frontend で型定義がずれる

**対策**:
- `packages/shared` で型を一元管理
- OpenAPI Schema から型を自動生成
- Turborepo の依存関係で強制

---

### リスク 4: デプロイの複雑化
**内容**: Monorepo のデプロイ設定

**対策**:
- Vercel の Turborepo サポートを活用
- `vercel.json` で適切にルーティング設定
- CI/CD パイプラインで自動テスト

---

## 次のステップ

### 1. 承認事項
- [ ] Turborepo アプローチで進めることに合意
- [ ] API 技術スタック（Next.js API Routes vs Fastify）の選択
- [ ] マイグレーションスケジュールの確認

### 2. 技術的準備
- [ ] Vercel プロジェクト設定の確認
- [ ] Supabase プロジェクトのアクセス権限
- [ ] 開発環境の準備

### 3. 実装開始
- [ ] Phase 1 の実行（プロジェクト構造のセットアップ）
- [ ] 定期的なレビューと調整

---

## 参考資料

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vercel Monorepo Support](https://vercel.com/docs/monorepos/turborepo)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase API Documentation](https://supabase.com/docs/reference/javascript/introduction)

---

**作成日**: 2025-12-23
**バージョン**: 1.0
**ステータス**: 提案中
