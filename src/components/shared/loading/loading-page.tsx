import { Spinner } from './spinner'

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}