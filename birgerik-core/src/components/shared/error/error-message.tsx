import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
}

export function ErrorMessage({ title = 'エラーが発生しました', message }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-bold text-red-700">{title}</p>
        <p className="text-sm text-red-600 mt-0.5">{message}</p>
      </div>
    </div>
  )
}
