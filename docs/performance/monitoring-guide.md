# パフォーマンスモニタリングガイド

## 概要

このドキュメントでは、Birgerik Core APIのパフォーマンスを継続的に監視し、問題を早期に発見する方法を説明します。

## モニタリング階層

```
┌─────────────────────────────────────┐
│  1. アプリケーションレベル          │
│  (Next.js, API endpoints)          │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  2. データベースレベル              │
│  (Supabase, PostgreSQL)            │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  3. インフラレベル                  │
│  (Vercel, CDN, Network)            │
└─────────────────────────────────────┘
```

## 1. アプリケーションレベル

### Next.js パフォーマンス計測

#### 開発環境での計測

```typescript
// src/lib/utils/performance.ts
export function measureTime<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  return fn().finally(() => {
    const duration = performance.now() - start
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
  })
}

// 使用例
import { measureTime } from '@/lib/utils/performance'

export async function getCertifications() {
  return measureTime('getCertifications', async () => {
    return await dbGetCertifications()
  })
}
```

#### APIエンドポイントの計測

```typescript
// src/lib/api/performance.ts
import { NextRequest, NextResponse } from 'next/server'

export function withPerformanceLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const start = Date.now()
    const endpoint = req.nextUrl.pathname

    try {
      const response = await handler(req)
      const duration = Date.now() - start

      // 本番環境ではログ送信サービスに送る
      console.log({
        endpoint,
        method: req.method,
        duration,
        status: response.status,
        timestamp: new Date().toISOString(),
      })

      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error({
        endpoint,
        method: req.method,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }
}
```

### 重要なメトリクス

| メトリクス | 目標値 | 警告閾値 |
|-----------|--------|----------|
| API レスポンス時間 | < 100ms | > 500ms |
| データベースクエリ時間 | < 50ms | > 200ms |
| キャッシュヒット率 | > 80% | < 50% |
| エラー率 | < 0.1% | > 1% |

## 2. データベースレベル

### Supabase Performance Insights

#### アクセス方法

1. Supabase Dashboard を開く
2. 左メニュー → **Database** → **Query Performance**
3. スロークエリを確認

#### 重要な指標

```sql
-- スロークエリの確認（実行時間 > 100ms）
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY total_time DESC
LIMIT 20;

-- インデックスの使用状況
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- テーブルサイズの推移
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### データベースアラート設定

Supabaseで以下のアラートを設定：

- ⚠️ CPU使用率 > 80%
- ⚠️ メモリ使用率 > 85%
- ⚠️ ディスク使用率 > 90%
- ⚠️ 接続数 > 80%（最大値に対して）

## 3. インフラレベル

### Vercel Analytics

#### 有効化

```bash
# package.jsonに追加
npm install @vercel/analytics

# _app.tsxまたはlayout.tsxに追加
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
```

#### モニタリング項目

- **Real User Monitoring (RUM)**
  - ページロード時間
  - Time to First Byte (TTFB)
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)

- **API Monitoring**
  - エンドポイント別レスポンス時間
  - エラー率
  - リクエスト数

### Vercel Speed Insights

```bash
npm install @vercel/speed-insights

# layout.tsxに追加
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  )
}
```

## パフォーマンステストスクリプト

### `scripts/performance-test.sh`

```bash
#!/bin/bash

# Birgerik Core パフォーマンステスト

BASE_URL="http://localhost:3000/api/v1"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <JWT_TOKEN>"
    exit 1
fi

echo "=== Birgerik Core パフォーマンステスト ==="
echo ""

# 1. 単一リクエストのレスポンス時間
echo "[1/5] 単一リクエストテスト"
for i in {1..5}; do
    echo -n "  試行 $i: "
    curl -w "%{time_total}s\n" -o /dev/null -s \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/certifications"
done
echo ""

# 2. キャッシュ効果の測定
echo "[2/5] キャッシュ効果テスト"
echo -n "  1回目（キャッシュなし）: "
curl -w "%{time_total}s\n" -o /dev/null -s \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/study/certifications"

sleep 1

echo -n "  2回目（キャッシュあり）: "
curl -w "%{time_total}s\n" -o /dev/null -s \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/study/certifications"
echo ""

# 3. 並列リクエストテスト
echo "[3/5] 並列リクエストテスト（10並列）"
START=$(date +%s.%N)
for i in {1..10}; do
    curl -s -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/certifications" &
