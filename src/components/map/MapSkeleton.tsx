'use client';

export default function MapSkeleton({ height = '100%' }: { height?: string }) {
  return (
    <div 
      style={{ height }} 
      className="relative bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 rounded-lg animate-pulse"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4">
          <svg className="w-full h-full text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24">
            <path 
              className="opacity-75"
              fill="currentColor"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-blue-600 dark:text-blue-400 font-medium">Loading map...</span>
        </div>
      </div>
      
      {/* Fake map elements for visual interest */}
      <div className="absolute inset-4 border-2 border-dashed border-blue-300/50 dark:border-gray-600/50 rounded-lg" />
      
      {/* Fake grid lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full h-px bg-blue-400 dark:bg-gray-500"
            style={{ top: `${(i + 1) * 20}%` }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full w-px bg-blue-400 dark:bg-gray-500"
            style={{ left: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}
