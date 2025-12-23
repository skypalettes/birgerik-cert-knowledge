# データベースパフォーマンス最適化ガイド

## 概要

このドキュメントでは、Birgerik Coreのデータベースパフォーマンスを最適化するための推奨事項を説明します。

## 現在のクエリパターン分析

### 1. Certifications（資格）

**よく使われるクエリ:**
```sql
-- 資格一覧取得（問題集数を含む）
SELECT * FROM certifications ORDER BY created_at DESC;
SELECT COUNT(*) FROM question_sets WHERE certification_id = ?;

-- 資格検索
SELECT * FROM certifications WHERE id = ?;
```

**アクセスパターン:**
- `created_at` でソート（DESC）
- `id` で単一行検索（主キーインデックス既存）

### 2. Question Sets（問題集）

**よく使われるクエリ:**
```sql
-- 問題集一覧
SELECT * FROM question_sets ORDER BY created_at DESC;

-- 資格に紐づく問題集
SELECT * FROM question_sets WHERE certification_id = ? ORDER BY name;

-- 問題集の問題数カウント
SELECT COUNT(*) FROM questions WHERE question_set_id = ?;
```

**アクセスパターン:**
- `certification_id` で頻繁にフィルタリング
- `created_at` と `name` でソート
- `question_set_id` への外部キー参照

### 3. Questions（問題）

**よく使われるクエリ:**
```sql
-- 問題集の問題一覧
SELECT * FROM questions WHERE question_set_id = ? ORDER BY order_index;

-- 問題詳細（選択肢を含む）
SELECT * FROM questions WHERE id = ?;
SELECT * FROM choices WHERE question_id = ?;
```

**アクセスパターン:**
- `question_set_id` で頻繁にフィルタリング
- `order_index` でソート
- 選択肢との結合クエリ

### 4. Choices（選択肢）

**よく使われるクエリ:**
```sql
-- 問題の選択肢
SELECT * FROM choices WHERE question_id = ? ORDER BY order_index;
```

**アクセスパターン:**
- `question_id` で頻繁にフィルタリング
- `order_index` でソート

## 推奨インデックス

### 優先度: 高 🔴

これらのインデックスは **即座に作成すべき** です：

#### 1. question_sets テーブル

```sql
-- certification_id でのフィルタリングを高速化（最重要）
CREATE INDEX idx_question_sets_certification_id
ON question_sets(certification_id);

-- name でのソートを高速化
CREATE INDEX idx_question_sets_name
ON question_sets(name);

-- created_at でのソートを高速化
CREATE INDEX idx_question_sets_created_at
ON question_sets(created_at DESC);

-- 複合インデックス（certification_id + name でのソート）
CREATE INDEX idx_question_sets_cert_name
ON question_sets(certification_id, name);
```

**期待される効果:**
- 資格別問題集取得: **50-80%高速化**
- 問題集一覧取得: **30-50%高速化**

#### 2. questions テーブル

```sql
-- question_set_id でのフィルタリングを高速化（最重要）
CREATE INDEX idx_questions_question_set_id
ON questions(question_set_id);

-- question_set_id + order_index での取得を高速化
CREATE INDEX idx_questions_set_order
ON questions(question_set_id, order_index);

-- created_at でのソートを高速化
CREATE INDEX idx_questions_created_at
ON questions(created_at DESC);
```

**期待される効果:**
- 問題集の問題一覧取得: **60-90%高速化**
- 学習画面の読み込み: **50-70%高速化**

#### 3. choices テーブル

```sql
-- question_id でのフィルタリングを高速化（最重要）
CREATE INDEX idx_choices_question_id
ON choices(question_id);

-- question_id + order_index での取得を高速化
CREATE INDEX idx_choices_question_order
ON choices(question_id, order_index);
```

**期待される効果:**
- 問題詳細取得: **40-60%高速化**
- N+1クエリ問題の軽減

### 優先度: 中 🟡

パフォーマンスが問題になった場合に作成：

#### 4. certifications テーブル

```sql
-- name での検索を高速化（将来の検索機能用）
CREATE INDEX idx_certifications_name
ON certifications(name);

-- created_at でのソートを高速化
CREATE INDEX idx_certifications_created_at
ON certifications(created_at DESC);
```

**期待される効果:**
- 資格検索機能: **40-60%高速化**
- 資格一覧のソート: **20-30%高速化**

### 優先度: 低 🟢

大量データになった場合のみ：

```sql
-- 部分一致検索用（GINインデックス）
CREATE INDEX idx_certifications_name_gin
ON certifications USING gin(name gin_trgm_ops);

CREATE INDEX idx_question_sets_name_gin
ON question_sets USING gin(name gin_trgm_ops);

CREATE INDEX idx_questions_text_gin
ON questions USING gin(question_text gin_trgm_ops);
```

**注**: `pg_trgm` 拡張が必要

## Supabaseでのインデックス作成方法

### 方法1: Supabase SQL Editor（推奨）

1. Supabase Dashboard を開く
2. 左メニューから **SQL Editor** を選択
3. **New Query** をクリック
4. 以下のSQLをコピー＆ペースト
5. **Run** をクリック

