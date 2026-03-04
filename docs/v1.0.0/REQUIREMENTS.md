# Birgerik v1.0.0 要件定義書

## 1. プロジェクト概要

### 1.1 目的

現行の Birgerik（モノリシック Next.js アプリケーション）を **3 つの独立したシステム** に分割し、責務の明確化・拡張性の向上・UI/UX の刷新を行う。

### 1.2 対象システム

| システム | 概要 | プラットフォーム |
|----------|------|-----------------|
| **Birgerik Core** | マザーシステム（API + 管理 UI + 共通パッケージ） | Vercel (Next.js) |
| **Birgerik Web** | エンドユーザ向け学習・試験アプリケーション | Vercel (Next.js) |
| **Birgerik Obs** | Obsidian プラグイン | Obsidian (TypeScript) |

### 1.3 アーキテクチャ図

詳細なアーキテクチャ図は [ARCHITECTURE.md](./ARCHITECTURE.md) を参照。

### 1.4 現行構成からの変更点

```
【現行構成（v0.x）】
┌─────────────────────────────────────────────┐
│           birgerik (monolith)                │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Admin UI │ │ Study UI │ │   REST API   │ │
│  └─────────┘ └──────────┘ └──────────────┘ │
│              ↓  共通 DB 層                   │
│         Supabase PostgreSQL                  │
└─────────────────────────────────────────────┘
              ＋
  packages/types (共通型定義)

【v1.0.0 構成】
┌────────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   Birgerik Core    │  │  Birgerik Web   │  │   Birgerik Obs   │
│ (API + Admin UI)   │  │ (学習 + 試験)    │  │ (Obsidian Plugin)│
│ Vercel / Next.js   │  │ Vercel / Next.js│  │ Obsidian / TS    │
└────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘
         │                       │                     │
         │  @birgerik/types      │  @birgerik/types    │  @birgerik/types
         │  (GitHub Packages)    │  (GitHub Packages)  │  (GitHub Packages)
         │                       │                     │
         ↓                       ↓                     ↓
         ├───── REST API ────────┤─────────────────────┤
         ↓
┌─────────────────────────────────┐
│     Supabase PostgreSQL         │
│  （Birgerik Core のみ直接接続）  │
└─────────────────────────────────┘
```

---

## 2. システム別要件

---

### 2.1 Birgerik Core

#### 2.1.1 役割

Birgerik エコシステム全体のマザーシステム。データベースとの唯一の直接インターフェースであり、管理 UI と REST API を提供する。

#### 2.1.2 機能要件

##### A. REST API

現行 API をベースに以下を提供する。

**認証**
| エンドポイント | メソッド | 認証 | 説明 |
|---|---|---|---|
| `/api/v1/auth/login` | POST | 不要 | ログイン（JWT 取得） |
| `/api/v1/auth/me` | GET | 必要 | ユーザ情報取得 |
| `/api/v1/auth/refresh` | POST | 必要 | JWT リフレッシュ |

**資格（certifications）管理**
| エンドポイント | メソッド | 認証 | 説明 |
|---|---|---|---|
| `/api/v1/certifications` | GET | 必要 | 一覧取得 |
| `/api/v1/certifications` | POST | 必要 | 新規作成 |
| `/api/v1/certifications/:id` | GET | 必要 | 詳細取得 |
| `/api/v1/certifications/:id` | PUT | 必要 | 更新 |
| `/api/v1/certifications/:id` | DELETE | 必要 | 削除 |

**問題集（question_sets）管理**
| エンドポイント | メソッド | 認証 | 説明 |
|---|---|---|---|
| `/api/v1/question-sets` | GET | 必要 | 一覧取得 |
| `/api/v1/question-sets` | POST | 必要 | 新規作成 |
| `/api/v1/question-sets/:id` | GET | 必要 | 詳細取得 |
| `/api/v1/question-sets/:id` | PUT | 必要 | 更新 |
| `/api/v1/question-sets/:id` | DELETE | 必要 | 削除 |

