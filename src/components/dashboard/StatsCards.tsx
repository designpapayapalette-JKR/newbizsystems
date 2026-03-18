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
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.bg} mb-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
