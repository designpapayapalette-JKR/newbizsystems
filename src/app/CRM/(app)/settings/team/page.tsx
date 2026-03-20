import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeamMembers, getPendingInvites, getOrgRole } from "@/actions/team";
import { TeamManager } from "@/components/settings/TeamManager";

export default async function TeamSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const orgId = profile.current_org_id;

  const [members, pendingInvites, currentUserRole] = await Promise.all([
    getTeamMembers(orgId),
    getPendingInvites(orgId),
    getOrgRole(user.id, orgId),
  ]);

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("is_archived", false)
    .order("name");

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-1">Team</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your team members, roles, and task assignments.
      </p>
      <TeamManager
        members={members as any[]}
        pendingInvites={pendingInvites as any[]}
        orgId={orgId}
        currentUserId={user.id}
        currentUserRole={currentUserRole}
        leads={leads ?? []}
      />
    </div>
  );
}
