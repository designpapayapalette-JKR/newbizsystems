import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrgSettingsForm } from "@/components/settings/OrgSettingsForm";

export default async function OrganizationSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/onboarding");

  const { data: org } = await supabase.from("organizations").select("*").eq("id", profile.current_org_id).single();

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-6">Organization</h2>
      <OrgSettingsForm org={org as any} />
    </div>
  );
}
