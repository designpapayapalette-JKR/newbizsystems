import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrgSettingsForm } from "@/components/settings/OrgSettingsForm";

export default async function OrganizationSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const { data: org } = await supabase.from("organizations").select("*").eq("id", profile?.current_org_id).maybeSingle();

  // Fetch most recent invoice for live template preview
  const { data: latestInvoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("organization_id", profile.current_org_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Organization</h2>
      <OrgSettingsForm org={org as any} previewInvoiceId={latestInvoice?.id ?? null} />
    </div>
  );
}
