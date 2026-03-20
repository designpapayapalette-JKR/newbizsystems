import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";
import type { Activity } from "@/types";

const typeColors: Record<string, string> = {
  call: "info",
  email: "warning",
  whatsapp: "success",
  sms: "secondary",
  note: "outline",
  meeting: "default",
  task: "secondary",
};

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No activities logged yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <Badge variant={(typeColors[a.type] as any) ?? "outline"} className="mt-0.5 shrink-0 capitalize text-xs">
                  {a.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {(a as any).lead ? (
                      <Link href={`/ERP/leads/${(a as any).lead.id}`} className="font-medium hover:text-primary">
                        {(a as any).lead.name}
                      </Link>
                    ) : "Unknown lead"}
                    {a.title && <span className="text-muted-foreground"> — {a.title}</span>}
                  </p>
                  {a.body && <p className="text-xs text-muted-foreground truncate">{a.body}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatRelative(a.occurred_at)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