### 方法2: Supabase Migration

```bash
# マイグレーションファイルを作成
supabase migration new add_performance_indexes

# ファイルにSQLを記述
# supabase/migrations/XXXXXX_add_performance_indexes.sql

# マイグレーションを適用
supabase db push
```

## 推奨インデックス作成SQL（一括実行）

```sql
-- ===========================================
-- Birgerik Core パフォーマンスインデックス
-- 優先度: 高 - 即座に実行推奨
-- ===========================================

-- Question Sets
CREATE INDEX IF NOT EXISTS idx_question_sets_certification_id
ON question_sets(certification_id);

CREATE INDEX IF NOT EXISTS idx_question_sets_cert_name
ON question_sets(certification_id, name);

CREATE INDEX IF NOT EXISTS idx_question_sets_created_at
ON question_sets(created_at DESC);

-- Questions
CREATE INDEX IF NOT EXISTS idx_questions_question_set_id
ON questions(question_set_id);

CREATE INDEX IF NOT EXISTS idx_questions_set_order
ON questions(question_set_id, order_index);

CREATE INDEX IF NOT EXISTS idx_questions_created_at
ON questions(created_at DESC);

-- Choices
CREATE INDEX IF NOT EXISTS idx_choices_question_id
ON choices(question_id);

CREATE INDEX IF NOT EXISTS idx_choices_question_order
ON choices(question_id, order_index);

-- ===========================================
-- 優先度: 中 - 必要に応じて実行
-- ===========================================

-- Certifications
CREATE INDEX IF NOT EXISTS idx_certifications_name
ON certifications(name);

CREATE INDEX IF NOT EXISTS idx_certifications_created_at
ON certifications(created_at DESC);

-- インデックス作成完了
-- 以下のクエリで確認:
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## パフォーマンス測定

### インデックス作成前の測定

```sql
-- 実行時間を測定
EXPLAIN ANALYZE
SELECT * FROM question_sets
WHERE certification_id = 'some-uuid'
ORDER BY name;
```

### インデックス作成後の測定

同じクエリを再実行して比較：
- **Execution Time** が大幅に減少しているはず
- **Seq Scan** → **Index Scan** に変わっているはず

### 期待される改善

| クエリ | 作成前 | 作成後 | 改善率 |
|--------|--------|--------|--------|
| 資格別問題集取得 | 100ms | 20ms | 80% |
| 問題集の問題一覧 | 150ms | 30ms | 80% |
| 問題詳細（選択肢含む） | 50ms | 20ms | 60% |
| 学習データ全体 | 500ms | 150ms | 70% |

## N+1クエリ問題の最適化

現在、以下の箇所でN+1クエリが発生しています：

### 問題箇所

**`src/lib/database/study.ts`** - `getCertificationsWithQuestionSets()`

```typescript
// ❌ 現在: N+1クエリ
const certificationsWithSets = await Promise.all(
  certifications.map(async (cert) => {
    // 各資格ごとにクエリ実行（N回）
    const { data: questionSets } = await supabase
      .from('question_sets')
      .select('...')
      .eq('certification_id', cert.id)

    // 各問題集ごとにクエリ実行（さらにN回）
    const questionSetsWithCount = await Promise.all(
      questionSets.map(async (set) => {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact' })
          .eq('question_set_id', set.id)
      })
    )
  })
)
```

### 最適化案

**Phase 4で実装予定** - 単一クエリでの取得:

```typescript
// ✅ 最適化後: 単一クエリ
const { data } = await supabase
  .from('certifications')
  .select(`
    *,
    question_sets (
      *,
      questions (count)
    )
  `)
```

## モニタリング

### 1. Supabase Performance Insights

- Dashboard → **Database** → **Query Performance**
- スロークエリの確認
- インデックスの使用状況

### 2. アプリケーションログ

開発環境で実行時間を測定：

```typescript
console.time('getCertifications')
const result = await getCertifications()
console.timeEnd('getCertifications')
```

### 3. Next.js Speed Insights

```bash
# Vercel Speed Insightsを有効化
# vercel.json
{
  "analytics": true
}
```

## メンテナンス

### インデックスの再構築（月次）

```sql
REINDEX TABLE question_sets;
REINDEX TABLE questions;
REINDEX TABLE choices;
```

### 不要なインデックスの削除

```sql
-- 使用されていないインデックスを確認
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';

-- 不要なインデックスを削除
DROP INDEX IF EXISTS index_name;
```

## まとめ

### 即座に実行すべきアクション

1. ✅ **優先度: 高** のインデックスをすべて作成
2. ✅ パフォーマンス測定を実施
3. ✅ N+1クエリの最適化（次のステップ）

### 期待される全体的な改善

- **API レスポンス時間**: 平均 50-70% 高速化
- **データベース負荷**: 60-80% 削減
- **同時接続数**: 2-3倍に向上

### 次のステップ

Phase 4の続き:
- N+1クエリの最適化実装
- レスポンス圧縮の確認
- パフォーマンスモニタリング設定
