export function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-4 animate-pulse"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gray-600 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded-lg w-1/3" />
              </div>
              <div className="h-6 bg-gray-600 rounded w-16" />
            </div>
            <div className="ml-8 space-y-2">
              <div className="h-3 bg-gray-600 rounded w-2/3" />
              <div className="h-2 bg-gray-600 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
