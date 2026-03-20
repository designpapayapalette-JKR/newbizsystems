import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  // If already in an org, go to dashboard
  const { data: member } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (member) {
    // Update current_org_id if somehow it's missing
    await supabase
      .from("profiles")
      .update({ current_org_id: member.organization_id })
      .eq("id", user.id);
    redirect("/ERP/dashboard");
  }

  // Check for a pending invite for this user's email — redirect them to accept it
  const { data: invite } = await supabase
    .from("org_invites")
    .select("token")
    .eq("email", user.email ?? "")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (invite?.token) {
    redirect(`/invite/${invite.token}`);
  }

  // Genuine new user with no invite — show the create org form
  return <OnboardingForm />;
}
