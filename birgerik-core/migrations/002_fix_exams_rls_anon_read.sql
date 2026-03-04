-- ============================================================
-- Migration 002: exams テーブルに anon ロールの SELECT ポリシーを追加
-- ============================================================
-- 【問題】
--   001 の RLS 設定では authenticated と service_role のみ SELECT 可能。
--   birgerik-core の学習 API は ANON_KEY（anon ロール）で Supabase に接続するため
--   exams テーブルを参照できず、has_exam が常に false になっていた。
--
-- 【適用方法】
--   Supabase Dashboard > SQL Editor でこのファイルの内容を実行する
-- ============================================================

DROP POLICY IF EXISTS "anon_read" ON exams;
CREATE POLICY "anon_read" ON exams
  FOR SELECT
  TO anon
  USING (true);