**問題（questions）管理**
| エンドポイント | メソッド | 認証 | 説明 |
|---|---|---|---|
| `/api/v1/questions` | GET | 必要 | 一覧取得（`?question_set_id=` フィルタ） |
| `/api/v1/questions` | POST | 必要 | 新規作成（選択肢含む） |
| `/api/v1/questions/:id` | GET | 必要 | 詳細取得 |
| `/api/v1/questions/:id` | PUT | 必要 | 更新 |
| `/api/v1/questions/:id` | DELETE | 必要 | 削除 |

**試験（exams）管理** ※ 新規追加
| エンドポイント | メソッド | 認証 | 説明 |
|---|---|---|---|
| `/api/v1/exams` | GET | 必要 | 一覧取得 |
| `/api/v1/exams` | POST | 必要 | 新規作成 |
| `/api/v1/exams/:id` | GET | 必要 | 詳細取得 |
| `/api/v1/exams/:id` | PUT | 必要 | 更新 |
| `/api/v1/exams/:id` | DELETE | 必要 | 削除 |

**学習用（study）エンドポイント**（読み取り専用・認証不要）
| エンドポイント | メソッド | 認証 | 説明 |
|---|---|---|---|
| `/api/v1/study/certifications` | GET | 不要 | 資格 + 有効な問題集一覧 |
| `/api/v1/study/question-sets/:id` | GET | 不要 | 問題集詳細 + 問題数 |
| `/api/v1/study/questions/:questionSetId` | GET | 不要 | 問題 + 選択肢一覧 |
| `/api/v1/study/exams/:questionSetId` | GET | 不要 | 試験設定取得 |

##### B. 管理 UI

現行の `/admin` 配下の機能をベースに以下を提供する。

| 管理対象 | 操作 | 備考 |
|----------|------|------|
| ユーザ | 一覧・作成・編集・削除 | 現行はスクリプトのみ → UI 化 |
| 資格 | 一覧・作成・編集・削除 | 現行踏襲 |
| 問題集 | 一覧・作成・編集・削除 | **有効化チェック（公開/非公開）を追加** |
| 問題 | 一覧・作成・編集・削除 | 現行踏襲（Markdown 対応） |
| 試験 | 一覧・作成・編集・削除 | **新規追加** |

##### C. 共通パッケージ（`@birgerik/types`）

GitHub Packages で公開し、Birgerik Web・Birgerik Obs から利用可能にする。

**提供内容:**
- API リクエスト・レスポンス型定義
- データモデル型定義（Certification, QuestionSet, Question, Choice, Exam）
- 学習セッション関連型定義（UserAnswer, StudySession, StudyResult）
- 試験セッション関連型定義（ExamSession, ExamResult）※ 新規追加
- API エラー型定義
- バリデーションスキーマ（Zod）の共有（任意）

##### D. データベーススキーマ変更

**`question_sets` テーブル — カラム追加**

| カラム名 | 型 | デフォルト | 説明 |
|----------|-----|-----------|------|
| `is_active` | boolean | `true` | 公開/非公開フラグ。`false` の場合、学習用エンドポイントから除外される |

**`exams` テーブル — 新規作成**

| カラム名 | 型 | 制約 | 説明 |
|----------|-----|------|------|
| `id` | UUID | PK, デフォルト `gen_random_uuid()` | 一意識別子 |
| `question_set_id` | UUID | FK → `question_sets.id`, UNIQUE, NOT NULL | 対象の問題集（1 問題集 : 1 試験） |
| `question_count` | integer | NOT NULL | 出題数。問題集の総問題数以下であること |
| `time_limit_minutes` | integer | NOT NULL | 試験時間（分） |
| `passing_score` | integer | NOT NULL | 合格ライン（パーセント, 0–100） |
| `created_at` | timestamp with time zone | デフォルト `now()` | 作成日時 |
| `updated_at` | timestamp with time zone | デフォルト `now()` | 更新日時 |

**インデックス追加**
- `idx_exams_question_set_id` on `exams(question_set_id)`
- `idx_question_sets_is_active` on `question_sets(is_active)`

#### 2.1.3 非機能要件

