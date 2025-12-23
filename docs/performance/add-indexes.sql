-- ===========================================
-- Birgerik Core - パフォーマンスインデックス
-- ===========================================
-- このSQLをSupabase SQL Editorで実行してください
--
-- 実行方法:
-- 1. Supabase Dashboard を開く
-- 2. 左メニュー → SQL Editor
-- 3. New Query
-- 4. このファイルの内容をコピー＆ペースト
-- 5. Run をクリック
-- ===========================================

-- 既存のインデックスを確認
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('certifications', 'question_sets', 'questions', 'choices')
ORDER BY tablename, indexname;

-- ===========================================
-- 優先度: 高 🔴
-- これらは即座に作成すべきインデックス
-- ===========================================

-- Question Sets テーブル
-- certification_id でのフィルタリングを高速化（最重要）
CREATE INDEX IF NOT EXISTS idx_question_sets_certification_id
ON question_sets(certification_id);

-- certification_id + name での複合インデックス
CREATE INDEX IF NOT EXISTS idx_question_sets_cert_name
ON question_sets(certification_id, name);

-- created_at でのソートを高速化
CREATE INDEX IF NOT EXISTS idx_question_sets_created_at
ON question_sets(created_at DESC);

-- Questions テーブル
-- question_set_id でのフィルタリングを高速化（最重要）
CREATE INDEX IF NOT EXISTS idx_questions_question_set_id
ON questions(question_set_id);

-- question_set_id + order_index での複合インデックス
CREATE INDEX IF NOT EXISTS idx_questions_set_order
ON questions(question_set_id, order_index);

-- created_at でのソートを高速化
CREATE INDEX IF NOT EXISTS idx_questions_created_at
ON questions(created_at DESC);

-- Choices テーブル
-- question_id でのフィルタリングを高速化（最重要）
CREATE INDEX IF NOT EXISTS idx_choices_question_id
ON choices(question_id);

-- question_id + order_index での複合インデックス
CREATE INDEX IF NOT EXISTS idx_choices_question_order
ON choices(question_id, order_index);

-- ===========================================
-- 優先度: 中 🟡
-- パフォーマンス問題が発生した場合に作成
-- ===========================================

-- Certifications テーブル
-- name での検索を高速化
CREATE INDEX IF NOT EXISTS idx_certifications_name
ON certifications(name);

-- created_at でのソートを高速化
CREATE INDEX IF NOT EXISTS idx_certifications_created_at
ON certifications(created_at DESC);

-- ===========================================
-- インデックス作成完了の確認
-- ===========================================

-- 作成されたインデックスを確認
SELECT
    relname AS tablename,
    indexrelname AS indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND relname IN ('certifications', 'question_sets', 'questions', 'choices')
ORDER BY relname, indexrelname;

-- テーブルサイズとインデックスサイズの確認
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('certifications', 'question_sets', 'questions', 'choices')
ORDER BY tablename;

-- ===========================================
-- パフォーマンステスト用クエリ
-- ===========================================

-- インデックスが使われているか確認
EXPLAIN ANALYZE
SELECT *
FROM question_sets
WHERE certification_id = (SELECT id FROM certifications LIMIT 1)
ORDER BY name;

-- 複合インデックスの効果を確認
EXPLAIN ANALYZE
SELECT *
FROM questions
WHERE question_set_id = (SELECT id FROM question_sets LIMIT 1)
ORDER BY order_index;

-- 選択肢取得のインデックス効果を確認
EXPLAIN ANALYZE
SELECT *
FROM choices
WHERE question_id = (SELECT id FROM questions LIMIT 1)
ORDER BY order_index;

-- ===========================================
-- 完了メッセージ
-- ===========================================

SELECT '✅ インデックス作成完了！パフォーマンスが大幅に向上します。' AS status;
