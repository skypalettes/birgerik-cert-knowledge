-- ============================================================
-- Migration 001: Add is_active to question_sets, create exams
-- ============================================================
-- Apply this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. question_sets に is_active カラムを追加
-- ============================================================
ALTER TABLE question_sets
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN question_sets.is_active IS '有効/無効フラグ。FALSE の場合は学習アプリに表示されない';

-- 既存レコードをすべて有効に設定（ADD COLUMN IF NOT EXISTS + DEFAULT TRUE で自動適用済み）


-- 2. exams テーブルを作成
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id     UUID        NOT NULL UNIQUE
                                  REFERENCES question_sets(id) ON DELETE CASCADE,
  question_count      INTEGER     NOT NULL CHECK (question_count > 0),
  time_limit_minutes  INTEGER     NOT NULL CHECK (time_limit_minutes > 0),
  passing_score       INTEGER     NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE exams IS '問題集に紐付く試験設定。1問題集につき1試験設定のみ（UNIQUE制約）';
COMMENT ON COLUMN exams.question_set_id     IS '対象の問題集 ID';
COMMENT ON COLUMN exams.question_count      IS '1回の試験で出題する問題数';
COMMENT ON COLUMN exams.time_limit_minutes  IS '制限時間（分）';
COMMENT ON COLUMN exams.passing_score       IS '合格スコア（0〜100 %）';

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exams_updated_at ON exams;
CREATE TRIGGER exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 3. RLS (Row Level Security) の設定
-- ============================================================
-- exams テーブルの RLS を有効化
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- サービスロール（管理者）は全操作可能
DROP POLICY IF EXISTS "service_role_all" ON exams;
CREATE POLICY "service_role_all" ON exams
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 認証済みユーザーは読み取りのみ（学習アプリ用）
DROP POLICY IF EXISTS "authenticated_read" ON exams;
CREATE POLICY "authenticated_read" ON exams
  FOR SELECT
  TO authenticated
  USING (true);


-- 4. インデックス
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_question_sets_is_active
  ON question_sets(is_active);

CREATE INDEX IF NOT EXISTS idx_exams_question_set_id
  ON exams(question_set_id);


-- ============================================================
-- 確認クエリ（実行後に結果を確認してください）
-- ============================================================
-- SELECT column_name, data_type, column_default, is_nullable
--   FROM information_schema.columns
--  WHERE table_name = 'question_sets'
--  ORDER BY ordinal_position;

-- SELECT * FROM exams LIMIT 5;