| 項目 | 要件 |
|------|------|
| ホスティング | Vercel |
| フレームワーク | Next.js (App Router) |
| 認証 | Supabase Auth（Web UI） + JWT（API） |
| キャッシュ | GET エンドポイント 60 秒、タグベース無効化 |
| CORS | 管理 API: 許可オリジン制限、学習 API: `*` |
| データベース | Supabase PostgreSQL（本システムのみ直接接続） |

---

### 2.2 Birgerik Web

#### 2.2.1 役割

エンドユーザが問題集に取り組むためのフロントエンドアプリケーション。Birgerik Core の REST API を経由してデータを取得する。**データベースへの直接接続は行わない。**

#### 2.2.2 機能要件

##### A. 学習モード（現行踏襲 + デザイン刷新）

問題集を 1 問 1 答形式で解き、解答・解説を確認しながら学習できる。

| 機能 | 説明 | 現行 |
|------|------|------|
| 資格選択 | 資格一覧から学習対象を選択 | ✅ 踏襲 |
| 問題集選択 | 資格に紐づく問題集（有効なもののみ）を選択 | ✅ 踏襲（`is_active` フィルタ追加） |
| 出題モード選択 | 順番通り / ランダム を選択 | ✅ 踏襲 |
| 問題表示 | Markdown 形式の問題文を表示 | ✅ 踏襲 |
| 選択肢選択 | 単一選択 / 複数選択に対応 | ✅ 踏襲 |
| 即時フィードバック | 回答後に正誤を即座に表示 | ✅ 踏襲 |
| 解説表示 | 解説文（Markdown）を表示 | ✅ 踏襲 |
| 進捗表示 | プログレスバーで現在位置を表示 | ✅ 踏襲 |
| 結果画面 | 正答率・所要時間・間違えた問題一覧を表示 | ✅ 踏襲 |
| 間違えた問題の復習 | 不正解の問題のみを再度解き直し | ✅ 踏襲 |

##### B. 試験モード（新規実装）

実際の試験と同様の条件で問題集に挑戦できる。

| 機能 | 説明 |
|------|------|
| 試験選択 | 試験が設定された問題集を一覧表示し、選択する |
| 試験条件表示 | 開始前に出題数・制限時間・合格ラインを確認できる |
| 出題 | 問題集から指定された出題数をランダムに抽出して出題する |
| タイマー | 制限時間のカウントダウンを表示する。時間経過で自動終了する |
| 回答 | 1 問ずつ解答する。解答中はフィードバック・解説を表示しない |
| 問題ナビゲーション | 問題一覧から任意の問題にジャンプできる。未回答の問題を確認できる |
| 途中終了 | 試験を途中で終了できる（確認ダイアログあり） |
| 自動採点 | 全問解答後または時間切れ時に自動的に採点する |
| 結果画面 | 合否判定・得点・合格ライン・所要時間を表示する |
| 詳細レビュー | 各問題の正誤・選択した回答・正解・解説を確認できる |

##### C. データ取得

Birgerik Core の学習用 API（認証不要）を利用する。

| データ | エンドポイント |
|--------|--------------|
| 資格 + 問題集一覧 | `GET /api/v1/study/certifications` |
| 問題集詳細 | `GET /api/v1/study/question-sets/:id` |
| 問題 + 選択肢 | `GET /api/v1/study/questions/:questionSetId` |
| 試験設定 | `GET /api/v1/study/exams/:questionSetId` |

#### 2.2.3 非機能要件

| 項目 | 要件 |
|------|------|
| ホスティング | Vercel |
| フレームワーク | Next.js (App Router) |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS |
| アニメーション | Framer Motion |
| デザイン | ミニマルかつインタラクティブ（現行デザインから刷新） |
| レスポンシブ | モバイルファースト |
| 認証 | 不要（学習用 API は認証不要） |

---

### 2.3 Birgerik Obs

#### 2.3.1 役割

Obsidian 上で動作するプラグイン。Birgerik Web と同様の学習・試験体験を Obsidian 内で提供する。

#### 2.3.2 機能要件

