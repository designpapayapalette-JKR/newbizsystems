import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { UpcomingReminders } from "@/components/dashboard/UpcomingReminders";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WinRateCard } from "@/components/dashboard/WinRateCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id, full_name").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const orgId = profile.current_org_id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const [leadsResult, stagesResult, remindersResult, paymentsResult, activitiesResult] = await Promise.all([
    supabase.from("leads").select("id, name, stage_id, deal_value, created_at").eq("organization_id", orgId).eq("is_archived", false),
    supabase.from("pipeline_stages").select("*").eq("organization_id", orgId).order("position"),
    supabase.from("reminders").select("*").eq("organization_id", orgId).eq("is_completed", false).order("due_at").limit(5),
    supabase.from("payments").select("amount, status, due_date, paid_at").eq("organization_id", orgId),
    supabase.from("activities").select("*").eq("organization_id", orgId).order("occurred_at", { ascending: false }).limit(8),
  ]);

  const leads = leadsResult.data ?? [];
  const stages = stagesResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const rawActivities = activitiesResult.data ?? [];
  const rawReminders = remindersResult.data ?? [];

  // Attach lead name to activities and reminders from the already-fetched leads array
  const leadsMap = Object.fromEntries(leads.map((l) => [l.id, l]));
  const activities = rawActivities.map((a) => ({ ...a, lead: leadsMap[a.lead_id] ?? null }));
  const reminders = rawReminders.map((r) => ({ ...r, lead: r.lead_id ? (leadsMap[r.lead_id] ?? null) : null }));

  const wonStageIds = stages.filter((s) => s.is_won).map((s) => s.id);
  const lostStageIds = stages.filter((s) => s.is_lost).map((s) => s.id);

  const wonLeads = leads.filter((l) => l.stage_id && wonStageIds.includes(l.stage_id));
  const lostLeads = leads.filter((l) => l.stage_id && lostStageIds.includes(l.stage_id));
  const activeLeads = leads.filter((l) => !wonStageIds.includes(l.stage_id ?? "") && !lostStageIds.includes(l.stage_id ?? ""));

  const closedLeads = wonLeads.length + lostLeads.length;
  const winRate = closedLeads > 0 ? Math.round((wonLeads.length / closedLeads) * 100) : 0;
  const avgDealSize = wonLeads.length > 0
    ? wonLeads.reduce((s, l) => s + (l.deal_value ?? 0), 0) / wonLeads.length
    : 0;
  const totalPipelineValue = activeLeads.reduce((sum, l) => sum + (l.deal_value ?? 0), 0);

  const overduePayments = payments.filter((p) => p.status === "overdue" || (p.status === "pending" && p.due_date && p.due_date < now.toISOString().slice(0, 10))).length;
  const dueThisMonth = payments.filter((p) => p.status === "pending" && p.due_date && p.due_date >= startOfMonth.slice(0, 10) && p.due_date <= endOfMonth.slice(0, 10)).reduce((sum, p) => sum + p.amount, 0);
  const wonThisMonth = payments.filter((p) => p.status === "paid" && p.paid_at && p.paid_at >= startOfMonth && p.paid_at <= endOfMonth).reduce((sum, p) => sum + p.amount, 0);

  const leadsByStage = stages.map((stage) => ({
    stage: stage.name,
    count: leads.filter((l) => l.stage_id === stage.id).length,
    color: stage.color,
    value: leads.filter((l) => l.stage_id === stage.id).reduce((sum, l) => sum + (l.deal_value ?? 0), 0),
  }));

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col h-full">
      <TopBar title={`Good ${getGreeting()}, ${firstName} 👋`} />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <StatsCards
          totalLeads={leads.length}
          activeLeads={activeLeads.length}
          pipelineValue={totalPipelineValue}
          overduePayments={overduePayments}
          dueThisMonth={dueThisMonth}
          pendingReminders={reminders.length}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <WinRateCard label="Win Rate" value={`${winRate}%`} sub={`${wonLeads.length} won / ${closedLeads} closed`} color="text-green-600" bg="bg-green-50" />
          <WinRateCard label="Avg Deal Size" value={avgDealSize > 0 ? `₹${Math.round(avgDealSize).toLocaleString("en-IN")}` : "—"} sub="of won deals" color="text-blue-600" bg="bg-blue-50" />
          <WinRateCard label="Won This Month" value={wonThisMonth > 0 ? `₹${Math.round(wonThisMonth).toLocaleString("en-IN")}` : "₹0"} sub="in payments received" color="text-indigo-600" bg="bg-indigo-50" />
          <WinRateCard label="Lost Leads" value={lostLeads.length.toString()} sub={`${closedLeads > 0 ? Math.round((lostLeads.length / closedLeads) * 100) : 0}% loss rate`} color="text-red-500" bg="bg-red-50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineChart data={leadsByStage} />
          <UpcomingReminders reminders={reminders as any[]} />
        </div>
        <RecentActivity activities={activities as any[]} />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
