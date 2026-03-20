import { TopBar } from "@/components/layout/TopBar";

export default function LeadsLoading() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Loading leads..." />
      
      {/* Filters Skeleton */}
      <div className="border-b px-4 py-3 flex items-center gap-2">
        <div className="h-9 w-[250px] bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Board/List Skeleton */}
      <div className="flex-1 p-4 flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-80 h-full flex flex-col gap-3 rounded-lg bg-muted/30 p-3 shrink-0">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
            
            {/* Cards */}
            <div className="h-28 bg-white border rounded-md shadow-sm p-3 flex flex-col gap-2">
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              <div className="mt-auto h-4 w-1/3 bg-muted animate-pulse rounded" />
            </div>
            
            <div className="h-28 bg-white border rounded-md shadow-sm p-3 flex flex-col gap-2">
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
              <div className="mt-auto h-4 w-1/4 bg-muted animate-pulse rounded" />
            </div>
            
             <div className="h-28 bg-white border rounded-md shadow-sm p-3 flex flex-col gap-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              <div className="mt-auto h-4 w-1/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
