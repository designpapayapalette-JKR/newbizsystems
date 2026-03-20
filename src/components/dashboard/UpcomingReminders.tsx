"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeReminder } from "@/actions/reminders";
import { formatRelative, isDue, cn } from "@/lib/utils";
import { Clock, CheckCircle2 } from "lucide-react";
import type { Reminder } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function UpcomingReminders({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();

  async function handleComplete(id: string) {
    await completeReminder(id);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Reminders</CardTitle>
          <Link href="/ERP/reminders" className="text-xs text-primary hover:underline">View all</Link>
        </div>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">All clear! No pending reminders.</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => {
              const due = isDue(r.due_at);
              return (
                <div key={r.id} className="flex items-start gap-2">
                  <Clock className={cn("h-4 w-4 mt-0.5 shrink-0", due ? "text-red-500" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className={cn("text-xs", due ? "text-red-600 font-medium" : "text-muted-foreground")}>
                      {formatRelative(r.due_at)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-green-600 hover:text-green-700" onClick={() => handleComplete(r.id)}>
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
