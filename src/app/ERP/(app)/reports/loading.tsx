"use client";

export default function Loading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-100 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-gray-100 rounded-2xl border border-gray-100"></div>
        <div className="h-32 bg-gray-100 rounded-2xl border border-gray-100"></div>
        <div className="h-32 bg-gray-100 rounded-2xl border border-gray-100"></div>
      </div>

      {/* Content Area Skeleton */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
          <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
            <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-100 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-gray-100 rounded-md"></div>
                <div className="h-3 w-1/2 bg-gray-50 rounded-md"></div>
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
