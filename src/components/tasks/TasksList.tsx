"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateActivity } from "@/actions/activities";
import { toast } from "sonner";
import { CheckCircle2, Circle, Calendar, Link as LinkIcon, Loader2, User } from "lucide-react";
import { formatRelative, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface Task {
  id: string;
  title: string | null;
  body: string | null;
  outcome: string | null;
  occurred_at: string;
  lead?: { id: string; name: string } | null;
  assigned_profile?: { full_name?: string | null } | null;
  created_by_profile?: { full_name?: string | null } | null;
}

export function TasksList({ tasks, done, showAssignee }: { tasks: Task[]; done?: boolean; showAssignee?: boolean }) {
  const router = useRouter();
  const [completing, setCompleting] = useState<string | null>(null);

  async function markDone(id: string) {
    setCompleting(id);
    try {
      await updateActivity(id, { outcome: "completed" });
      toast.success("Task marked complete");
      router.refresh();
    } catch { toast.error("Failed to update task"); }
    finally { setCompleting(null); }
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className={`bg-white border rounded-lg p-3 flex items-start gap-3 ${done ? "opacity-60" : ""}`}>
          <button
            onClick={() => !done && markDone(task.id)}
            disabled={done || completing === task.id}
            className="mt-0.5 flex-shrink-0"
          >
            {completing === task.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : done ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
              {task.title || "Untitled Task"}
            </p>
            {task.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.body}</p>}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatRelative(task.occurred_at)}
              </span>
              {task.lead && (
                <Link href={`/leads/${task.lead.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <LinkIcon className="h-3 w-3" />
                  {task.lead.name}
                </Link>
              )}
              {showAssignee && task.assigned_profile && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {task.assigned_profile.full_name ?? "Unassigned"}
                </span>
              )}
              {showAssignee && !task.assigned_profile && task.created_by_profile && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {task.created_by_profile.full_name ?? "Unknown"}
                </span>
              )}
            </div>
          </div>
          {showAssignee && task.assigned_profile && (
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {getInitials(task.assigned_profile.full_name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}
