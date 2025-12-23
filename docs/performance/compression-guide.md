# レスポンス圧縮ガイド

## 概要

Next.js（Vercel）は自動的にレスポンスを圧縮しますが、適切に設定されているか確認する必要があります。

## Next.jsの自動圧縮

Next.js 15では、以下が自動的に圧縮されます：

### 本番環境（Vercel）
- ✅ **Gzip圧縮**: デフォルトで有効
- ✅ **Brotli圧縮**: デフォルトで有効（Gzipより効率的）
- ✅ **JSON APIレスポンス**: 自動圧縮
- ✅ **静的ファイル**: 自動圧縮

### 開発環境
- ❌ **圧縮なし**: 開発環境では圧縮は無効
- 📝 本番ビルドでテストする必要あり

## 圧縮の確認方法

### 方法1: curlコマンド

```bash
# Gzip圧縮を確認
curl -H "Accept-Encoding: gzip" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -I http://localhost:3000/api/v1/certifications

# レスポンスヘッダーに以下があればOK
# Content-Encoding: gzip
```

### 方法2: ブラウザ開発者ツール

1. Chrome DevToolsを開く（F12）
2. Networkタブを選択
3. APIリクエストをクリック
4. Headersタブで確認：
   - `Content-Encoding: gzip` または `br` (brotli)
   - `Content-Length`: 圧縮後のサイズ
   - 元のサイズと比較

### 方法3: テストスクリプト

```bash
# 圧縮テストスクリプトを実行
chmod +x scripts/test-compression.sh
./scripts/test-compression.sh
```

## 期待される圧縮率

| データタイプ | 元のサイズ | 圧縮後 | 圧縮率 |
|-------------|-----------|--------|--------|
| JSON (小) | 1 KB | 0.3 KB | 70% |
| JSON (中) | 10 KB | 2 KB | 80% |
| JSON (大) | 100 KB | 15 KB | 85% |
| 学習データ | 50 KB | 8 KB | 84% |

## Next.js設定（オプション）

`next.config.js`で圧縮をカスタマイズできます：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 圧縮設定（デフォルトで有効）
  compress: true,

  // レスポンスヘッダーのカスタマイズ
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Vercel固有の最適化

Vercelでは追加の最適化が自動適用されます：

### Edge Network
- 🌍 **グローバルCDN**: 世界中のエッジロケーション
- ⚡ **Edge Caching**: CDNレベルでのキャッシュ
- 🔄 **Automatic Revalidation**: キャッシュの自動更新

### 圧縮アルゴリズム
- **Brotli優先**: 対応ブラウザには自動的にBrotli
- **Gzipフォールバック**: 古いブラウザにはGzip
- **動的圧縮**: ペイロードサイズに応じて最適化

## パフォーマンスチェックリスト

### 開発環境
- [ ] 本番ビルドで圧縮が有効か確認: `npm run build && npm start`
- [ ] レスポンスヘッダーに `Content-Encoding` があるか確認
- [ ] 大きなペイロード（>1KB）で圧縮率をテスト

### 本番環境（Vercel）
- [ ] 本番URLで圧縮が有効か確認
- [ ] Brotli圧縮が使われているか確認（最新ブラウザ）
- [ ] Edge Networkからのレスポンスか確認（`x-vercel-cache`ヘッダー）
- [ ] レスポンスタイムを測定（50ms以下が理想）

## トラブルシューティング

### 圧縮が効かない場合

**症状**: `Content-Encoding`ヘッダーがない

**原因と対処**:

1. **開発環境で確認している**
   ```bash
   # 本番ビルドでテスト
   npm run build
   npm start
   ```

2. **レスポンスが小さすぎる**
   - Next.jsは1KB未満のレスポンスは圧縮しない
   - 大きなデータセットでテスト

3. **Accept-Encodingヘッダーがない**
   ```bash
   # ヘッダーを追加
   curl -H "Accept-Encoding: gzip, deflate, br" ...
   ```

### Vercelでのデバッグ

```bash
# Vercel CLI でローカル本番環境をテスト
vercel dev --prod
```

## 圧縮テストスクリプト

`scripts/test-compression.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
TOKEN="your-token-here"

echo "=== レスポンス圧縮テスト ==="

# 圧縮なしのサイズ
echo "圧縮なしのサイズ:"
curl -s -w "%{size_download} bytes\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/certifications" \
  -o /dev/null

# Gzip圧縮のサイズ
echo "Gzip圧縮のサイズ:"
curl -s -w "%{size_download} bytes\n" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Encoding: gzip" \
  --compressed \
  "$BASE_URL/certifications" \
  -o /dev/null

# ヘッダー確認
echo -e "\nレスポンスヘッダー:"
curl -I \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Encoding: gzip, br" \
  "$BASE_URL/certifications"
```

## まとめ

### 自動的に有効なもの
- ✅ Next.js/Vercelの自動圧縮
- ✅ Gzip/Brotli圧縮
- ✅ 本番環境でのEdge Caching

### 手動で確認すべきこと
- ⚠️ 本番ビルドでの圧縮動作
- ⚠️ 圧縮率（目標: 70-85%）
- ⚠️ レスポンスタイム（目標: <100ms）

### 期待される効果
- 📉 **帯域幅**: 70-85%削減
- ⚡ **読み込み時間**: 50-70%高速化
- 💰 **コスト**: データ転送量削減

Next.js/Vercelは既に最適化されているため、追加設定は通常不要です。
