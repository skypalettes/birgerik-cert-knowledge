# Obsidian Plugin版 Birgerik 開発提案

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
│   ├── views/                 # Obsidian View コンポーネント
│   ├── components/            # UIコンポーネント（Preact/Svelte）
│   ├── store/                 # 状態管理
│   └── types/                 # 型定義（birgerikから共有）
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
| UIフレームワーク | **Preact** または Svelte | 軽量（3KB）、Reactライクな書き方 |
| 状態管理 | Zustand（軽量版） | birgerikと同じパターン、3KB |
| HTTP クライアント | fetch（ネイティブ） | 追加依存なし |
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
│  │  │  - 認証（JWT）                    │  │  │
│  │  │  - 資格・問題セット取得           │  │  │
│  │  │  - 問題・選択肢取得               │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │              ↓ HTTPS                   │  │
│  └──────────────┼──────────────────────────┘  │
└─────────────────┼──────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│         Birgerik REST API (Vercel)          │
│         https://birgerik.vercel.app         │
│  GET /api/v1/study/certifications           │
│  GET /api/v1/study/question-sets/:id        │
│  GET /api/v1/study/questions/:questionSetId │
└─────────────────────────────────────────────┘
```

### データフロー:

1. **認証**: プラグイン設定でメール・パスワード入力 → JWT取得・保存
2. **資格一覧**: 起動時に`GET /api/v1/study/certifications`で取得
3. **問題セット**: 資格選択後に`GET /api/v1/study/question-sets/:id`で取得
4. **問題**: 問題セット選択後に`GET /api/v1/study/questions/:questionSetId`で取得
5. **ローカル状態**: Zustandで学習セッション管理（オフライン対応）

## 5. 機能範囲（MVP）

### Phase 1: 基本機能
✅ 必要
- [x] 認証（JWT）
- [x] 資格一覧表示
- [x] 問題セット一覧表示
- [x] 問題表示
- [x] 選択肢選択
- [x] 正誤判定
- [x] 解説表示
- [x] 結果画面（正答率、間違えた問題）

❌ 不要（birgerik Webアプリ側で管理）
- 資格のCRUD
- 問題セットのCRUD
- 問題のCRUD
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

### Phase 1: 基盤構築（1-2日）
- [x] プロジェクトセットアップ（Obsidian Plugin Template）
- [x] REST APIクライアント実装
- [x] JWT認証フロー
- [x] 型定義のコピー
- [x] 基本的なView表示

### Phase 2: コア機能（3-4日）
- [x] 資格一覧画面
- [x] 問題セット選択画面
- [x] 学習画面（問題表示・回答）
- [x] 結果画面
- [x] Zustand状態管理

### Phase 3: UI/UX磨き込み（2-3日）
- [x] モバイル対応CSS
- [x] Obsidianテーマ統合
- [x] ローディング状態
- [x] エラーハンドリング
- [x] アニメーション（控えめ）

### Phase 4: テスト・リリース（1-2日）
- [x] 手動テスト（デスクトップ・モバイル）
- [x] README作成
- [x] GitHub Releases
- [x] Obsidianコミュニティプラグイン申請

**合計: 約1-2週間でMVPリリース可能**

## 9. セキュリティ考慮事項

### JWT保存:
```typescript
// Obsidian安全なストレージ使用
await this.plugin.saveData({
  jwt: encryptedToken,
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
})
```

### HTTPS通信:
- 本番環境: `https://birgerik.vercel.app`
- 開発環境: `http://localhost:3000`（設定で切り替え可能）

### CORS:
- birgerik側で`ALLOWED_ORIGINS`に`app://obsidian.md`を追加

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

## 12. 次のステップ

### すぐに始めるには:

1. **新規リポジトリ作成**: `birgerik-obsidian`
2. **Obsidian Plugin Templateクローン**
3. **REST APIクライアント実装**
4. **認証画面作成**
5. **資格一覧画面作成**

### ご確認いただきたい点:

- ✅ 別リポジトリ構成でOKか
- ✅ Preact使用でOKか
- ✅ メインタブ表示の方向性はOKか
- ✅ MVP機能範囲は適切か
- ✅ 開発期間（1-2週間）は許容範囲か

---

**ご質問やご要望があればお気軽にお知らせください！**
