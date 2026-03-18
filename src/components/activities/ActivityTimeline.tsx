"use client";
import { Phone, Mail, MessageCircle, MessageSquare, FileText, Calendar, CheckSquare, Trash2, Bell, CheckCircle2 } from "lucide-react";
import { formatDateTime, formatRelative, isDue, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteActivity } from "@/actions/activities";
import { completeReminder, deleteReminder } from "@/actions/reminders";
import { useRouter } from "next/navigation";
import type { Activity, ActivityType } from "@/types";

const activityConfig: Record<ActivityType, { icon: any; color: string; label: string }> = {
  call:      { icon: Phone,        color: "text-blue-600 bg-blue-50",    label: "Call" },
  email:     { icon: Mail,         color: "text-orange-600 bg-orange-50", label: "Email" },
  whatsapp:  { icon: MessageCircle,color: "text-green-600 bg-green-50",  label: "WhatsApp" },
  sms:       { icon: MessageSquare,color: "text-purple-600 bg-purple-50", label: "SMS" },
  note:      { icon: FileText,     color: "text-gray-600 bg-gray-50",    label: "Note" },
  meeting:   { icon: Calendar,     color: "text-indigo-600 bg-indigo-50", label: "Meeting" },
  task:      { icon: CheckSquare,  color: "text-yellow-600 bg-yellow-50", label: "Task" },
};

interface ActivityTimelineProps {
  activities: Activity[];
  reminders?: any[];
}

type TimelineItem =
  | { kind: "activity"; date: string; data: Activity }
  | { kind: "reminder"; date: string; data: any };

export function ActivityTimeline({ activities, reminders = [] }: ActivityTimelineProps) {
  const router = useRouter();

  // Merge and sort newest first
  const items: TimelineItem[] = [
    ...activities.map((a): TimelineItem => ({ kind: "activity", date: a.occurred_at, data: a })),
    ...reminders.map((r): TimelineItem => ({ kind: "reminder", date: r.due_at, data: r })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No activities or reminders yet. Log your first interaction above.
      </p>
    );
  }

  async function handleDeleteActivity(id: string, leadId: string) {
    await deleteActivity(id, leadId);
    router.refresh();
  }

  async function handleCompleteReminder(id: string) {
    await completeReminder(id);
    router.refresh();
  }

  async function handleDeleteReminder(id: string) {
    await deleteReminder(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        if (item.kind === "activity") {
          const activity = item.data;
          const config = activityConfig[activity.type] ?? activityConfig.note;
          const Icon = config.icon;
          return (
            <div key={`act-${activity.id}`} className="flex gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">{config.label}</Badge>
                    {activity.title && <p className="text-sm font-medium">{activity.title}</p>}
                    {activity.body && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activity.body}</p>}
                    {activity.outcome && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Outcome:</span> {activity.outcome}
                      </p>
                    )}
                    {activity.duration_mins && (
                      <p className="text-xs text-muted-foreground">{activity.duration_mins} min</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDeleteActivity(activity.id, activity.lead_id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{formatDateTime(activity.occurred_at)}</span>
                  {(activity as any).user_profile?.full_name && (
                    <span className="text-xs text-muted-foreground">· {(activity as any).user_profile.full_name}</span>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Reminder item
        const reminder = item.data;
        const overdue = isDue(reminder.due_at) && !reminder.is_completed;
        return (
          <div key={`rem-${reminder.id}`} className="flex gap-3">
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              reminder.is_completed
                ? "text-green-600 bg-green-50"
                : overdue
                ? "text-red-600 bg-red-50"
                : "text-amber-600 bg-amber-50"
            )}>
              {reminder.is_completed
                ? <CheckCircle2 className="h-4 w-4" />
                : <Bell className="h-4 w-4" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        reminder.is_completed
                          ? "text-green-700 border-green-300"
                          : overdue
                          ? "text-red-700 border-red-300"
                          : "text-amber-700 border-amber-300"
                      )}
                    >
                      {reminder.is_completed ? "Reminder · Done" : overdue ? "Reminder · Overdue" : "Reminder"}
                    </Badge>
                  </div>
                  <p className={cn("text-sm font-medium", reminder.is_completed && "line-through text-muted-foreground")}>
                    {reminder.title}
                  </p>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!reminder.is_completed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-600 hover:text-green-700"
                      onClick={() => handleCompleteReminder(reminder.id)}
                      title="Mark complete"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    title="Delete reminder"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <span className={cn(
                "text-xs",
                overdue ? "text-red-600 font-medium" : "text-muted-foreground"
              )}>
                Due {formatRelative(reminder.due_at)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
