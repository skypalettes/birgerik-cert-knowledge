# @birgerik/types

Birgerikプロジェクト間で共有されるTypeScript型定義パッケージ

## 概要

このパッケージは、Birgerikのメインアプリケーションとクライアント（Obsidianプラグインなど）間で型の整合性を保つために使用されます。

## 使用方法

### インストール

#### GitHub Package Registryから使用（推奨）

このパッケージはGitHub Package Registryに公開されています。

##### 1. `.npmrc` の設定

プロジェクトルートに `.npmrc` ファイルを作成：

```
@birgerik:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

##### 2. 認証設定

**ローカル開発の場合:**

1. GitHub Personal Access Tokenを生成（`read:packages` 権限が必要）
   - https://github.com/settings/tokens
   - "Tokens (classic)" を選択
   - `read:packages` スコープを付与

2. 環境変数として設定：

```bash
export NPM_TOKEN=your_github_token_here
```

**GitHub Actionsの場合:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://npm.pkg.github.com'

- name: Create .npmrc
  run: |
    echo "@birgerik:registry=https://npm.pkg.github.com" > .npmrc
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc

- name: Install dependencies
  run: npm ci
```

##### 3. パッケージのインストール

```bash
npm install @birgerik/types
```

#### ローカルパッケージとして使用

開発中は、ローカルパッケージとしても使用できます：

```bash
# メインアプリケーションから
npm install --save-dev file:./packages/types

# Obsidianプラグインから
npm install --save-dev file:../packages/types
```

### インポート

```typescript
import {
  CertificationWithQuestionSets,
  QuestionWithChoices,
  GetCertificationsResponse,
  StudySession,
  UserAnswer,
} from '@birgerik/types'
```

## 型カテゴリー

### API型 (`api.ts`)

REST API リクエスト・レスポンスの型定義

- `CertificationWithQuestionSets` - 資格と問題集
- `QuestionSetSummary` - 問題集サマリー
- `QuestionSetDetail` - 問題集詳細
- `QuestionWithChoices` - 問題と選択肢
- `Choice` - 選択肢
- `GetCertificationsResponse` - 資格一覧レスポンス
- `GetQuestionSetResponse` - 問題集レスポンス
- `GetQuestionsResponse` - 問題一覧レスポンス
- `ErrorResponse` - エラーレスポンス
- `SuccessResponse<T>` - 成功レスポンス（汎用）

### 学習セッション型 (`study.ts`)

学習セッション関連の型定義

- `UserAnswer` - ユーザーの回答
- `StudySession` - 学習セッション
- `StudyResult` - 学習結果

## 開発

### ビルド

```bash
npm run build
```

### Watch モード

```bash
npm run watch
```

## 型の更新フロー

1. `packages/types/src` 配下のTypeScriptファイルを更新
2. `npm run build` でビルド
3. 使用側のプロジェクトで型が自動的に更新される

## パブリッシング

このパッケージは、`main` ブランチに `packages/types/**` 配下の変更がプッシュされると、GitHub Actionsによって自動的にGitHub Package Registryに公開されます。

手動で新しいバージョンを公開する場合：

1. バージョンを更新：
   ```bash
   cd packages/types
   npm version patch  # または minor, major
   ```

2. 変更をプッシュ：
   ```bash
   git push && git push --tags
   ```

3. GitHub Actionsが自動的にパッケージを公開します

または、手動でワークフローを実行することもできます：
- GitHubのリポジトリページ → Actions → "Publish Types Package" → "Run workflow"

## バージョン管理

このパッケージのバージョンは [Semantic Versioning](https://semver.org/) に従います。

- **Major**: 破壊的変更（既存のコードが動かなくなる変更）
- **Minor**: 機能追加（後方互換性あり）
- **Patch**: バグ修正（後方互換性あり）

## ライセンス

MIT
