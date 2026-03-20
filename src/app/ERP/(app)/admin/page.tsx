import { getAllOrgsWithSubscriptions, getAllPlans } from "@/actions/subscriptions";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";

export default async function AdminOverviewPage() {
  const [orgs, plans] = await Promise.all([
    getAllOrgsWithSubscriptions(),
    getAllPlans(),
  ]);

  const totalOrgs = orgs.length;
  const activeOrgs = orgs.filter((o) => {
    const sub = Array.isArray(o.subscription) ? o.subscription[0] : o.subscription;
    return sub?.status === "active" || sub?.status === "trialing";
  }).length;
  const paidOrgs = orgs.filter((o) => {
    const sub = Array.isArray(o.subscription) ? o.subscription[0] : o.subscription;
    const plan = Array.isArray(sub?.plan) ? sub.plan[0] : sub?.plan;
    return plan && plan.price_monthly > 0 && (sub?.status === "active" || sub?.status === "trialing");
  }).length;

  const stats = [
    { label: "Total Organizations", value: totalOrgs, icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: "Active Subscriptions", value: activeOrgs, icon: CreditCard, color: "text-green-600 bg-green-50" },
    { label: "Paid Plans", value: paidOrgs, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Plan Types", value: plans.length, icon: Users, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time view of all organizations and subscriptions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orgs */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Organizations</h2>
        </div>
        <div className="divide-y">
          {orgs.slice(0, 10).map((org) => {
            const sub = Array.isArray(org.subscription) ? org.subscription[0] : org.subscription;
            const plan = Array.isArray(sub?.plan) ? sub.plan[0] : sub?.plan;
            const memberCount = Array.isArray(org.member_count) ? org.member_count[0]?.count : org.member_count;
            return (
              <div key={org.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.slug} · {memberCount ?? 0} member(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {plan?.name ?? "Free"}
                  </span>
                  <StatusBadge status={sub?.status ?? "active"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
