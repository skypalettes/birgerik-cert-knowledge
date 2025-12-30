# Obsidian Plugin版 Birgerik 開発提案（修正版）

## 1. リポジトリ構成の提案

### 推奨: **別リポジトリ（独立型）**

#### 理由:
1. **デプロイサイクルの独立性**
   - Obsidianプラグインのリリースサイクルはコミュニティストアの審査に依存
   - Webアプリとは異なる開発・リリースペースが必要

2. **依存関係の軽量化**
   - Obsidianプラグインは軽量であるべき（Next.js等の重い依存は不要）
   - プラグイン特有の依存関係（Obsidian API）のみに集中

3. **開発者体験**
   - プラグイン開発者とWebアプリ開発者で関心事が分離
   - Obsidianプラグインテンプレートをベースに素早く開始可能

4. **ビルドプロセスの単純化**
   - Obsidianプラグインは単一のmain.jsにバンドル
   - モノレポの複雑さを避けられる

### リポジトリ構成案:

```
birgerik-obsidian/              # 新規リポジトリ
├── src/
│   ├── main.ts                # プラグインエントリーポイント
│   ├── api/                   # REST API クライアント
│   │   └── client.ts          # fetch wrapper
│   ├── views/                 # Obsidian View コンポーネント
│   │   └── study-view.tsx     # メイン学習画面
│   ├── components/            # UIコンポーネント（Preact）
│   │   ├── certification-list.tsx
│   │   ├── question-set-list.tsx
│   │   ├── question-card.tsx
│   │   └── result-summary.tsx
│   ├── store/                 # 状態管理
│   │   └── study-store.ts     # Zustand
│   ├── types/                 # 型定義（birgerikから共有）
│   │   └── api.ts
│   └── settings.ts            # プラグイン設定
├── styles.css
├── manifest.json
└── package.json
```

## 2. 型定義の共通化戦略

### アプローチ: **型定義ファイルのコピー + REST API仕様書**

