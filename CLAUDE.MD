# CLAUDE.MD - Birgerik リポジトリ構成ガイド

このドキュメントは、Birgerik（資格試験学習プラットフォーム）の構成情報をまとめたものです。

## プロジェクト概要

Birgerikは、資格試験の学習を支援するフルスタックWebアプリケーションです。
学習者向けの学習インターフェースと、管理者向けの問題管理システムを提供します。

**主要機能:**
- 学習モード（順次/ランダム）
- 試験モード（時間制限付き）
- 管理画面（資格/問題セット/問題のCRUD）

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15.5.6 (App Router) |
| 言語 | TypeScript 5 |
| UI | React 19.1.0, Tailwind CSS 4 |
| バックエンド | Supabase (PostgreSQL + Auth) |
| 状態管理 | Zustand 5.0.8 |
| フォーム | React Hook Form 7 + Zod 4 |
| リッチテキスト | Tiptap 3.8.0 |
| アイコン | Lucide React |

## ディレクトリ構造

```
birgerik/
├── src/
│   ├── app/                    # Next.js App Router ページ
│   │   ├── page.tsx           # ホームページ
│   │   ├── study/             # 学習モード
│   │   ├── exam/              # 試験モード
│   │   └── admin/             # 管理画面
│   ├── components/            # React コンポーネント
│   │   ├── shared/            # 共通コンポーネント
│   │   ├── study/             # 学習画面用
│   │   └── admin/             # 管理画面用
│   ├── lib/                   # ライブラリとユーティリティ
│   │   ├── actions/           # Server Actions
│   │   ├── supabase/          # Supabase クライアント
│   │   ├── types/             # 型定義
│   │   ├── validations/       # Zod スキーマ
│   │   ├── errors/            # エラーハンドリング
│   │   └── utils/             # ユーティリティ関数
│   ├── store/                 # Zustand ストア
│   └── middleware.ts          # 認証ミドルウェア
├── public/                    # 静的アセット
└── [設定ファイル]
```

## 重要な設定ファイル

| ファイル | 用途 |
|---------|-----|
| `package.json` | 依存関係とスクリプト |
| `tsconfig.json` | TypeScript設定（`@/*` → `./src/*`） |
| `next.config.ts` | Next.js設定 |
| `.env.local.example` | 環境変数テンプレート |

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Linter実行
npm run lint

# Supabase型定義生成
npm run types:generate
```

## ルーティング構造

### ユーザー向け
- `/` - ホーム
- `/study` - 資格一覧
- `/study/[certificationId]` - 問題セット選択
- `/study/[certificationId]/[questionSetId]/mode-select` - モード選択
- `/study/[certificationId]/[questionSetId]/practice` - 学習画面
- `/study/[certificationId]/[questionSetId]/result` - 結果表示
- `/exam` - 試験モード

### 管理者向け
- `/admin/login` - ログイン
- `/admin/certifications` - 資格管理
- `/admin/question-sets` - 問題セット管理
- `/admin/questions` - 問題管理

## データベース構造（Supabase）

主要テーブル:
- `certifications` - 資格情報
- `question_sets` - 問題セット
- `questions` - 問題
- `choices` - 選択肢
- `auth.users` - ユーザー（メタデータにroleフィールド）

## 認証・認可

- **システム:** Supabase Authentication
- **方式:** Email/Password
- **保護:** Middleware（`src/middleware.ts`）で `/admin/*` を保護
- **ロール:** メタデータの `role` フィールドで管理者判定

## 状態管理パターン

**Zustand + SessionStorage:**
- `src/store/study-store.ts` で学習セッション管理
- 問題の状態、回答履歴、進捗を保持
- ブラウザリフレッシュで復元可能

## 主要なアーキテクチャパターン

1. **Server Components** - デフォルトでサーバーレンダリング
2. **Server Actions** - `lib/actions/` でデータ取得・更新
3. **Client Components** - インタラクティブな部分のみ
4. **Zod Validation** - フォームとAPIのバリデーション統一

## 拡張開発のポイント

### 新機能追加時の手順

1. **新しいページ追加:**
   - `src/app/` に新しいルートを作成
   - 必要に応じて `layout.tsx` を追加

2. **新しいコンポーネント追加:**
   - 共通: `src/components/shared/`
   - 機能別: `src/components/[feature]/`

3. **データベース操作追加:**
   - Server Actionを `src/lib/actions/` に作成
   - Zod スキーマを `src/lib/validations/` に定義

4. **型定義更新:**
   - Supabase テーブル変更後、`npm run types:generate` を実行

5. **新しい状態管理追加:**
   - `src/store/` に新しいストアを作成（必要に応じて）

### コーディング規約

- **コンポーネント名:** PascalCase (`QuestionCard.tsx`)
- **ファイル名:** kebab-case (`question-card.tsx`)
- **関数名:** camelCase
- **エラーハンドリング:** `lib/errors/` のカスタムエラークラス使用
- **スタイリング:** Tailwind CSS クラス使用

### 注意点

- **Server/Client境界:** `'use client'` は必要最小限に
- **認証:** 保護ルート追加時は `middleware.ts` を更新
- **型安全性:** `any` 型の使用を避け、適切な型定義を行う
- **バリデーション:** 必ずZodスキーマでバリデーション

## 環境変数

`.env.local` に以下を設定:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## トラブルシューティング

### 型エラーが出る場合
```bash
npm run types:generate
```

### ビルドエラーの場合
```bash
rm -rf .next
npm run build
```

### 認証エラーの場合
- `.env.local` の設定確認
- Supabaseプロジェクトの認証設定確認
- ユーザーのメタデータに `role: 'admin'` が設定されているか確認

---

**最終更新:** 2025-12-21
**プロジェクトフェーズ:** Phase 0 - プロジェクト基盤構築完了
