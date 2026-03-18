"use client";

import { OrgSubscription, SubscriptionPlan } from "@/actions/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, FileText, TrendingUp, Zap, Crown } from "lucide-react";

interface Props {
  subscription: OrgSubscription | null;
  plans: SubscriptionPlan[];
  usage: { leads: number; members: number; invoices: number };
  orgId: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
};

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const pct = limit == null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used} / {limit == null ? "∞" : limit}
        </span>
      </div>
      {limit != null && (
        <div className="h-2 rounded-full bg-gray-100">
          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function PlanIcon({ slug }: { slug: string }) {
  if (slug === "pro") return <Crown className="h-5 w-5 text-purple-500" />;
  if (slug === "growth") return <Zap className="h-5 w-5 text-blue-500" />;
  if (slug === "starter") return <TrendingUp className="h-5 w-5 text-green-500" />;
  return <FileText className="h-5 w-5 text-gray-400" />;
}

export function BillingPanel({ subscription, plans, usage }: Props) {
  const currentPlan = subscription?.plan;
  const activePlanSlug = currentPlan?.slug ?? "free";

  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;
  const effectiveStatus = isExpired ? "expired" : (subscription?.status ?? "active");

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Billing &amp; Subscription</h2>
        <p className="text-sm text-muted-foreground mt-1">Your current plan and usage. Contact support to upgrade your plan.</p>
      </div>

      {/* Current plan card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {currentPlan && <PlanIcon slug={currentPlan.slug} />}
              {currentPlan?.name ?? "Free"} Plan
            </CardTitle>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[effectiveStatus] ?? "bg-gray-100 text-gray-700"}`}>
              {effectiveStatus}
            </span>
          </div>
          <CardDescription>
            {currentPlan && currentPlan.price_monthly > 0
              ? `₹${currentPlan.price_monthly.toLocaleString("en-IN")}/month · ₹${currentPlan.price_yearly.toLocaleString("en-IN")}/year`
              : "Free forever"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expiresAt && (
            <p className={`text-sm ${isExpired ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
              {isExpired ? "Subscription expired on " : "Renews on "}
              {expiresAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          )}

          <div className="space-y-3">
            <UsageBar used={usage.leads} limit={currentPlan?.max_leads ?? 50} label="Leads" />
            <UsageBar used={usage.members} limit={currentPlan?.max_members ?? 1} label="Team members" />
            <UsageBar used={usage.invoices} limit={currentPlan?.max_invoices ?? 10} label="Invoices" />
          </div>

          {currentPlan?.features && currentPlan.features.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Included in your plan</p>
              <ul className="space-y-1">
                {currentPlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(isExpired || effectiveStatus === "past_due" || effectiveStatus === "cancelled") && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              Your subscription is {effectiveStatus}. Please contact your administrator or support to reactivate.
            </div>
          )}
        </CardContent>
      </Card>

      {/* All plans comparison */}
      <div>
        <h3 className="text-base font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.slug === activePlanSlug;
            return (
              <Card key={plan.id} className={`relative ${isCurrent ? "ring-2 ring-blue-500" : ""}`}>
                {isCurrent && (
                  <span className="absolute -top-2.5 left-4 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PlanIcon slug={plan.slug} />
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-gray-900">
                    {plan.price_monthly === 0 ? "Free" : `₹${plan.price_monthly.toLocaleString("en-IN")}/mo`}
                    {plan.price_yearly > 0 && (
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        or ₹{plan.price_yearly.toLocaleString("en-IN")}/yr
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Contact your super admin or support to switch to this plan.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        To upgrade, downgrade, or cancel your subscription, contact your platform administrator.
        Subscription changes are applied immediately.
      </p>
    </div>
  );
}
