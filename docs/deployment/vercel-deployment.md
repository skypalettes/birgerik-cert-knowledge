# Vercel 本番環境デプロイガイド

## 概要

このガイドでは、Birgerik CoreをVercelにデプロイする手順を説明します。

## 前提条件

- ✅ GitHubリポジトリにコードがプッシュ済み
- ✅ Vercelアカウント作成済み
- ✅ Supabaseプロジェクト作成済み
- ✅ データベースインデックス作成済み

## デプロイ手順

### 1. Vercelプロジェクトの作成

#### オプションA: Vercel CLI（推奨）

```bash
# Vercel CLIをインストール（初回のみ）
npm install -g vercel

# プロジェクトをデプロイ
cd /path/to/birgerik
vercel

# 質問に回答:
# - Set up and deploy? Yes
# - Which scope? (あなたのアカウント)
# - Link to existing project? No
# - What's your project's name? birgerik
# - In which directory is your code located? ./
# - Want to override the settings? No
```

#### オプションB: Vercel Dashboard

1. https://vercel.com にログイン
2. **New Project** をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
5. **Deploy** をクリック

### 2. 環境変数の設定

#### 必須の環境変数

Vercel Dashboard → Settings → Environment Variables で設定：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT認証（必ず強力なランダム文字列を使用）
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# CORS設定（本番ドメインを指定）
CORS_ORIGIN=https://your-domain.vercel.app

# API URL（本番URLに変更）
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

#### JWT_SECRETの生成

```bash
# 安全なランダム文字列を生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# または
openssl rand -hex 32
```

#### 環境変数の設定方法

**Vercel CLI:**
```bash
# 1つずつ設定
vercel env add JWT_SECRET

# または一括設定ファイルから
vercel env pull .env.production
```

**Vercel Dashboard:**
1. Project Settings → Environment Variables
2. **Add New** をクリック
3. 各変数を入力:
   - **Name**: `JWT_SECRET`
   - **Value**: (生成したランダム文字列)
   - **Environment**: Production (すべて選択可能)

### 3. デプロイの確認

#### デプロイ完了後

```bash
# デプロイURLを確認
vercel ls

# 最新のデプロイを開く
vercel open
```

#### ヘルスチェック

```bash
# APIが動作しているか確認
curl https://your-domain.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 4. カスタムドメインの設定（オプション）

#### Vercel Dashboardで設定

1. Project Settings → Domains
2. **Add** をクリック
3. ドメイン名を入力: `api.your-domain.com`
4. DNS設定:
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   ```

#### DNS設定の確認

```bash
# CNAMEレコードを確認
dig api.your-domain.com CNAME

# SSLが有効か確認
curl -I https://api.your-domain.com
```

## デプロイ後の設定

### 1. CORS設定の更新

本番環境で許可するオリジンを設定：

```bash
# Vercel環境変数を更新
vercel env add CORS_ORIGIN production

# 値: https://your-obsidian-plugin-domain.com
# または複数のドメイン（カンマ区切り）
```

### 2. Supabase設定の確認

#### APIのURL制限

Supabase Dashboard → Settings → API:
- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**: 必要に応じて追加

#### RLS（Row Level Security）の確認

本番環境ではRLSを有効化することを推奨：

```sql
-- 例: 認証済みユーザーのみアクセス可能
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read certifications"
ON certifications FOR SELECT
TO authenticated
USING (true);
```

### 3. パフォーマンスモニタリング

#### Vercel Analyticsの有効化

```bash
# パッケージをインストール
pnpm add @vercel/analytics @vercel/speed-insights

# コミット&プッシュ
git add package.json pnpm-lock.yaml
git commit -m "Add Vercel Analytics"
git push

# 自動的に再デプロイされます
```

