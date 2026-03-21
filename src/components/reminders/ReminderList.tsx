"use client";
import { completeReminder, deleteReminder } from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelative, isDue, cn } from "@/lib/utils";
import type { Reminder } from "@/types";
import { CheckCircle2, Clock, Trash2, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ReminderFormDialog } from "./ReminderFormDialog";

interface ReminderListProps {
  pending: Reminder[];
  completed: Reminder[];
}

function ReminderItem({ reminder, showComplete = true }: { reminder: Reminder; showComplete?: boolean }) {
  const router = useRouter();
  const due = isDue(reminder.due_at);

  async function handleComplete() {
    await completeReminder(reminder.id);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this reminder?")) return;
    await deleteReminder(reminder.id);
    router.refresh();
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border bg-white",
      due && !reminder.is_completed && "border-red-200 bg-red-50/50"
    )}>
      <div className="pt-0.5">
        {reminder.is_completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Clock className={cn("h-5 w-5", due ? "text-red-500" : "text-muted-foreground")} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", reminder.is_completed && "line-through text-muted-foreground")}>{reminder.title}</p>
        {reminder.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{reminder.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={cn("text-xs", due && !reminder.is_completed ? "text-red-600 font-medium" : "text-muted-foreground")}>
            {formatRelative(reminder.due_at)}
          </span>
          {(reminder as any).lead && (
            <Link href={`/ERP/leads/${(reminder as any).lead.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              {(reminder as any).lead.name}
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {showComplete && !reminder.is_completed && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={handleComplete} title="Mark complete">
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
        {!reminder.is_completed && (
          <ReminderFormDialog reminder={reminder} />
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete} title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ReminderList({ pending, completed }: ReminderListProps) {
  const today = pending.filter((r) => isDue(r.due_at));
  const upcoming = pending.filter((r) => !isDue(r.due_at));

  return (
    <div className="space-y-6">
      {today.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold">Overdue / Due Today</h3>
            <Badge variant="destructive">{today.length}</Badge>
          </div>
          <div className="space-y-2">
            {today.map((r) => <ReminderItem key={r.id} reminder={r} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcoming.map((r) => <ReminderItem key={r.id} reminder={r} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Completed</h3>
          <div className="space-y-2">
            {completed.slice(0, 10).map((r) => <ReminderItem key={r.id} reminder={r} showComplete={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}
