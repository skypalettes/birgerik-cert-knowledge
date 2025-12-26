# @birgerik/types

Birgerikプロジェクト間で共有されるTypeScript型定義パッケージ

## 概要

このパッケージは、Birgerikのメインアプリケーションとクライアント（Obsidianプラグインなど）間で型の整合性を保つために使用されます。

## 使用方法

### インストール

#### ローカルパッケージとして使用（推奨）

```bash
# メインアプリケーションから
npm install --save-dev file:./packages/types

# Obsidianプラグインから
npm install --save-dev file:../packages/types
```

#### npm パッケージとして公開する場合

```bash
cd packages/types
npm publish
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

## バージョン管理

このパッケージのバージョンは [Semantic Versioning](https://semver.org/) に従います。

- **Major**: 破壊的変更（既存のコードが動かなくなる変更）
- **Minor**: 機能追加（後方互換性あり）
- **Patch**: バグ修正（後方互換性あり）

## ライセンス

MIT
