# Birgerik Obsidian Plugin

Birgerik資格試験学習システムのObsidianプラグイン。Obsidian内で問題演習を行うことができます。

## 📋 プロジェクト概要

### 目的
- Obsidian Vaultから直接、資格試験の問題演習ができる
- Supabase認証により、ユーザーごとのアクセス制御
- Markdown形式の問題文・解説で学習効率を向上

### 主な機能
- ✅ Supabaseユーザー認証（設定画面からログイン）
- ✅ 資格一覧・問題集一覧の取得
- ✅ 問題演習（単一選択・複数選択対応）
- ✅ Markdown形式の問題文・解説表示
- ✅ 自動トークンリフレッシュ（期限5分前）
- ✅ BANされたユーザーの自動ログアウト

---

## 🏗️ 技術スタック

### コア技術
- **TypeScript** - 型安全な開発
- **Obsidian Plugin API** - プラグイン基盤
- **Preact** - UIコンポーネント（軽量React互換）
- **esbuild** - 高速ビルド

### 認証・API
- **Supabase Auth** - ユーザー認証（JWT Token）
- **REST API** - バックエンドとの通信

### 開発ツール
- **pnpm** - パッケージマネージャー
- **tsx** - TypeScript実行環境

---

## 📁 プロジェクト構造

```
birgerik-obsidian/
├── src/
│   ├── main.ts                    # プラグインエントリーポイント
│   ├── settings.ts                # 設定画面とUI
│   ├── api/
│   │   └── client.ts              # APIクライアント
│   ├── services/
│   │   └── auth-service.ts        # 認証サービス
│   ├── views/
│   │   └── study-view.tsx         # 学習ビュー（Preact）
│   └── types/
│       └── api.ts                 # API型定義
├── manifest.json                  # プラグイン情報
├── package.json                   # 依存関係
├── tsconfig.json                  # TypeScript設定
├── esbuild.config.mjs            # ビルド設定
└── CLAUDE.md                     # このファイル
```

---

## 🔐 認証システム

### Supabase認証フロー

1. **ログイン**: 設定画面でメール/パスワード入力
2. **トークン取得**: `access_token` + `refresh_token` + `expires_at`
3. **トークン保存**: Obsidian設定に保存（暗号化）
4. **自動リフレッシュ**: 期限5分前に自動更新
5. **API呼び出し**: `Authorization: Bearer {access_token}`
6. **401エラー**: 自動ログアウト → 再認証

### 認証関連ファイル

**AuthService** (`src/services/auth-service.ts`)
```typescript
class AuthService {
  login(email, password)              // ログイン
  logout()                            // ログアウト
  getValidAccessToken()               // 有効なトークン取得（自動リフレッシュ）
  refreshToken()                      // トークン手動リフレッシュ
  isLoggedIn()                        // ログイン状態確認
}
```

**Settings** (`src/settings.ts`)
```typescript
interface BirgerikSettings {
  apiUrl: string
  auth: {
    accessToken: string | null
    refreshToken: string | null
    expiresAt: number | null
    userEmail: string | null
  }
}
```

---

## 🌐 バックエンドAPI統合

### APIベースURL
デフォルト: `https://birgerik.vercel.app`
設定画面から変更可能

### エンドポイント

#### 1. 認証API

**ログイン**
```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "data": {
    "token": "...",  // 管理画面用（使用しない）
    "user": { "id": "...", "email": "..." },
    "supabase": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_in": 3600,
      "expires_at": 1234567890
    }
  }
}
```

**トークンリフレッシュ**
```
POST /api/v1/auth/refresh
Content-Type: application/json

Request:
{
  "refresh_token": "..."
}

Response:
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600,
    "expires_at": 1234567890,
    "user": { "id": "...", "email": "..." }
  }
}
```

#### 2. 学習API（認証必須）

すべてのリクエストに `Authorization: Bearer {access_token}` ヘッダーが必要

**資格一覧取得**
```
GET /api/v1/study/certifications

Response:
{
  "data": {
    "certifications": [
      {
        "id": "uuid",
        "name": "AWS SAA",
        "description": "...",
        "question_sets": [
          {
            "id": "uuid",
            "name": "第1回模擬試験",
            "description": "...",
            "question_count": 65
          }
        ]
      }
    ]
  }
}
```

**問題集詳細取得**
```
GET /api/v1/study/question-sets/{id}

Response:
{
  "data": {
    "question_set": {
      "id": "uuid",
      "name": "第1回模擬試験",
      "description": "...",
      "certification_name": "AWS SAA",
      "question_count": 65
    }
  }
}
```