Birgerik Web と同等の機能を Obsidian プラグインとして提供する。

| 機能 | 説明 |
|------|------|
| 資格選択 | 資格一覧を表示し選択 |
| 問題集選択 | 問題集一覧を表示し選択 |
| 学習モード | Birgerik Web と同等（1 問 1 答 + 即時フィードバック + 解説） |
| 試験モード | Birgerik Web と同等（タイマー + 自動採点 + 合否判定） |
| 結果表示 | 正答率・合否・間違えた問題の確認 |
| 設定 | API URL の設定（本番 / 開発切り替え） |

##### データ取得

Birgerik Core の学習用 API（認証不要）を使用。Birgerik Web と同一のエンドポイントを利用する。

#### 2.3.3 非機能要件

| 項目 | 要件 |
|------|------|
| プラットフォーム | Obsidian（Desktop / Mobile） |
| UI フレームワーク | Preact（軽量 React 互換） |
| 状態管理 | Zustand |
| ビルド | esbuild |
| スタイリング | Obsidian CSS 変数（テーマ連動） |
| デザイン | Obsidian ネイティブに溶け込むミニマルデザイン |
| 共通型定義 | `@birgerik/types`（GitHub Packages 経由） |

---

## 3. データモデル

### 3.1 ER 図

```
certifications
├── id (PK)
├── name
├── description
├── created_at
└── updated_at
     │
     │ 1:N
     ↓
question_sets
├── id (PK)
├── certification_id (FK → certifications.id)
├── name
├── description
├── is_active          ← 【新規】公開/非公開フラグ
├── created_at
└── updated_at
     │                    │
     │ 1:N                │ 1:1
     ↓                    ↓
questions              exams ← 【新規テーブル】
├── id (PK)            ├── id (PK)
├── question_set_id    ├── question_set_id (FK, UNIQUE)
│   (FK)               ├── question_count
├── question_text      ├── time_limit_minutes
├── explanation         ├── passing_score
├── is_multiple_choice ├── created_at
├── order_index        └── updated_at
├── created_at
└── updated_at
     │
     │ 1:N
     ↓
choices
├── id (PK)
├── question_id (FK → questions.id)
├── choice_text
├── is_correct
├── order_index
└── created_at
```

### 3.2 テーブル定義詳細

#### certifications（変更なし）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default `gen_random_uuid()` | 一意識別子 |
| name | text | NOT NULL | 資格名 |
| description | text | nullable | 説明 |
| created_at | timestamptz | default `now()` | 作成日時 |
| updated_at | timestamptz | default `now()` | 更新日時 |

#### question_sets（`is_active` 追加）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default `gen_random_uuid()` | 一意識別子 |
| certification_id | uuid | FK → certifications.id, NOT NULL | 所属資格 |
| name | text | NOT NULL | 問題集名 |
| description | text | nullable | 説明 |
| **is_active** | **boolean** | **NOT NULL, default `true`** | **公開/非公開** |
| created_at | timestamptz | default `now()` | 作成日時 |
| updated_at | timestamptz | default `now()` | 更新日時 |

#### questions（変更なし）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default `gen_random_uuid()` | 一意識別子 |
| question_set_id | uuid | FK → question_sets.id, NOT NULL | 所属問題集 |
| question_text | text | NOT NULL | 問題文（Markdown） |
| explanation | text | nullable | 解説（Markdown） |
| is_multiple_choice | boolean | default `false` | 複数選択フラグ |
| order_index | integer | nullable | 表示順 |
| created_at | timestamptz | default `now()` | 作成日時 |
| updated_at | timestamptz | default `now()` | 更新日時 |

#### choices（変更なし）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default `gen_random_uuid()` | 一意識別子 |
| question_id | uuid | FK → questions.id, NOT NULL | 所属問題 |
| choice_text | text | NOT NULL | 選択肢テキスト（Markdown） |
| is_correct | boolean | default `false` | 正解フラグ |
| order_index | integer | nullable | 表示順 |
| created_at | timestamptz | default `now()` | 作成日時 |