#### 共通化する型:
```typescript
// birgerik-obsidian/src/types/api.ts
// birgerik の REST API レスポンス型をコピー

export interface Certification {
  id: string
  name: string
  description: string | null
}

export interface QuestionSet {
  id: string
  name: string
  description: string | null
  question_count: number
}

export interface Question {
  id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  choices: Choice[]
}

export interface Choice {
  id: string
  choice_text: string
  is_correct: boolean
  order_index: number
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

#### メリット:
- REST APIが型の契約を保証
- プラグイン側は軽量に保てる
- 必要な型のみを選択的にコピー

#### デメリット対策:
- 型の同期: REST API仕様書（`docs/api/README.md`）を信頼できる情報源に
- 定期的な型の確認（APIレスポンスのテスト）

## 3. 技術スタック

| カテゴリ | 技術 | 理由 |
|---------|------|------|
| ベース | Obsidian Plugin Template | 公式テンプレートで迅速に開始 |
| 言語 | TypeScript | 型安全性、birgerikとの互換性 |
| UIフレームワーク | **Preact** | 軽量（3KB）、Reactライクな書き方 |
| 状態管理 | Zustand（軽量版） | birgerikと同じパターン、3KB |
| HTTP クライアント | fetch（ネイティブ） | 追加依存なし、認証不要 |
| ビルドツール | esbuild | 高速、Obsidianプラグイン標準 |
| スタイリング | CSS変数 + Obsidian CSS | Obsidianテーマと統合 |

### UIフレームワーク選定: **Preact推奨**

**理由:**
- birgerikと同じReactパターンで記述可能
- バンドルサイズ: わずか3KB
- React互換（ほぼ同じコードが動く）
- Obsidian公式プラグインでも採用例多数

## 4. アーキテクチャ設計

### 全体構成図:

```
┌─────────────────────────────────────────────┐
│           Obsidian Desktop/Mobile           │
│  ┌───────────────────────────────────────┐  │
│  │      birgerik-obsidian Plugin         │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Study View (Main Tab)          │  │  │
│  │  │  - 資格選択                       │  │  │
│  │  │  - 問題セット選択                 │  │  │
│  │  │  - 学習画面（問題・選択肢）        │  │  │
│  │  │  - 結果画面                       │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │              ↓                          │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   API Client (REST)              │  │  │
│  │  │  - 資格・問題セット取得           │  │  │
│  │  │  - 問題・選択肢取得               │  │  │
│  │  │  - オフラインキャッシュ           │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │              ↓ HTTPS (認証不要)        │  │
│  └──────────────┼──────────────────────────┘  │
└─────────────────┼──────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│    Birgerik REST API (Vercel) 🌐 OPEN      │
│         https://birgerik.vercel.app         │
│  GET /api/v1/study/certifications           │
│  GET /api/v1/study/question-sets/:id        │
│  GET /api/v1/study/questions/:questionSetId │
│                                             │
│  🔓 認証不要（CORS: *）                      │
│  ⚡ レート制限: 100req/10秒/IP              │
│  💾 キャッシュ: 60秒                         │
└─────────────────────────────────────────────┘
```

### データフロー（シンプル化）:

1. **資格一覧**: 起動時に `GET /api/v1/study/certifications` で取得
2. **問題セット**: 資格選択後に `GET /api/v1/study/question-sets/:id` で取得
3. **問題**: 問題セット選択後に `GET /api/v1/study/questions/:questionSetId` で取得
4. **ローカル状態**: Zustandで学習セッション管理
5. **オフラインキャッシュ**: IndexedDBで問題をローカル保存（Phase 2）

**認証は一切不要！** 🎉

## 5. 機能範囲（MVP）

### Phase 1: 基本機能
✅ 必要
- [x] 資格一覧表示
- [x] 問題セット一覧表示
- [x] 問題表示
- [x] 選択肢選択
- [x] 正誤判定
- [x] 解説表示
- [x] 結果画面（正答率、間違えた問題）
- [x] API URL設定（本番/開発切り替え）

❌ 不要
- 認証・ログイン機能
- ユーザーアカウント管理
- 資格/問題セット/問題のCRUD
- 管理画面

### Phase 2: UX改善
- [ ] オフライン対応（問題のローカルキャッシュ）
- [ ] ダークモード対応（Obsidianテーマ連動）
- [ ] キーボードショートカット
- [ ] 学習履歴の永続化（Obsidianローカルストレージ）

### Phase 3: 高度な機能（オプション）
- [ ] 学習ノート自動生成（間違えた問題 → Markdownノート）
- [ ] スペースド・リピティション（復習タイミング通知）
- [ ] 統計ダッシュボード（Obsidian DataviewJSで可視化）

## 6. UIデザイン方針

### ミニマル・モバイルファースト

#### デザイン原則:
1. **シンプル**: 1画面1タスク
2. **タッチフレンドリー**: ボタンは最低44x44px
3. **スクロール最小化**: 重要情報は画面内に収める
4. **Obsidianネイティブ**: 既存UIコンポーネントを活用

#### 画面構成:

```
┌─────────────────────────────────────┐
│ 📚 Birgerik Study              [⚙️] │ ← ヘッダー（固定）
├─────────────────────────────────────┤
│                                     │
│  Step 1: 資格を選択                  │
│  ┌─────────────────────────────┐   │
│  │ ☑️ AWS認定ソリューション       │   │
│  │    アーキテクト               │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ☑️ 応用情報技術者             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Step 2: 問題セットを選択            │
│  ┌─────────────────────────────┐   │
│  │ 📝 第1章（10問）              │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📝 第2章（15問）              │   │
│  └─────────────────────────────┘   │
│                                     │
│         [開始する →]                │
│                                     │
└─────────────────────────────────────┘
```

#### カラーテーマ:
- Obsidian CSS変数を使用（ダークモード自動対応）
- アクセントカラー: `var(--interactive-accent)`
- テキスト: `var(--text-normal)`
- 背景: `var(--background-primary)`

#### フォント:
- Obsidianデフォルトフォント（`var(--font-interface)`）
- コードブロック: `var(--font-monospace)`

## 7. メインタブ表示の実装

### Obsidian View API使用:

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian'
import { render } from 'preact'
import { StudyApp } from './components/study-app'

export const VIEW_TYPE_BIRGERIK = 'birgerik-study-view'

export class BirgerikStudyView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf)
  }

  getViewType(): string {
    return VIEW_TYPE_BIRGERIK
  }

  getDisplayText(): string {
    return '📚 Birgerik Study'
  }

  getIcon(): string {
    return 'graduation-cap'
  }

  async onOpen(): Promise<void> {
    // Preactコンポーネントをマウント
    const container = this.containerEl.children[1]
    container.empty()
    render(<StudyApp />, container)
  }

  async onClose(): Promise<void> {
    // クリーンアップ
  }
}

// プラグインロード時に登録
this.registerView(
  VIEW_TYPE_BIRGERIK,
  (leaf) => new BirgerikStudyView(leaf)
)

// コマンドで開く
this.addCommand({
  id: 'open-birgerik-study',
  name: '学習を開始',
  callback: () => {
    this.activateView()
  }
})
```

### 起動フロー:
1. コマンドパレット → "Birgerik: 学習を開始"
2. または設定でリボンアイコン追加
3. メインタブで全画面表示

## 8. 開発フェーズ

### Phase 1: 基盤構築（1日）
- [x] プロジェクトセットアップ（Obsidian Plugin Template）
- [x] REST APIクライアント実装（fetch wrapper）
- [x] 型定義のコピー
- [x] 基本的なView表示
- [x] プラグイン設定（API URL）

### Phase 2: コア機能（2-3日）
- [x] 資格一覧画面
- [x] 問題セット選択画面
- [x] 学習画面（問題表示・回答）
- [x] 結果画面
- [x] Zustand状態管理

### Phase 3: UI/UX磨き込み（2日）
- [x] モバイル対応CSS
- [x] Obsidianテーマ統合
- [x] ローディング状態
- [x] エラーハンドリング
- [x] アニメーション（控えめ）

### Phase 4: テスト・リリース（1日）
- [x] 手動テスト（デスクトップ・モバイル）
- [x] README作成
- [x] GitHub Releases
- [x] Obsidianコミュニティプラグイン申請