done
wait
END=$(date +%s.%N)
DURATION=$(echo "$END - $START" | bc)
echo "  完了時間: ${DURATION}s"
echo ""

# 4. エンドポイント別パフォーマンス
echo "[4/5] エンドポイント別パフォーマンス"
endpoints=(
    "/auth/me"
    "/certifications"
    "/question-sets"
    "/questions"
    "/study/certifications"
)

for endpoint in "${endpoints[@]}"; do
    echo -n "  $endpoint: "
    curl -w "%{time_total}s\n" -o /dev/null -s \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL$endpoint"
done
echo ""

# 5. レスポンスサイズ測定
echo "[5/5] レスポンスサイズ測定"
for endpoint in "${endpoints[@]}"; do
    SIZE=$(curl -s -w "%{size_download}" -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL$endpoint")
    echo "  $endpoint: $SIZE bytes"
done
echo ""

echo "=== テスト完了 ==="
```

## 継続的モニタリング

### 日次チェックリスト

- [ ] Supabase Dashboard でスロークエリを確認
- [ ] Vercel Analytics でエラー率を確認
- [ ] API レスポンス時間の推移を確認
- [ ] データベースサイズの増加率を確認

### 週次チェックリスト

- [ ] パフォーマンステストスクリプトを実行
- [ ] インデックスの使用状況を確認
- [ ] キャッシュヒット率を確認
- [ ] 不要なログを削除

### 月次チェックリスト

- [ ] データベースインデックスの再構築
- [ ] パフォーマンスレポートを作成
- [ ] ボトルネックの特定と改善計画
- [ ] アラート閾値の見直し

## アラート設定

### 推奨アラート

#### 1. APIレスポンス時間

```typescript
// src/lib/monitoring/alerts.ts
export function checkResponseTime(endpoint: string, duration: number) {
  const THRESHOLD = 500 // ms

  if (duration > THRESHOLD) {
    // ログ送信サービスに送信（Sentry, DataDog等）
    console.error({
      type: 'SLOW_API_RESPONSE',
      endpoint,
      duration,
      threshold: THRESHOLD,
    })
  }
}
```

#### 2. エラー率

```typescript
export function trackError(endpoint: string, error: Error) {
  // エラーログを送信
  console.error({
    type: 'API_ERROR',
    endpoint,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })
}
```

#### 3. データベース接続

```sql
-- 接続数の監視
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- アラート: active_connections > 80
```

## トラブルシューティング

### 症状: APIレスポンスが遅い

**チェック項目**:
1. データベースクエリ時間
   ```sql
   SELECT * FROM pg_stat_statements
   WHERE query LIKE '%your_query%'
   ORDER BY mean_time DESC;
   ```

2. インデックスの有無
   ```sql
   SELECT * FROM pg_indexes
   WHERE tablename = 'your_table';
   ```

3. キャッシュの有効性
   - キャッシュヒット率を確認
   - キャッシュ時間を調整

### 症状: データベース接続エラー

**チェック項目**:
1. 接続プールの設定
2. Supabaseの接続数制限
3. 接続リークの確認

### 症状: メモリ使用量が多い

**チェック項目**:
1. Next.jsのメモリリーク
2. キャッシュサイズ
3. 大きなペイロードの処理

## ベストプラクティス

### Do's ✅

- レスポンス時間を常に測定
- スロークエリを定期的に確認
- インデックスを適切に配置
- キャッシュを効果的に使用
- エラーログを集約

### Don'ts ❌

- 本番環境で大量のログ出力
- 測定せずに最適化
- すべてのクエリにインデックス
- キャッシュの過度な依存
- アラートの無視

## まとめ

### 重要なメトリクス（優先順位順）

1. **API レスポンス時間**: < 100ms
2. **データベースクエリ時間**: < 50ms
3. **エラー率**: < 0.1%
4. **キャッシュヒット率**: > 80%
5. **同時接続数**: 制限の80%以下

### 推奨ツール

- **アプリケーション**: Vercel Analytics, Next.js Performance
- **データベース**: Supabase Performance Insights
- **エラー追跡**: Sentry (オプション)
- **ログ集約**: Vercel Logs, LogRocket (オプション)

### 次のステップ

1. パフォーマンステストスクリプトを定期実行
2. アラートを設定
3. ダッシュボードで継続的に監視
4. 月次でパフォーマンスレビュー
