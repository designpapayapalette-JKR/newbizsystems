import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Loading dashboard..." />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[88px] rounded-xl bg-muted animate-pulse border" />
          ))}
        </div>
        
        {/* Win Rate Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/60 animate-pulse border border-dashed" />
          ))}
        </div>

        {/* Charts and Reminders Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px] rounded-xl bg-muted animate-pulse border" />
          <div className="h-[300px] rounded-xl bg-muted animate-pulse border" />
        </div>

        {/* Recent Activity Skeleton */}
        <div className="h-[400px] rounded-xl bg-muted animate-pulse border" />
      </div>
    </div>
  );
}
