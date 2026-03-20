import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadSourceChart } from "@/components/reports/LeadSourceChart";
import { StagesFunnelChart } from "@/components/reports/StagesFunnelChart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const orgId = profile.current_org_id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Fetch all required data in parallel
  const [
    stagesResult,
    leadsResult,
    paymentsResult,
    topLeadsResult,
  ] = await Promise.all([
    supabase
      .from("pipeline_stages")
      .select("id, name, color, is_won, is_lost")
      .eq("organization_id", orgId)
      .order("position"),
    supabase
      .from("leads")
      .select("id, stage_id, deal_value, source, created_at")
      .eq("organization_id", orgId)
      .eq("is_archived", false),
    supabase
      .from("payments")
      .select("amount, status, paid_at, due_date")
      .eq("organization_id", orgId),
    supabase
      .from("leads")
      .select("id, name, deal_value, company")
      .eq("organization_id", orgId)
      .eq("is_archived", false)
      .not("deal_value", "is", null)
      .order("deal_value", { ascending: false })
      .limit(5),
  ]);

  const stages = stagesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const topLeads = topLeadsResult.data ?? [];

  const wonStageIds = stages.filter((s) => s.is_won).map((s) => s.id);
  const lostStageIds = stages.filter((s) => s.is_lost).map((s) => s.id);

  // Won leads this month
  const wonLeadsThisMonth = leads.filter(
    (l) =>
      l.stage_id &&
      wonStageIds.includes(l.stage_id) &&
      l.created_at >= startOfMonth &&
      l.created_at <= endOfMonth
  );
  const wonLeadsCount = wonLeadsThisMonth.length;
  const wonLeadsValue = wonLeadsThisMonth.reduce((sum, l) => sum + (l.deal_value ?? 0), 0);

  // Lost leads this month
  const lostLeadsCount = leads.filter(
    (l) =>
      l.stage_id &&
      lostStageIds.includes(l.stage_id) &&
      l.created_at >= startOfMonth &&
      l.created_at <= endOfMonth
  ).length;

  // Win rate
  const closedThisMonth = wonLeadsCount + lostLeadsCount;
  const winRate = closedThisMonth > 0 ? Math.round((wonLeadsCount / closedThisMonth) * 100) : 0;

  // Active leads by stage for funnel
  const activeLeads = leads.filter(
    (l) =>
      l.stage_id &&
      !wonStageIds.includes(l.stage_id) &&
      !lostStageIds.includes(l.stage_id)
  );

  const stagesFunnelData = stages
    .filter((s) => !s.is_won && !s.is_lost)
    .map((s) => ({
      stage: s.name,
      count: activeLeads.filter((l) => l.stage_id === s.id).length,
      color: s.color ?? "#6366f1",
    }));

  // Lead source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const lead of leads) {
    const src = lead.source ?? "unknown";
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
  }
  const sourceData = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source: source.replace(/_/g, " "), count }))
    .sort((a, b) => b.count - a.count);

  // Payments received this month
  const paymentsThisMonth = payments
    .filter(
      (p) =>
        p.status === "paid" &&
        p.paid_at &&
        p.paid_at >= startOfMonth &&
        p.paid_at <= endOfMonth
    )
    .reduce((sum, p) => sum + p.amount, 0);

  // Overdue payments
  const todayStr = now.toISOString().slice(0, 10);
  const overdueCount = payments.filter(
    (p) =>
      (p.status === "overdue" ||
        (p.status === "pending" && p.due_date && p.due_date < todayStr))
  ).length;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Reports & Analytics" />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Won This Month</p>
              <p className="text-2xl font-bold text-green-600">{wonLeadsCount}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(wonLeadsValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Lost This Month</p>
              <p className="text-2xl font-bold text-red-500">{lostLeadsCount}</p>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold text-blue-600">{winRate}%</p>
              <p className="text-xs text-muted-foreground">{closedThisMonth} closed this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Payments This Month</p>
              <p className="text-xl font-bold text-indigo-600">{formatCurrency(paymentsThisMonth)}</p>
              <p className="text-xs text-red-500">{overdueCount} overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active Leads by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <StagesFunnelChart data={stagesFunnelData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadSourceChart data={sourceData} />
            </CardContent>
          </Card>
        </div>

        {/* Top leads by deal value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 5 Leads by Deal Value</CardTitle>
          </CardHeader>
          <CardContent>
            {topLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads with deal values yet.</p>
            ) : (
              <div className="space-y-2">
                {topLeads.map((lead: any, i: number) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-green-700 text-sm">
                      {formatCurrency(lead.deal_value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
