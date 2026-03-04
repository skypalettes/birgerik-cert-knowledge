export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-teal-100 rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-10 w-28 bg-teal-100 rounded-full" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white border-2 border-teal-50 rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="flex gap-4 px-6 py-4 bg-teal-50/50 border-b-2 border-teal-50">
          {[40, 28, 20, 12].map((w, i) => (
            <div key={i} className={`h-4 w-${w} bg-teal-100 rounded-lg`} />
          ))}
        </div>
        {/* Data rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center px-6 py-4 border-b border-teal-50 last:border-0">
            <div className="h-4 flex-1 bg-gray-100 rounded-lg" />
            <div className="h-4 w-24 bg-gray-100 rounded-lg" />
            <div className="h-4 w-20 bg-gray-100 rounded-lg" />
            <div className="h-6 w-16 bg-gray-50 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
