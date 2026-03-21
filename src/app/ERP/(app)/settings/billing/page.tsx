import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrgSubscription, getPlans, getOrgUsage } from "@/actions/subscriptions";
import { BillingPanel } from "@/components/settings/BillingPanel";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const orgId = profile.current_org_id;

  // Check role — only owner/admin can see billing
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member || member.role === "member") {
    return (
      <div className="max-w-lg">
        <h2 className="text-xl font-semibold mb-2">Billing &amp; Subscription</h2>
        <p className="text-sm text-muted-foreground">Only the organization owner or admin can manage billing.</p>
      </div>
    );
  }

  const [subscription, plans, usage] = await Promise.all([
    getOrgSubscription(orgId),
    getPlans(),
    getOrgUsage(orgId),
  ]);

  return <BillingPanel subscription={subscription} plans={plans} usage={usage} orgId={orgId} />;
}