#### exams（新規）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default `gen_random_uuid()` | 一意識別子 |
| question_set_id | uuid | FK → question_sets.id, UNIQUE, NOT NULL | 対象問題集 |
| question_count | integer | NOT NULL, CHECK > 0 | 出題数 |
| time_limit_minutes | integer | NOT NULL, CHECK > 0 | 制限時間（分） |
| passing_score | integer | NOT NULL, CHECK BETWEEN 0 AND 100 | 合格ライン（%） |
| created_at | timestamptz | default `now()` | 作成日時 |
| updated_at | timestamptz | default `now()` | 更新日時 |

---

## 4. 共通パッケージ（`@birgerik/types`）

### 4.1 配布方法

- **レジストリ:** GitHub Packages (npm)
- **スコープ:** `@birgerik/types`（現行と同一）
- **公開元:** Birgerik Core リポジトリ内 `packages/types/`
- **利用者:** Birgerik Web, Birgerik Obs

### 4.2 型定義一覧

#### 既存型（現行踏襲）

```typescript
// データモデル
CertificationWithQuestionSets
QuestionSetSummary
QuestionSetDetail
QuestionWithChoices
Choice

// API レスポンス
GetCertificationsResponse
GetQuestionSetResponse
GetQuestionsResponse
ErrorResponse
SuccessResponse<T>

// 学習セッション
UserAnswer
StudySession
StudyResult
```

#### 新規追加型

```typescript
// 試験設定
interface ExamConfig {
  id: string
  question_set_id: string
  question_count: number
  time_limit_minutes: number
  passing_score: number
}

// 試験セッション
interface ExamSession {
  examConfig: ExamConfig
  questionSetName: string
  certificationName: string
  questions: QuestionWithChoices[]      // ランダム抽出済み
  userAnswers: Map<string, UserAnswer>
  startedAt: Date
  completedAt?: Date
  timeRemaining: number                 // 残り時間（秒）
}

// 試験結果
interface ExamResult {
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  accuracy: number                      // 0–100
  passingScore: number                  // 0–100
  passed: boolean
  duration: number                      // ミリ秒
  incorrectQuestions: QuestionWithChoices[]
}

// API レスポンス
interface GetExamConfigResponse {
  exam: ExamConfig
}

// 問題集サマリー（is_active 追加）
interface QuestionSetSummary {
  id: string
  name: string
  description: string | null
  question_count: number
  is_active: boolean                    // 追加
  has_exam: boolean                     // 追加：試験設定の有無
}
```

---

## 5. デザイン要件

### 5.1 方針

- **ミニマル:** 余計な装飾を排除し、コンテンツに集中できるデザイン
- **インタラクティブ:** 操作に対するフィードバックを重視（アニメーション、トランジション）
- **モバイルファースト:** スマートフォンでも快適に学習できるレスポンシブ設計

### 5.2 Birgerik Web デザイン指針

| 項目 | 指針 |
|------|------|
| カラー | モノトーンベース + アクセントカラー |
| タイポグラフィ | 読みやすさ最優先、適切な行間と文字サイズ |
| レイアウト | シングルカラム中心、画面遷移を最小化 |
| アニメーション | Framer Motion による控えめなトランジション |
| フィードバック | 正解/不正解の明確な視覚的フィードバック |
| プログレス | 試験中のタイマーと進捗の常時表示 |

### 5.3 Birgerik Obs デザイン指針

| 項目 | 指針 |
|------|------|
| テーマ | Obsidian CSS 変数に準拠（ダーク/ライト自動対応） |
| レイアウト | Obsidian のタブ/サイドバー内に収まるコンパクト設計 |
| インタラクション | Obsidian ネイティブのボタン・フォーム要素を活用 |

---

## 6. リポジトリ構成

### 6.1 リポジトリ一覧

| リポジトリ | 説明 | 状態 |
|-----------|------|------|
| `birgerik` | 現行システム（v1.0.0 安定稼働まで維持） | 既存・維持 |
| `birgerik-core` | Birgerik Core | **新規作成** |
| `birgerik-web` | Birgerik Web | **新規作成** |
| `birgerik-obs` | Birgerik Obs | **新規作成** |

