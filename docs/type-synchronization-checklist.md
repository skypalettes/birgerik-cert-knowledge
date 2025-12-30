# 型同期チェックリスト

このドキュメントは、`@birgerik/types` パッケージを更新する際の完全なチェックリストを提供します。

## 目次

1. [型の更新フロー](#型の更新フロー)
2. [変更前のチェック](#変更前のチェック)
3. [変更中のチェック](#変更中のチェック)
4. [変更後のチェック](#変更後のチェック)
5. [トラブルシューティング](#トラブルシューティング)

## 型の更新フロー

### 1. 型の変更が必要になったとき

以下のような状況で型の更新が必要になります：

- [ ] 新しいAPIエンドポイントを追加する
- [ ] 既存のAPIレスポンス形式を変更する
- [ ] 新しいフィールドを追加する
- [ ] 既存のフィールドを削除する（破壊的変更）
- [ ] フィールド名を変更する（破壊的変更）
- [ ] 型の制約を変更する（例: `string` → `string | null`）

### 2. 破壊的変更かどうかを判断

**破壊的変更（Major version bump）の例:**

- [ ] フィールドの削除
- [ ] フィールド名の変更
- [ ] 必須フィールドの追加
- [ ] 型の制約の厳格化（例: `string | null` → `string`）

**非破壊的変更（Minor/Patch version bump）の例:**

- [ ] 新しいオプショナルフィールドの追加
- [ ] 型の制約の緩和（例: `string` → `string | null`）
- [ ] JSDocコメントの改善
- [ ] 型定義のバグ修正

## 変更前のチェック

### 環境確認

- [ ] Node.js がインストールされている（`node --version`）
- [ ] pnpm がインストールされている（`pnpm --version`）
- [ ] Git作業ディレクトリがクリーン（`git status`）
- [ ] mainブランチが最新（`git pull origin main`）

### 影響範囲の確認

1. **どのファイルが影響を受けるか確認:**

   ```bash
   # 型の使用箇所を検索
   cd /path/to/birgerik
   grep -r "CertificationWithQuestionSets" src/
   grep -r "QuestionWithChoices" src/

   cd /path/to/birgerik-obsidian
   grep -r "CertificationWithQuestionSets" src/
   grep -r "QuestionWithChoices" src/
   ```

2. **チェック項目:**
   - [ ] メインアプリでの使用箇所を特定
   - [ ] Obsidianプラグインでの使用箇所を特定
   - [ ] 影響を受けるファイルのリストを作成

## 変更中のチェック

### 1. 型定義の更新

**ファイル:** `packages/types/src/api.ts` または `packages/types/src/study.ts`

- [ ] 型定義を更新
- [ ] JSDocコメントを追加/更新
- [ ] `@property` タグで各フィールドを説明
- [ ] `@example` タグで使用例を追加
- [ ] 型の export が正しいことを確認

**例:**

```typescript
/**
 * 問題と選択肢
 *
 * @property {string} id - 問題の一意識別子（UUID）
 * @property {string} question_text - 問題文（Markdown形式）
 * @property {string | null} explanation - 解説文（Markdown形式、任意）
 * @property {boolean} is_multiple_choice - 複数選択可能かどうか
 * @property {number | null} order_index - 問題の表示順序（任意）
 * @property {Choice[]} choices - 選択肢の配列
 *
 * @example
 * ```typescript
 * const question: QuestionWithChoices = {
 *   id: "550e8400-...",
 *   question_text: "## 問題文",
 *   explanation: "解説",
 *   is_multiple_choice: false,
 *   order_index: 0,
 *   choices: [...]
 * }
 * ```
 */
export interface QuestionWithChoices {
  id: string
  question_text: string
  explanation: string | null
  is_multiple_choice: boolean
  order_index: number | null
  choices: Choice[]
}
```

### 2. ビルドとバリデーション

```bash
cd packages/types

# ビルド
pnpm run build

# TypeScriptエラーがないことを確認
echo $?  # 0ならOK
```

- [ ] ビルドが成功する
- [ ] TypeScriptエラーがない
- [ ] `dist/` ディレクトリに `.js` と `.d.ts` ファイルが生成される

### 3. バージョンの更新

**Semantic Versioning に従う:**

```bash
cd packages/types

# Patch（バグ修正、後方互換性あり）
npm version patch   # 1.0.0 → 1.0.1

# Minor（機能追加、後方互換性あり）
npm version minor   # 1.0.0 → 1.1.0

# Major（破壊的変更）
npm version major   # 1.0.0 → 2.0.0
```

- [ ] 適切なバージョンを選択
- [ ] `package.json` の version が更新されたことを確認

### 4. CHANGELOG の更新

**ファイル:** `packages/types/CHANGELOG.md`

```markdown
## [1.1.0] - 2025-01-15

### Added

- `QuestionWithChoices` に `tags` フィールドを追加（オプショナル）
- 新しい型 `QuestionTag` を追加

### Changed

- `Choice.choice_text` の JSDoc コメントを改善

### Deprecated

- なし

### Removed

- なし

### Fixed

- `UserAnswer.answeredAt` の型が正しく Date になっていないバグを修正
```

- [ ] CHANGELOGに変更内容を記載
- [ ] バージョン番号と日付を記載
- [ ] Added/Changed/Fixed のカテゴリを使用

## 変更後のチェック

### 1. メインアプリでの検証

```bash
cd /path/to/birgerik

# 依存関係を更新
pnpm install

# ビルド
pnpm run build

# 開発サーバー起動
pnpm run dev
```

**チェック項目:**

- [ ] `pnpm install` が成功する
- [ ] TypeScriptのビルドエラーがない
- [ ] `pnpm run build` が成功する
- [ ] アプリが起動する
- [ ] 影響を受けるページ/機能が正常に動作する

**テストすべき機能:**

- [ ] 資格一覧の取得
- [ ] 問題集の取得
- [ ] 問題の表示
- [ ] 回答の送信
- [ ] 学習セッションの開始/終了

### 2. Obsidianプラグインでの検証

```bash
cd /path/to/birgerik-obsidian

# 依存関係を更新
pnpm install

# ビルド
pnpm run build
```

**チェック項目:**

- [ ] `pnpm install` が成功する
- [ ] TypeScriptのビルドエラーがない
- [ ] `pnpm run build` が成功する
- [ ] プラグインが Obsidian で読み込める
- [ ] 資格一覧が表示される
- [ ] 問題集が選択できる
- [ ] 学習セッションが開始できる
- [ ] 問題が正しく表示される
- [ ] 回答が正しく処理される

### 3. Git コミットとプッシュ

```bash
cd /path/to/birgerik

# 変更をステージング
git add packages/types/
git status

# コミット
git commit -m "feat(types): Add tags field to QuestionWithChoices

- Add optional tags field to QuestionWithChoices interface
- Add QuestionTag type definition
- Update JSDoc comments
- Bump version to 1.1.0

BREAKING CHANGE: None (backward compatible)"

# プッシュ
git push origin main
```

**チェック項目:**

- [ ] コミットメッセージが明確
- [ ] 破壊的変更の場合は `BREAKING CHANGE:` を記載
- [ ] CHANGELOGがコミットに含まれている
- [ ] `package.json` の version 更新がコミットに含まれている

### 4. npm パッケージの公開（オプション）

npm にパッケージを公開する場合:

```bash
cd packages/types

# npmにログイン
npm login

# 公開（ドライラン）
npm publish --dry-run

# 実際に公開
npm publish
```

**チェック項目:**

- [ ] npm アカウントにログインしている
- [ ] パッケージ名が利用可能
- [ ] `npm publish --dry-run` でエラーがない
- [ ] 公開が成功した
- [ ] npmjs.com でパッケージが確認できる

### 5. 依存プロジェクトの更新

npm パッケージとして公開した場合、依存プロジェクトで更新:

```bash
# メインアプリ
cd /path/to/birgerik
pnpm update @birgerik/types
pnpm run build

# Obsidianプラグイン
cd /path/to/birgerik-obsidian
pnpm update @birgerik/types
pnpm run build
```

**チェック項目:**

- [ ] メインアプリで型パッケージが更新された
- [ ] Obsidianプラグインで型パッケージが更新された
- [ ] 両方のプロジェクトがビルドできる
- [ ] 実際の動作を確認

## トラブルシューティング

### ビルドエラー: "Cannot find module '@birgerik/types'"

**原因:** 型パッケージがインストールされていない

**解決方法:**

```bash
cd /path/to/birgerik  # または birgerik-obsidian
pnpm install
```

### ビルドエラー: "Type ... is not assignable to type ..."

**原因:** 型の変更が破壊的で、既存のコードと互換性がない

**解決方法:**

1. エラーが発生しているファイルを特定
2. 新しい型定義に合わせてコードを修正
3. または、型定義を後方互換性のある形に修正

### 型定義の変更が反映されない

**原因1:** TypeScriptがキャッシュを使用している

**解決方法:**

```bash
# TypeScriptのビルドキャッシュをクリア
rm -rf node_modules/.cache
rm -rf .next  # Next.jsの場合

# 再ビルド
pnpm run build
```

**原因2:** 型パッケージがビルドされていない

**解決方法:**

```bash
cd packages/types
pnpm run build
```

### Git submodule が更新されない

**原因:** submodule を使用している場合、手動更新が必要

**解決方法:**

```bash
git submodule update --remote
```

## まとめ

型の更新を行う際は、このチェックリストに従って以下の手順を実行してください：

1. **変更前:** 影響範囲を確認
2. **変更中:** 型定義を更新し、バージョンを適切に上げる
3. **変更後:** すべての依存プロジェクトで動作確認

破壊的変更を行う場合は特に慎重に、すべての依存プロジェクトでの動作確認を必ず行ってください。
