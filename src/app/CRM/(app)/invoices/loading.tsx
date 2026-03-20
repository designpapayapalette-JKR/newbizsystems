import { TopBar } from "@/components/layout/TopBar";

export default function InvoicesLoading() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Loading invoices..." />
      
      {/* Controls Skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Table Skeleton */}
        <div className="border rounded-md">
          <div className="flex bg-muted/50 p-3 border-b">
            <div className="h-4 w-1/6 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded ml-4" />
            <div className="h-4 w-1/6 bg-muted animate-pulse rounded ml-auto" />
            <div className="h-4 w-1/6 bg-muted animate-pulse rounded ml-4" />
          </div>
          
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex p-4 border-b last:border-0 items-center">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded ml-4 font-medium" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full ml-auto" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded ml-6 text-right" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
