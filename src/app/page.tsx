import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Supabase接続テスト
  const { data, error } = await supabase.from('certifications').select('count')
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Birgerik</h1>
        <p className="text-xl text-gray-600">資格取得支援アプリケーション</p>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="font-mono text-sm">
            Supabase接続状態: {error ? '❌ 未接続' : '✅ 接続成功'}
          </p>
          {error && (
            <p className="text-red-600 text-xs mt-2">
              エラー: テーブルがまだ作成されていません（正常）
            </p>
          )}
        </div>
      </div>
    </main>
  )
}