**問題一覧取得**
```
GET /api/v1/study/questions/{questionSetId}

Response:
{
  "data": {
    "questions": [
      {
        "id": "uuid",
        "question_text": "## 問題文\n\n...",
        "explanation": "## 解説\n\n...",
        "is_multiple_choice": false,
        "order_index": 0,
        "choices": [
          {
            "id": "uuid",
            "choice_text": "選択肢A",
            "is_correct": true,
            "order_index": 0
          }
        ]
      }
    ]
  }
}
```

### エラーレスポンス
```json
{
  "error": "エラーメッセージ"
}
```

- **401 Unauthorized**: トークン無効・期限切れ → 自動ログアウト
- **403 Forbidden**: BANされたユーザー → 自動ログアウト
- **500 Server Error**: サーバーエラー

---

## 🚀 開発環境セットアップ

### 前提条件
- Node.js 18以上
- pnpm 8以上

### セットアップ手順

```bash
# 1. 依存関係インストール
pnpm install

# 2. 開発ビルド（ウォッチモード）
pnpm run dev

# 3. プロダクションビルド
pnpm run build

# 4. 型チェック
pnpm run check
```

### ビルド成果物
- `main.js` - プラグイン本体
- `manifest.json` - プラグイン情報
- `styles.css` - スタイルシート

---

## 📦 配布方法

### Obsidian Community Plugin（推奨）
1. GitHub Releasesに以下を含める：
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Obsidian Community Plugin登録

### 手動インストール
1. ビルド成果物を`.obsidian/plugins/birgerik-obsidian/`にコピー
2. Obsidianでプラグインを有効化

---

## 🔧 主要ファイル詳細

### `src/main.ts`
プラグインのエントリーポイント

```typescript
export default class BirgerikPlugin extends Plugin {
  settings: BirgerikSettings
  authService: AuthService
  apiClient: BirgerikApiClient

  async onload() {
    await this.loadSettings()
    this.authService = new AuthService(this.settings, this.saveSettings.bind(this))
    this.apiClient = new BirgerikApiClient(this.settings.apiUrl, this.authService)
    // ビュー登録、コマンド登録など
  }
}
```

### `src/services/auth-service.ts`
認証ロジックの中核

**重要メソッド**:
- `login()`: メール/パスワードでログイン、トークン保存
- `getValidAccessToken()`: トークン取得（自動リフレッシュ）
- `refreshToken()`: トークン手動リフレッシュ
- `logout()`: トークンクリア

### `src/api/client.ts`
APIクライアント

**重要メソッド**:
- `authenticatedFetch()`: 認証付きリクエスト
- `getCertifications()`: 資格一覧取得
- `getQuestionSet()`: 問題集取得
- `getQuestions()`: 問題一覧取得

**レスポンス処理**:
```typescript
const result = await response.json()
return result.data  // { data: { ... } } から data を取り出す
```

### `src/settings.ts`
設定画面とUI

**機能**:
- API URL設定
- ログイン/ログアウトUI
- ログイン状態表示

### `src/views/study-view.tsx`
学習ビュー（Preact）

**画面構成**:
1. `CertificationListScreen` - 資格一覧
2. `QuestionSetListScreen` - 問題集一覧
3. `QuestionScreen` - 問題演習

---

## 🎨 UI開発（Preact）

### Preactコンポーネント例

```typescript
import { h, Component } from 'preact'

interface Props {
  plugin: BirgerikPlugin
}

class MyComponent extends Component<Props> {
  render() {
    return (
      <div>
        <h1>タイトル</h1>
        <button onClick={() => this.handleClick()}>
          クリック
        </button>
      </div>
    )
  }

  handleClick() {
    // イベントハンドラ
  }
}
```

### Obsidian Notice表示
```typescript
import { Notice } from 'obsidian'

new Notice('メッセージ')
new Notice('エラー', 5000) // 5秒表示
```

---

## 🔨 新機能追加ガイド

### 1. 新しいAPIエンドポイント追加

**手順**:
1. `src/types/api.ts`に型定義追加
2. `src/api/client.ts`にメソッド追加
3. 認証が必要な場合は`authenticatedFetch()`使用

**例**:
```typescript
// 型定義
export interface GetUserStatsResponse {
  stats: {
    total_questions: number
    correct_answers: number
    accuracy: number
  }
}

// APIクライアント
async getUserStats(): Promise<GetUserStatsResponse> {
  const response = await this.authenticatedFetch(
    `${this.baseUrl}/api/v1/study/stats`,
    { method: 'GET' }
  )

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || '統計の取得に失敗しました')
  }

  const result = await response.json()
  return result.data
}
```

### 2. 新しい画面追加

