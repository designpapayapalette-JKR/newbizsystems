import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, AlertCircle, Bell, IndianRupee, UserCheck } from "lucide-react";

interface StatsCardsProps {
  totalLeads: number;
  activeLeads: number;
  pipelineValue: number;
  overduePayments: number;
  dueThisMonth: number;
  pendingReminders: number;
}

export function StatsCards({ totalLeads, activeLeads, pipelineValue, overduePayments, dueThisMonth, pendingReminders }: StatsCardsProps) {
  const stats = [
    { label: "Total Leads", value: totalLeads.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Leads", value: activeLeads.toString(), icon: UserCheck, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Pipeline Value", value: formatCurrency(pipelineValue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Due This Month", value: formatCurrency(dueThisMonth), icon: IndianRupee, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Overdue Payments", value: overduePayments.toString(), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Pending Reminders", value: pendingReminders.toString(), icon: Bell, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden group">
            <CardContent className="p-5 flex flex-col items-start relative">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-4 transition-transform group-hover:scale-110`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
