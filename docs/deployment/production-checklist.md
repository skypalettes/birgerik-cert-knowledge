# 本番環境デプロイチェックリスト

このチェックリストを使用して、本番環境へのデプロイが安全かつ完全であることを確認してください。

## Phase 1-4: 実装完了の確認

### ✅ Phase 1: 共通データベース層
- [x] `src/lib/database/certifications.ts` 作成完了
- [x] `src/lib/database/question-sets.ts` 作成完了
- [x] `src/lib/database/questions.ts` 作成完了
- [x] `src/lib/database/study.ts` 作成完了
- [x] すべての関数にエラーハンドリング実装済み

### ✅ Phase 2: Server Actionsリファクタリング
- [x] Server Actionsが共通DBレイヤーを使用
- [x] コード重複が削減（51.7%削減）
- [x] TypeScriptコンパイル成功

### ✅ Phase 3: REST API実装
- [x] JWT認証実装済み
- [x] 認証エンドポイント（/auth/login, /auth/me）
- [x] CRUD API実装（certifications, question-sets, questions）
- [x] 学習用API実装（/study/*）
- [x] CORS設定完了
- [x] レスポンスキャッシュ実装（60秒）
- [x] OpenAPIドキュメント作成済み

### ✅ Phase 4: パフォーマンス最適化
- [x] データベースインデックス作成完了
- [x] N+1クエリ最適化完了
- [x] レスポンス圧縮確認済み
- [x] パフォーマンスモニタリングガイド作成済み

## Phase 5: デプロイ前チェック

### コード品質

- [ ] すべてのTypeScriptエラーが解消
  ```bash
  npx tsc --noEmit
  ```

- [ ] ESLintエラーが解消
  ```bash
  pnpm lint
  ```

- [ ] ビルドが成功
  ```bash
  pnpm build
  ```

- [ ] ローカルテストがすべて成功
  ```bash
  ./scripts/test-api.sh your-email password
  ```

### セキュリティ

- [ ] JWT_SECRETを安全なランダム文字列に変更
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] `.env.local` がgitignoreに含まれている
  ```bash
  grep ".env.local" .gitignore
  ```

- [ ] 本番用CORS_ORIGINを設定（`*`を避ける）

- [ ] Supabase RLSポリシーを確認

- [ ] APIキーや秘密情報がコードに含まれていない
  ```bash
  git grep -i "secret\|password\|key" | grep -v ".md\|.example"
  ```

### データベース

- [ ] Supabaseプロジェクトが本番用に設定済み

- [ ] データベースインデックスがすべて作成済み
  ```sql
  SELECT relname, indexrelname
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public';
  ```

- [ ] テーブルにデータが存在（テスト用でも可）

- [ ] バックアップ設定を確認（Supabaseは自動バックアップ）

### 環境変数

- [ ] すべての必須環境変数を準備
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `JWT_SECRET`
  - `CORS_ORIGIN`
  - `NEXT_PUBLIC_API_URL`

- [ ] 環境変数が本番用の値に設定済み

- [ ] JWT_SECRETが32文字以上

### ドキュメント

- [ ] README.mdが最新

- [ ] API ドキュメント（OpenAPI）が最新

- [ ] デプロイ手順が文書化済み

- [ ] トラブルシューティングガイドが準備済み

## デプロイ実行

### Vercel設定

- [ ] Vercelアカウント作成済み

- [ ] GitHubリポジトリと連携済み

- [ ] Vercelプロジェクト作成済み

- [ ] フレームワークプリセット: Next.js

- [ ] ビルドコマンド: `pnpm build`

- [ ] ルートディレクトリ: `./`

### 環境変数設定（Vercel）

Vercel Dashboard → Settings → Environment Variables:

- [ ] NEXT_PUBLIC_SUPABASE_URL（Production）
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY（Production）
- [ ] JWT_SECRET（Production）
- [ ] CORS_ORIGIN（Production）
- [ ] NEXT_PUBLIC_API_URL（Production）

### デプロイ実行

- [ ] 初回デプロイ実行
  ```bash
  vercel --prod
  ```

- [ ] デプロイが成功

- [ ] デプロイURLを確認
  ```bash
  vercel ls
  ```

## デプロイ後の確認

### 機能テスト

- [ ] ヘルスチェック成功
  ```bash
  curl https://your-domain.vercel.app
  ```

- [ ] ログインAPI動作確認
  ```bash
  curl -X POST https://your-domain.vercel.app/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
  ```

- [ ] 認証付きAPI動作確認
  ```bash
  curl https://your-domain.vercel.app/api/v1/certifications \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

- [ ] CRUD操作がすべて動作
  - [ ] GET（読み取り）
  - [ ] POST（作成）
  - [ ] PUT（更新）
  - [ ] DELETE（削除）

- [ ] 学習用API動作確認
  ```bash
  curl https://your-domain.vercel.app/api/v1/study/certifications \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

### パフォーマンステスト

- [ ] APIレスポンス時間が目標値以下（<100ms）
  ```bash
  curl -w "%{time_total}\n" -o /dev/null -s \
    -H "Authorization: Bearer TOKEN" \
    https://your-domain.vercel.app/api/v1/certifications
  ```

- [ ] キャッシュが動作
  - 1回目と2回目で速度差があるか確認

- [ ] 圧縮が有効
  ```bash
  curl -I -H "Accept-Encoding: gzip" \
    https://your-domain.vercel.app/api/v1/certifications
  # Content-Encoding: gzip または br を確認
  ```

### セキュリティテスト

- [ ] HTTPS強制が有効
  ```bash
  curl -I http://your-domain.vercel.app
  # 301 Redirect to https を確認
  ```

- [ ] CORS設定が正しい
  ```bash
  curl -I -H "Origin: https://unauthorized-domain.com" \
    https://your-domain.vercel.app/api/v1/certifications
  # Access-Control-Allow-Origin が期待通りか確認
  ```

- [ ] 認証なしアクセスがブロック
  ```bash
  curl https://your-domain.vercel.app/api/v1/certifications
  # 401 Unauthorized を確認
  ```

- [ ] 無効なトークンがブロック
  ```bash
  curl -H "Authorization: Bearer invalid-token" \
    https://your-domain.vercel.app/api/v1/certifications
  # 401 Unauthorized を確認
  ```

### モニタリング設定

- [ ] Vercel Analyticsを有効化（オプション）

- [ ] エラーログを確認
  ```bash
  vercel logs --follow
  ```

- [ ] Supabase Performance Insightsを確認

- [ ] アラート設定（オプション）

## カスタムドメイン設定（オプション）

- [ ] カスタムドメインを追加
  - Vercel Dashboard → Domains

- [ ] DNS設定完了
  ```
  Type: CNAME
  Name: api
  Value: cname.vercel-dns.com
  ```

- [ ] SSL証明書が発行済み（Vercelが自動発行）

- [ ] カスタムドメインでアクセス可能
  ```bash
  curl https://api.your-domain.com
  ```

## 継続的デプロイ設定

- [ ] GitHubとVercelの連携確認

- [ ] 本番ブランチを設定（mainまたは指定ブランチ）

- [ ] プレビューデプロイが動作
  - プルリクエスト作成時に自動デプロイされるか確認

- [ ] デプロイ通知設定（Slackなど、オプション）

## ドキュメント最終確認

- [ ] README.mdに本番URLを記載

- [ ] API ドキュメントのベースURLを更新

- [ ] チームメンバーに共有
  - デプロイURL
  - 環境変数の取得方法
  - モニタリングダッシュボード

## バックアップとロールバック

- [ ] 前バージョンのデプロイを保持
  ```bash
  vercel ls
  ```

- [ ] ロールバック手順を確認
  ```bash
  # 前のデプロイに戻す
  vercel rollback
  ```

- [ ] データベースバックアップを確認
  - Supabaseは自動バックアップ
  - 手動バックアップも可能

## 本番運用準備

### 監視項目

- [ ] APIレスポンス時間
- [ ] エラー率
- [ ] リクエスト数
- [ ] データベースパフォーマンス
- [ ] ディスク使用量

### アラート設定（推奨）

- [ ] エラー率 > 1%
- [ ] APIレスポンス時間 > 500ms
- [ ] データベースCPU > 80%
- [ ] データベース接続数 > 80%

### 定期メンテナンス

- [ ] 週次: パフォーマンスレポート確認
- [ ] 月次: データベースインデックス再構築
- [ ] 月次: 不要ログの削除
- [ ] 四半期: セキュリティレビュー

## トラブル対応

### 緊急連絡先

- [ ] Vercelサポート: https://vercel.com/support
- [ ] Supabaseサポート: https://supabase.com/support
- [ ] チーム内の連絡方法を確立

### ロールバック手順

```bash
# 1. 前のデプロイを確認
vercel ls

# 2. ロールバック実行
vercel rollback [deployment-url]

# 3. 動作確認
curl https://your-domain.vercel.app/api/v1/auth/me
```

## 完了確認

すべてのチェック項目が✓になったら、本番環境デプロイ完了です！

### 次のステップ

1. **Obsidianプラグイン開発**
   - 本番APIに接続
   - 認証フロー実装
   - データ同期機能実装

2. **ユーザーフィードバック収集**
   - ベータテスター募集
   - フィードバックフォーム設置

3. **継続的改善**
   - パフォーマンス監視
   - ユーザー要望対応
   - セキュリティアップデート

おめでとうございます！🎉
