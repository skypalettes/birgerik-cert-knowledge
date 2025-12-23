# CLAUDE.MD - Birgerik 開発ガイド

## プロジェクト概要

Birgerikは資格試験学習プラットフォームです。**ハイブリッドアーキテクチャ**を採用し、Webアプリ（Server Actions）と外部クライアント（REST API）の両方をサポートします。

**アーキテクチャ目標:**
- Webアプリ: Next.js Server Actionsで高速なUIを提供
- 外部クライアント: REST APIでObsidianプラグインなどのサードパーティ統合を実現

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15.5.6 (App Router) |
| 言語 | TypeScript 5 |
| データベース | Supabase PostgreSQL |
| 認証 | Supabase Auth (Web) + JWT (API) |
| キャッシング | Next.js unstable_cache (60秒) |
| UI | React 19, Tailwind CSS 4 |
| 状態管理 | Zustand 5.0.8 |

## ディレクトリ構造（重要）

```
src/
├── app/
│   ├── api/v1/                    # REST API エンドポイント
│   │   ├── auth/                  # 認証 (login, me)
│   │   ├── certifications/        # 資格CRUD
│   │   ├── question-sets/         # 問題セットCRUD
│   │   ├── questions/             # 問題CRUD
│   │   └── study/                 # 学習用エンドポイント
│   ├── study/                     # 学習モードUI
│   ├── exam/                      # 試験モードUI
│   └── admin/                     # 管理画面UI
├── lib/
│   ├── api/                       # REST API共通機能
│   │   ├── middleware.ts          # JWT認証ミドルウェア
│   │   └── response.ts            # レスポンスヘルパー
│   ├── auth/
│   │   └── jwt.ts                 # JWT生成・検証
│   ├── database/                  # データベース層（共通）
│   │   ├── certifications.ts
│   │   ├── question-sets.ts
│   │   ├── questions.ts
│   │   └── study.ts               # 学習用最適化クエリ
│   ├── actions/                   # Server Actions（Web専用）
│   └── supabase/
│       ├── server.ts              # Server用クライアント
│       └── client.ts              # Client用クライアント
└── store/                         # Zustand状態管理
```

## 開発環境セットアップ

```bash
# 依存関係インストール
pnpm install

# 環境変数設定（.env.local）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret-32-chars-minimum
ALLOWED_ORIGINS=http://localhost:3000

# 開発サーバー起動
pnpm dev

# TypeScript型チェック
pnpm tsc --noEmit

# Lint
pnpm lint

# ビルド
pnpm build
```

## REST API 認証

### ログイン
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "...", "email": "..." }
  }
}
```

### 認証ヘッダー
```bash
Authorization: Bearer <token>
```

### JWT設定
- アルゴリズム: HS256
- 有効期限: 7日間
- 検証: `withAuth`ミドルウェアで自動処理

## キャッシング戦略

すべてのGETエンドポイントは60秒間キャッシュされます：

```typescript
const getCachedData = unstable_cache(
  async () => getData(),
  ['cache-key'],
  {
    revalidate: 60,
    tags: ['certifications', 'questions']
  }
)
```

キャッシュ無効化は`revalidateTag()`で実行（POST/PUT/DELETEで自動）。

## データベース最適化

### パフォーマンスインデックス

8つのインデックスを追加済み（50-90%高速化）:

```bash
# インデックス適用
psql $DATABASE_URL < docs/performance/add-indexes.sql
```

主要インデックス:
- `idx_question_sets_certification_id`
- `idx_questions_question_set_id`
- `idx_choices_question_id`
- `idx_choices_is_correct`

詳細: `docs/performance/database-optimization.md`

### N+1クエリ最適化

`getCertificationsWithQuestionSets()`はN+M個のクエリを2個に削減済み。

## 主要APIエンドポイント

### 認証
- `POST /api/v1/auth/login` - ログイン（JWT取得）
- `GET /api/v1/auth/me` - ユーザー情報取得

### 資格管理
- `GET /api/v1/certifications` - 資格一覧
- `POST /api/v1/certifications` - 資格作成
- `GET /api/v1/certifications/:id` - 資格詳細
- `PUT /api/v1/certifications/:id` - 資格更新
- `DELETE /api/v1/certifications/:id` - 資格削除

### 学習用（最適化済み）
- `GET /api/v1/study/certifications` - 資格+問題セット一覧
- `GET /api/v1/study/question-sets/:id` - 問題セット詳細+問題数
- `GET /api/v1/study/questions/:questionSetId` - 問題+選択肢

全エンドポイント: `docs/api/README.md`

## コーディング規約

### API Routes
```typescript
import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { successResponse, errorResponse } from '@/lib/api/response'

// GETハンドラー（requestパラメータ不要な場合）
export const GET = withAuth(async () => {
  const data = await getCachedData()
  return successResponse(data)
})

// POSTハンドラー（requestパラメータ必要）
export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json()
  const result = await createData(body)
  return successResponse(result, 201)
})
```

### Database層
```typescript
// 戻り値は常にDatabaseResult型
export async function createItem(data: unknown): Promise<DatabaseResult<{ id: string }>> {
  try {
    // Zodでバリデーション
    const result = schema.safeParse(data)
    if (!result.success) {
      return { success: false, error: '入力内容に誤りがあります' }
    }

    // データベース操作
    const supabase = await createClient()
    const { data: item, error } = await supabase.from('table').insert(...)

    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }

    return { success: true, data: { id: item.id } }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: 'エラーメッセージ' }
  }
}
```

## デプロイ（Vercel）

```bash
# 1. 環境変数設定（Vercelダッシュボード）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
JWT_SECRET=...
ALLOWED_ORIGINS=https://yourdomain.com

# 2. デプロイ
vercel --prod

# 3. データベースインデックス適用（初回のみ）
psql $DATABASE_URL < docs/performance/add-indexes.sql
```

詳細: `docs/deployment/vercel-deployment.md`

## トラブルシューティング

### ビルドエラー: "Cannot find name 'NextRequest'"
→ `import { NextRequest } from 'next/server'` を追加

### TypeScript型エラー
```bash
pnpm tsc --noEmit  # エラー確認
```

### フォント読み込みエラー（ローカル開発）
→ ネットワーク問題。本番環境では正常動作。

### JWT認証エラー
1. `JWT_SECRET`が32文字以上か確認
2. トークンの有効期限（7日）を確認
3. `Authorization: Bearer <token>` ヘッダー形式を確認

### キャッシュが更新されない
→ `revalidateTag()`が正しく呼ばれているか確認。POST/PUT/DELETEアクション後に自動実行。

## 重要ドキュメント

- `docs/api/README.md` - REST API完全仕様
- `docs/performance/database-optimization.md` - パフォーマンス最適化
- `docs/deployment/vercel-deployment.md` - デプロイ手順
- `docs/PROJECT_SUMMARY.md` - プロジェクト全体概要

---

**最終更新:** 2025-12-23
**プロジェクトフェーズ:** Phase 5完了 - birgerik-core分離・REST API実装完了