### 6.2 Birgerik Core ディレクトリ構成（想定）

```
birgerik-core/
├── packages/
│   └── types/                    # @birgerik/types（GitHub Packages で公開）
│       ├── src/
│       │   ├── api.ts
│       │   ├── study.ts
│       │   ├── exam.ts           # 新規
│       │   └── index.ts
│       └── package.json
├── src/
│   ├── app/
│   │   ├── api/v1/               # REST API
│   │   │   ├── auth/
│   │   │   ├── certifications/
│   │   │   ├── question-sets/
│   │   │   ├── questions/
│   │   │   ├── exams/            # 新規
│   │   │   └── study/
│   │   ├── admin/                # 管理 UI
│   │   │   ├── certifications/
│   │   │   ├── question-sets/
│   │   │   ├── questions/
│   │   │   ├── exams/            # 新規
│   │   │   └── users/            # 新規（スクリプト → UI 化）
│   │   └── layout.tsx
│   ├── components/
│   │   ├── admin/
│   │   └── shared/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── database/
│   │   │   ├── certifications.ts
│   │   │   ├── question-sets.ts
│   │   │   ├── questions.ts
│   │   │   ├── exams.ts          # 新規
│   │   │   └── study.ts
│   │   ├── actions/
│   │   ├── validations/
│   │   └── supabase/
│   └── middleware.ts
└── docs/
```

### 6.3 Birgerik Web ディレクトリ構成（想定）

```
birgerik-web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # ホーム
│   │   ├── study/                # 学習モード
│   │   │   ├── page.tsx          # 資格選択
│   │   │   ├── [certId]/
│   │   │   │   ├── page.tsx      # 問題集選択
│   │   │   │   └── [setId]/
│   │   │   │       ├── mode-select/
│   │   │   │       ├── practice/
│   │   │   │       └── result/
│   │   ├── exam/                 # 試験モード
│   │   │   ├── page.tsx          # 試験選択
│   │   │   └── [setId]/
│   │   │       ├── confirm/      # 試験条件確認
│   │   │       ├── session/      # 試験実行
│   │   │       └── result/       # 試験結果
│   │   └── layout.tsx
│   ├── components/
│   │   ├── study/
│   │   ├── exam/
│   │   └── shared/
│   ├── lib/
│   │   └── api/                  # Core API クライアント
│   │       └── client.ts
│   └── store/
│       ├── study-store.ts
│       └── exam-store.ts
└── package.json                  # @birgerik/types を依存に含む
```

### 6.4 Birgerik Obs ディレクトリ構成（想定）

```
birgerik-obs/
├── src/
│   ├── main.ts                   # プラグインエントリポイント
│   ├── api/
│   │   └── client.ts             # Core API クライアント
│   ├── views/
│   │   └── study-view.tsx        # メインビュー
│   ├── components/
│   │   ├── certification-list.tsx
│   │   ├── question-set-list.tsx
│   │   ├── question-card.tsx
│   │   ├── exam-session.tsx
│   │   └── result-summary.tsx
│   ├── store/
│   │   ├── study-store.ts
│   │   └── exam-store.ts
│   └── settings.ts
├── styles.css
├── manifest.json
└── package.json                  # @birgerik/types を依存に含む
```

---

## 7. 現行システムからの移行方針

### 7.1 基本方針

**現行リポジトリ `birgerik` は v1.0.0 の全システムが安定稼働するまで維持する。**
Birgerik Core を含む全システムを新規リポジトリで構築し、段階的に移行する。

```
【移行タイムライン】

Phase A: 並行開発
  birgerik（現行）     ──── 稼働中 ──── 稼働中 ──── 稼働中 ────┐
  birgerik-core（新規） ──── 開発 ────── 開発 ────── テスト ────┤
  birgerik-web（新規）  ──── 開発 ────── 開発 ────── テスト ────┤
  birgerik-obs（新規）  ──── 開発 ────── 開発 ────── テスト ────┤
                                                              ↓
Phase B: 切り替え
  birgerik（現行）     ──── 停止 ────────────────── アーカイブ
  birgerik-core        ──── 本番稼働 ───────────────→
  birgerik-web         ──── 本番稼働 ───────────────→
  birgerik-obs         ──── 本番稼働 ───────────────→
```

