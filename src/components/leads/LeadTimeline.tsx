"use client";
import { format } from "date-fns";
import { Mail, Phone, MessageSquare, CheckCircle2, UserPlus, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  title?: string;
  body?: string;
  occurred_at: string;
  user_profile?: { full_name: string; avatar_url?: string };
}

const ICONS: Record<string, any> = {
  email: Mail,
  phone: Phone,
  message: MessageSquare,
  task: CheckCircle2,
  note: FileText,
  event: Calendar,
  status_change: UserPlus,
};

const COLORS: Record<string, string> = {
  email: "bg-blue-100 text-blue-600",
  phone: "bg-green-100 text-green-600",
  message: "bg-purple-100 text-purple-600",
  task: "bg-emerald-100 text-emerald-600",
  note: "bg-amber-100 text-amber-600",
  event: "bg-indigo-100 text-indigo-600",
  status_change: "bg-slate-100 text-slate-600",
};

export function LeadTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl opacity-50">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
            <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">No interactions logged yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {activities.map((activity) => {
        const Icon = ICONS[activity.type] || FileText;
        const color = COLORS[activity.type] || "bg-gray-100 text-gray-600";
        
        return (
          <div key={activity.id} className="relative flex items-start gap-6 group pl-0">
            <div className={cn("mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ring-1 ring-slate-200 z-10", color)}>
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className="text-sm font-semibold text-slate-900 capitalize">
                  {activity.title || activity.type.replace("_", " ")}
                </h4>
                <time className="text-[10px] font-medium text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-full">
                  {format(new Date(activity.occurred_at), "MMM d, h:mm a")}
                </time>
              </div>
              
              {activity.body && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activity.body}
                  </p>
                </div>
              )}
              
              <div className="mt-2 flex items-center justify-between">
                {activity.user_profile && (
                  <span className="text-[10px] font-medium text-slate-400">
                    by {activity.user_profile.full_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