**合計: 約1週間でMVPリリース可能** ⚡

## 9. セキュリティとCORS

### 学習用APIは完全オープン 🌐

**方針:**
- 認証不要
- CORS: `*`（すべてのオリジンを許可）
- レート制限のみで悪用防止

### CORSについての正しい理解

**CORS（Cross-Origin Resource Sharing）とは:**
- **ブラウザの仕組み**であり、セキュリティ対策ではない
- ブラウザが「異なるオリジンからのリクエスト」をブロックするのを防ぐ

**重要な事実:**
1. Obsidian Desktopアプリは**Electronアプリ**（ブラウザではない）
2. `app://obsidian.md` というカスタムプロトコルを使用
3. Electronアプリや curl などのツールは**CORSチェックをバイパス可能**

```bash
# 誰でもこれでAPIを叩ける（CORSは関係ない）
curl https://birgerik.vercel.app/api/v1/study/certifications
```

### なぜ完全オープンで問題ないか？

1. **公開データのみ**
   - 学習用の問題・選択肢は公開情報
   - 個人情報や機密情報は含まない

2. **レート制限で悪用防止**
   - Vercelの自動レート制限: 100req/10秒/IP
   - DDoS攻撃などは自動ブロック

3. **キャッシングでサーバー負荷軽減**
   - 60秒間のキャッシュでデータベース負荷を軽減
   - 同じデータの繰り返しリクエストを防止

4. **CRUD操作は別の保護**
   - 管理用エンドポイント（POST/PUT/DELETE）は**JWT認証必須**
   - 学習データの改ざんは防止されている

### API側の実装例:

```typescript
// src/app/api/v1/study/certifications/route.ts
import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCertificationsWithQuestionSets } from '@/lib/database/study'

// 認証不要 - withAuth を削除
export async function GET() {
  try {
    const result = await getCachedCertificationsWithQuestionSets()

    if (result.error) {
      return errorResponse(result.error, 500)
    }

    const response = successResponse({ certifications: result.data })

    // CORSヘッダーを追加
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')

    return response
  } catch (error) {
    return errorResponse('取得に失敗しました', 500)
  }
}

// OPTIONSハンドラー（Preflightリクエスト対応）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
```

### Obsidianプラグイン側の実装:

```typescript
// src/api/client.ts
export class BirgerikApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getCertifications() {
    // 認証ヘッダー不要！
    const response = await fetch(`${this.baseUrl}/api/v1/study/certifications`)

    if (!response.ok) {
      throw new Error('Failed to fetch certifications')
    }

    return await response.json()
  }

  // 他のメソッドも同様にシンプル
}
```

## 10. オフライン対応戦略（Phase 2）

### IndexedDB使用:
```typescript
// 問題をローカルにキャッシュ
await db.questions.put({
  questionSetId: 'xxx',
  questions: [...],
  cachedAt: Date.now()
})

// オフライン時はキャッシュから読み込み
if (!navigator.onLine) {
  return await db.questions.get(questionSetId)
}
```

## 11. 推奨開発環境

```bash
# 必要なツール
- Node.js 18+
- pnpm
- Obsidian（テスト用）

# プロジェクト作成
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git birgerik-obsidian
cd birgerik-obsidian
pnpm install

# 開発モード（ホットリロード）
pnpm dev

# Obsidianプラグインディレクトリにシンボリックリンク
ln -s $(pwd) ~/path/to/vault/.obsidian/plugins/birgerik-obsidian
```

## 12. プラグイン設定

### 設定画面で管理する項目:

```typescript
interface BirgerikSettings {
  apiUrl: string  // デフォルト: 'https://birgerik.vercel.app'
  // 将来的な拡張:
  // - オフラインモード有効/無効
  // - キャッシュ有効期限
  // - ダークモード設定
}

const DEFAULT_SETTINGS: BirgerikSettings = {
  apiUrl: 'https://birgerik.vercel.app'
}
```

## 13. 次のステップ

### API側の対応（birgerikリポジトリ）:

1. ✅ 学習用エンドポイントから `withAuth` を削除
2. ✅ CORSヘッダー `*` を追加
3. ✅ OPTIONSハンドラー追加

### Obsidianプラグイン側の開発:

1. **新規リポジトリ作成**: `birgerik-obsidian`
2. **Obsidian Plugin Templateクローン**
3. **REST APIクライアント実装**
4. **資格一覧画面作成**
5. **学習機能実装**

### ご確認いただきたい点:

- ✅ **認証不要**の方針でOKか
- ✅ **CORS `*`** でOKか（学習用データは公開情報）
- ✅ **完全オープン + レート制限**の戦略でOKか
- ✅ **開発期間（約1週間）**は許容範囲か

---

**修正点まとめ:**
- ❌ 認証機能を削除
- ❌ JWT、ログイン画面を削除
- ✅ 完全オープンAPI戦略に変更
- ✅ CORSの正しい説明を追加
- ✅ よりシンプルで実装しやすい設計に

**ご質問やご要望があればお気軽にお知らせください！**
