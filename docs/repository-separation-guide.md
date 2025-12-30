# リポジトリ分離ガイド

このドキュメントでは、BirgerikメインアプリケーションとObsidianプラグインを別々のリポジトリに分離する手順を説明します。

## 目次

1. [現在の構成](#現在の構成)
2. [分離後の構成](#分離後の構成)
3. [分離手順](#分離手順)
4. [型の同期戦略](#型の同期戦略)
5. [開発ワークフロー](#開発ワークフロー)

## 現在の構成

```
birgerik/
├── src/                    # メインアプリケーション
├── birgerik-obsidian/      # Obsidianプラグイン
├── packages/
│   └── types/              # 共有型定義パッケージ
└── docs/
```

## 分離後の構成

### リポジトリ1: `birgerik`（メインアプリケーション）

```
birgerik/
├── src/                    # Next.jsアプリケーション
├── packages/
│   └── types/              # 共有型定義パッケージ
├── docs/
├── package.json
└── README.md
```

**リポジトリURL**: `https://github.com/[username]/birgerik`

### リポジトリ2: `birgerik-obsidian`（Obsidianプラグイン）

```
birgerik-obsidian/
├── src/                    # プラグインソースコード
├── package.json
├── manifest.json
└── README.md
```

**リポジトリURL**: `https://github.com/[username]/birgerik-obsidian`

## 分離手順

### ステップ1: 新しいリポジトリを作成

#### 1-1. GitHubで新しいリポジトリを作成

```bash
# birgerik-obsidian リポジトリをGitHubで作成
# https://github.com/new
```

#### 1-2. Obsidianプラグインのディレクトリを独立させる

```bash
# birgerikリポジトリのルートディレクトリで実行

# 1. birgerik-obsidianディレクトリをコピー
cp -r birgerik-obsidian ../birgerik-obsidian-new

# 2. 新しいディレクトリに移動
cd ../birgerik-obsidian-new

# 3. Gitリポジトリを初期化
git init

# 4. package.jsonの型パッケージ参照を更新（後述）
# file:../packages/types から npm パッケージまたはGit submoduleに変更
```

### ステップ2: 共有型パッケージの配布方法を選択

型の整合性を保つために、以下の3つの方法から選択します。

#### オプションA: npm パッケージとして公開（推奨）

**メリット:**
- バージョン管理が明確
- 依存関係の解決が簡単
- CI/CDと相性が良い

**デメリット:**
- npm公開の手間
- プライベートパッケージの場合、npmアカウントが必要

**手順:**

```bash
# 1. birgerikリポジトリで型パッケージを公開
cd packages/types
npm login
npm publish

# 2. birgerik-obsidianで型パッケージをインストール
cd ../../birgerik-obsidian
npm install --save-dev @birgerik/types
```

**package.json更新:**
```json
{
  "dependencies": {
    "@birgerik/types": "^1.0.0"
  }
}
```

#### オプションB: Git Submodule（中間）

**メリット:**
- npm公開不要
- リアルタイムで型の更新を反映

**デメリット:**
- submoduleの管理が複雑
- 開発者が`git submodule update`を忘れやすい

**手順:**

```bash
# birgerik-obsidianリポジトリで実行

# 1. packagesディレクトリを作成
mkdir -p packages

# 2. birgerik/packages/typesをsubmoduleとして追加
git submodule add https://github.com/[username]/birgerik.git packages/birgerik
git config -f .gitmodules submodule.packages/birgerik.path packages/birgerik
git config -f .gitmodules submodule.packages/birgerik.sparse-checkout packages/types

# 3. sparse checkoutを有効化（typesディレクトリのみ取得）
cd packages/birgerik
git sparse-checkout init --cone
git sparse-checkout set packages/types
cd ../..
```

**package.json更新:**
```json
{
  "dependencies": {
    "@birgerik/types": "file:./packages/birgerik/packages/types"
  }
}
```

#### オプションC: 手動コピー（非推奨）

型定義を手動でコピーする方法。整合性が保たれないためお勧めしません。

### ステップ3: Obsidianプラグインのpackage.jsonを更新

```json
{
  "name": "birgerik-obsidian",
  "version": "0.1.0",
  "description": "Birgerik学習プラグイン",
  "dependencies": {
    "@birgerik/types": "^1.0.0",  // または "file:./packages/birgerik/packages/types"
    "preact": "^10.19.3",
    "zustand": "^4.4.7"
  }
}
```

### ステップ4: READMEを更新

#### birgerik/README.md

```markdown
# Birgerik

資格試験の問題を蓄積して、自由に学習できるアプリケーション

## 関連リポジトリ

- [birgerik-obsidian](https://github.com/[username]/birgerik-obsidian) - Obsidianプラグイン

## 型定義パッケージ

このリポジトリには `@birgerik/types` パッケージが含まれています。
クライアントアプリケーションとの型の整合性を保つために使用されます。

詳細は [packages/types/README.md](./packages/types/README.md) を参照してください。
```

#### birgerik-obsidian/README.md

```markdown
# Birgerik Obsidian Plugin

Birgerik学習プラグイン - 資格試験の問題演習をObsidian内で

## 依存関係

このプラグインは `@birgerik/types` パッケージを使用して、
Birgerikメインアプリケーションとの型の整合性を保ちます。

## インストール

\`\`\`bash
npm install
npm run build
\`\`\`
```

### ステップ5: CIの設定（オプション）

#### GitHub Actions（birgerik）

`.github/workflows/publish-types.yml`:

```yaml
name: Publish Types Package

on:
  push:
    tags:
      - 'types-v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - name: Install dependencies
        run: cd packages/types && npm install
      - name: Build
        run: cd packages/types && npm run build
      - name: Publish to npm
        run: cd packages/types && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### GitHub Actions（birgerik-obsidian）

`.github/workflows/build.yml`:

```yaml
name: Build Plugin

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true  # Git submoduleを使う場合
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
```

### ステップ6: 元のリポジトリからObsidianプラグインを削除

```bash
# birgerikリポジトリで実行

# 1. birgerik-obsidianディレクトリを削除
git rm -r birgerik-obsidian

# 2. .gitignoreを更新（必要に応じて）
echo "birgerik-obsidian/" >> .gitignore

# 3. コミット
git add -A
git commit -m "chore: Move Obsidian plugin to separate repository

The Obsidian plugin has been moved to its own repository:
https://github.com/[username]/birgerik-obsidian

Shared types are maintained in packages/types and published as @birgerik/types."

# 4. プッシュ
git push origin main
```

## 型の同期戦略

### 型の更新フロー

1. **メインアプリでAPI型を変更**
   ```bash
   # birgerik/packages/types/src/api.ts を編集
   cd packages/types
   npm run build
   npm version patch  # または minor, major
   npm publish
   ```

2. **Obsidianプラグインで型を更新**
   ```bash
   # birgerik-obsidian で実行
   npm update @birgerik/types
   npm run build
   ```

### バージョニング規則

- **Major (1.x.x → 2.x.x)**: 破壊的変更（既存コードが動かなくなる）
- **Minor (x.1.x → x.2.x)**: 新機能追加（後方互換性あり）
- **Patch (x.x.1 → x.x.2)**: バグ修正（後方互換性あり）

### 型変更時のチェックリスト

- [ ] `packages/types/src` の型定義を更新
- [ ] バージョンを適切に更新（`npm version`）
- [ ] CHANGELOGを更新
- [ ] npmに公開（または submodule をコミット）
- [ ] 依存プロジェクト（Obsidianプラグイン）で更新
- [ ] ビルドが通ることを確認

## 開発ワークフロー

### メインアプリケーション開発

```bash
cd birgerik

# 開発サーバー起動
npm run dev

# 型を変更した場合
cd packages/types
npm run build
npm version patch
npm publish
```

### Obsidianプラグイン開発

```bash
cd birgerik-obsidian

# 開発モード
npm run dev

# 型パッケージを更新
npm update @birgerik/types
```

### ローカル開発時の型変更テスト

npm公開前に型変更をテストしたい場合:

```bash
# birgerik/packages/types で型を変更後
cd /path/to/birgerik/packages/types
npm run build
npm pack  # birgerik-types-1.0.0.tgz が生成される

# birgerik-obsidian でテスト
cd /path/to/birgerik-obsidian
npm install /path/to/birgerik/packages/types/birgerik-types-1.0.0.tgz
npm run build
```

## トラブルシューティング

### 型が見つからないエラー

```
Cannot find module '@birgerik/types'
```

**解決方法:**
```bash
npm install @birgerik/types
# または
npm link @birgerik/types
```

### Git Submodule が空

```bash
git submodule update --init --recursive
```

### 型の不整合

メインアプリとObsidianプラグインで型のバージョンが異なる場合:

```bash
# Obsidianプラグインで
npm update @birgerik/types
npm run build
```

## まとめ

このガイドに従うことで、BirgerikメインアプリケーションとObsidianプラグインを独立したリポジトリに分離しつつ、型の整合性を保つことができます。

**推奨構成:**
- npm パッケージとして `@birgerik/types` を公開
- Obsidianプラグインは npm パッケージとして `@birgerik/types` を利用
- バージョン管理とCI/CDで自動化

この構成により、各プロジェクトが独立して開発でき、かつ型の安全性も保たれます。