**手順**:
1. `src/views/`に新しいPreactコンポーネント作成
2. `BirgerikStudyView`に状態とルーティング追加
3. 必要に応じてAPIクライアント呼び出し

**例**:
```typescript
// src/views/stats-screen.tsx
import { h, Component } from 'preact'

export class StatsScreen extends Component<Props> {
  state = {
    stats: null,
    loading: true
  }

  async componentDidMount() {
    try {
      const stats = await this.props.plugin.apiClient.getUserStats()
      this.setState({ stats, loading: false })
    } catch (error) {
      new Notice(`エラー: ${error.message}`)
      this.setState({ loading: false })
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }

    return (
      <div>
        <h2>学習統計</h2>
        <p>正答率: {this.state.stats.accuracy}%</p>
      </div>
    )
  }
}
```

### 3. 設定項目追加

**手順**:
1. `src/settings.ts`の`BirgerikSettings`に項目追加
2. `DEFAULT_SETTINGS`にデフォルト値設定
3. `BirgerikSettingTab.display()`にUI追加

**例**:
```typescript
// 型定義
export interface BirgerikSettings {
  apiUrl: string
  showExplanationImmediately: boolean  // 新規追加
  auth: { ... }
}

// デフォルト値
export const DEFAULT_SETTINGS: BirgerikSettings = {
  apiUrl: 'https://birgerik.vercel.app',
  showExplanationImmediately: false,  // 新規追加
  auth: { ... }
}

// UI
new Setting(containerEl)
  .setName('解説を即座に表示')
  .setDesc('問題に回答後、すぐに解説を表示します')
  .addToggle((toggle) =>
    toggle
      .setValue(this.plugin.settings.showExplanationImmediately)
      .onChange(async (value) => {
        this.plugin.settings.showExplanationImmediately = value
        await this.plugin.saveSettings()
      })
  )
```

---

## 🐛 トラブルシューティング

### ビルドエラー
```bash
# 依存関係の再インストール
rm -rf node_modules
pnpm install

# キャッシュクリア
rm -rf .obsidian
```

### 認証エラー
- API URLが正しいか確認
- ユーザーがBANされていないか確認（`manage-user list`）
- トークンの有効期限を確認（設定画面でログアウト→再ログイン）

### API呼び出しエラー
- ブラウザの開発者ツールでネットワークタブ確認
- CORSエラーの場合、バックエンドのCORS設定を確認
- 401エラーの場合、トークンが無効（再ログイン）

---

## 📚 参考リソース

### Obsidian Plugin Development
- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

### Supabase
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

### TypeScript & Preact
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Preact Documentation](https://preactjs.com/guide/v10/getting-started)

---

## 🎯 今後の開発アイデア

### 機能拡張
- [ ] 学習履歴の記録・表示
- [ ] 間違えた問題の復習モード
- [ ] タイマー機能（本番試験形式）
- [ ] 問題のブックマーク機能
- [ ] オフラインモード（ローカルキャッシュ）
- [ ] 統計グラフ表示
- [ ] 問題のシャッフル機能
- [ ] ダークモード対応

### パフォーマンス改善
- [ ] 問題の事前読み込み（Prefetch）
- [ ] 画像の遅延読み込み
- [ ] API呼び出しのキャッシュ

### UX改善
- [ ] キーボードショートカット
- [ ] 進捗バーの表示
- [ ] アニメーション効果
- [ ] レスポンシブデザイン

---

## 📝 開発時の注意事項

### セキュリティ
- ⚠️ **パスワードを保存しない**: 設定には`access_token`と`refresh_token`のみ保存
- ⚠️ **トークンの取り扱い**: ログに出力しない、第三者と共有しない
- ⚠️ **API URLの検証**: ユーザー入力のURL検証を実施

### コーディング規約
- TypeScriptの型を適切に使用（`any`を避ける）
- 非同期処理は`async/await`を使用
- エラーハンドリングを適切に実施（try-catch）
- ユーザーへのフィードバック（Notice表示）

### テスト
- 新機能追加時は手動テスト実施
- 認証フローの動作確認
- エラーケースのテスト

---

## 💡 サポート

### 開発サポート
このプロジェクトは独立して開発を続けることができます。
API仕様に変更がない限り、バックエンドとの連携は継続して動作します。

### API変更時の対応
バックエンドAPIに変更があった場合：
1. `src/types/api.ts`の型定義を更新
2. `src/api/client.ts`のメソッドを更新
3. 影響を受けるコンポーネントを更新

---

**プロジェクト完了日**: 2025年12月30日
**最終ビルド確認**: ✅ 成功
**認証機能**: ✅ 動作確認済み
**配布準備**: ✅ 完了
