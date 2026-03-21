import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeamMembers, getPendingInvites, getOrgRole } from "@/actions/team";
import { TeamManager } from "@/components/settings/TeamManager";

export default async function TeamSettingsPage() {
  redirect("/ERP/hr");
}
