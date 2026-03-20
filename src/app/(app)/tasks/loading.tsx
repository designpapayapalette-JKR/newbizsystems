import { TopBar } from "@/components/layout/TopBar";

export default function TasksLoading() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Loading tasks..." />
      
      {/* Controls Skeleton */}
      <div className="border-b px-4 py-3 flex gap-2">
        <div className="h-9 w-[200px] bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      </div>

      {/* List Skeleton */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-xl bg-card">
              <div className="w-5 h-5 rounded-md bg-muted animate-pulse mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