**layout.tsx に追加:**
```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## トラブルシューティング

### デプロイが失敗する

**症状**: Build failed

**確認事項**:
1. ローカルでビルドが成功するか:
   ```bash
   pnpm build
   ```

2. 環境変数が設定されているか:
   ```bash
   vercel env ls
   ```

3. ビルドログを確認:
   - Vercel Dashboard → Deployments → 失敗したデプロイ → Build Logs

### APIエンドポイントが404

**症状**: `/api/v1/*` が404を返す

**原因と対処**:
1. デプロイが完了しているか確認
2. ファイルが正しくコミットされているか:
   ```bash
   git ls-files src/app/api/
   ```

3. Vercelのログを確認:
   ```bash
   vercel logs
   ```

### 環境変数が反映されない

**症状**: JWT_SECRET が undefined

**対処**:
1. 環境変数を再設定:
   ```bash
   vercel env rm JWT_SECRET production
   vercel env add JWT_SECRET production
   ```

2. 再デプロイ:
   ```bash
   vercel --prod
   ```

### CORSエラー

**症状**: Access-Control-Allow-Origin エラー

**対処**:
1. CORS_ORIGIN 環境変数を確認
2. ミドルウェアが正しく動作しているか確認
3. ブラウザのコンソールでエラー詳細を確認

## 本番環境チェックリスト

### デプロイ前

- [ ] すべてのテストが成功
- [ ] TypeScriptコンパイルが成功
- [ ] ローカルでビルドが成功
- [ ] 環境変数をすべて準備
- [ ] JWT_SECRETを安全な値に変更
- [ ] データベースインデックスを作成

### デプロイ後

- [ ] デプロイが成功
- [ ] ヘルスチェックが成功
- [ ] APIエンドポイントが動作
- [ ] 認証が正常に動作
- [ ] CORS設定が正しい
- [ ] カスタムドメインが動作（設定した場合）

### モニタリング設定

- [ ] Vercel Analyticsを有効化
- [ ] エラーログを確認
- [ ] パフォーマンスメトリクスを確認
- [ ] アラートを設定

## 継続的デプロイ（CI/CD）

### 自動デプロイの設定

Vercelは自動的にGitHubと連携します：

- **Production**: `main` ブランチへのプッシュ
- **Preview**: プルリクエスト作成時

#### デプロイブランチの変更

Vercel Dashboard → Settings → Git:
- **Production Branch**: `main` または任意のブランチ

### デプロイフック

特定のイベントで自動デプロイ:

```bash
# デプロイフックURLを取得
# Vercel Dashboard → Settings → Deploy Hooks

# 手動トリガー
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

## セキュリティ

### 推奨設定

1. **環境変数の保護**
   - JWT_SECRETは絶対にコードにコミットしない
   - `.env.local` は `.gitignore` に含める

2. **CORS設定**
   - 本番環境では `CORS_ORIGIN=*` を避ける
   - 特定のドメインのみ許可

3. **レート制限**
   - Vercel Edge Middlewareでレート制限を実装（オプション）

4. **HTTPS強制**
   - Vercelは自動的にHTTPSを有効化

## パフォーマンス最適化

### Edge Functions（オプション）

特定のAPIエンドポイントをEdge Functionとして実行:

```typescript
// src/app/api/v1/auth/login/route.ts
export const runtime = 'edge' // Edge Runtimeを使用
```

### キャッシュ設定

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/v1/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
    ]
  },
}
```

## まとめ

### デプロイコマンド一覧

```bash
# 初回デプロイ
vercel

# 本番デプロイ
vercel --prod

# 環境変数設定
vercel env add JWT_SECRET production

# ログ確認
vercel logs

# ドメイン確認
vercel domains ls
```

### 重要なURL

- **Vercel Dashboard**: https://vercel.com/dashboard
- **デプロイログ**: Dashboard → Deployments
- **環境変数**: Dashboard → Settings → Environment Variables
- **ドメイン設定**: Dashboard → Settings → Domains

### 次のステップ

1. Obsidianプラグインから本番APIに接続
2. パフォーマンスモニタリング
3. ユーザーフィードバック収集
4. 継続的な最適化