### 7.2 Birgerik Core（新規リポジトリ `birgerik-core`）

現行リポジトリのコードを参照しつつ、新規リポジトリとして構築する。

| 対象 | 方針 |
|------|------|
| REST API | 現行の API 設計・DB 層を移植 + `exams` エンドポイント追加 |
| 管理 UI | 現行の管理 UI を移植 + 試験管理・ユーザ管理 UI 追加 + デザイン刷新 |
| 学習 UI | **含めない**（Birgerik Web の責務） |
| `packages/types` | 試験関連型を追加し GitHub Packages で公開 |
| データベース | 同一の Supabase インスタンスを使用（スキーマ拡張） |

### 7.3 Birgerik Web（新規リポジトリ `birgerik-web`）

| 対象 | 方針 |
|------|------|
| 学習モード | 現行 `/study` の機能仕様を踏襲 + デザイン刷新 |
| 試験モード | 新規実装 |
| API 通信 | Birgerik Core の REST API を利用 |
| 状態管理 | 現行 Zustand ストアの設計を参考に新規実装 |
| 共通型 | `@birgerik/types` を GitHub Packages から取得 |

### 7.4 Birgerik Obs（新規リポジトリ `birgerik-obs`）

| 対象 | 方針 |
|------|------|
| 学習モード | Birgerik Web と同等の機能を Preact で実装 |
| 試験モード | Birgerik Web と同等の機能を Preact で実装 |
| API 通信 | fetch による REST API クライアント |
| 共通型 | `@birgerik/types` を GitHub Packages から取得 |

### 7.5 現行リポジトリ `birgerik` の扱い

| フェーズ | 状態 | 説明 |
|----------|------|------|
| 並行開発期間 | **稼働** | 新システム開発中も現行システムでサービス提供を継続 |
| v1.0.0 リリース後 | **停止** | DNS / Vercel のデプロイ先を新システムへ切り替え |
| 安定稼働確認後 | **アーカイブ** | リポジトリを読み取り専用にし、参照用として保存 |

---

## 8. 制約事項・前提条件

| # | 内容 |
|---|------|
| 1 | データベースへの直接接続は Birgerik Core のみが行う |
| 2 | Birgerik Web・Birgerik Obs は Birgerik Core の REST API のみを利用する |
| 3 | 学習用エンドポイントは認証不要とする（公開データのため） |
| 4 | 管理用エンドポイントは JWT 認証を必須とする |
| 5 | `@birgerik/types` は GitHub Packages で配布する |
| 6 | 1 つの問題集に対して試験設定は最大 1 つとする（1:1 関係） |
| 7 | 試験の出題数は問題集の総問題数以下でなければならない |
| 8 | `is_active` が `false` の問題集は学習用エンドポイントから返却しない |
| 9 | 既存データの `is_active` は `true`（デフォルト）として移行する |

---

## 9. 用語定義

| 用語 | 説明 |
|------|------|
| 資格（Certification） | 学習対象となる資格・カテゴリ（例: AWS SAA, 応用情報技術者） |
| 問題集（Question Set） | 資格に紐づく問題のセット（例: 第 1 回模擬試験） |
| 問題（Question） | 個々の設問。Markdown 形式の問題文と解説を持つ |
| 選択肢（Choice） | 問題に対する回答候補。正解フラグを持つ |
| 試験（Exam） | 問題集に対する試験設定。出題数・制限時間・合格ラインを定義 |
| 学習モード | 1 問 1 答で即時フィードバック・解説を確認しながら進める形式 |
| 試験モード | 制限時間内に出題数分の問題を解き、合否判定を行う形式 |
| 有効化（is_active） | 問題集の公開/非公開状態。非公開の場合、エンドユーザからは不可視 |

---

*作成日: 2026-02-18*
*対象バージョン: Birgerik v1.0.0*
