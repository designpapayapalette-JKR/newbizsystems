"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";
import type { Role } from "@/types";

export async function inviteTeamMember(email: string, role: Role = "member") {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();

  // Generate a secure random token
  const tokenBytes = new Uint8Array(24);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("org_invites").insert({
    organization_id: orgId,
    email,
    role,
    invited_by: userId,
    token,
    expires_at,
  });

  if (error) throw error;
  revalidatePath("/CRM/settings/team");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return { token, inviteUrl: `${appUrl}/invite/${token}` };
}

export async function getPendingInvites(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_invites")
    .select("*")
    .eq("organization_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function revokeInvite(inviteId: string) {
  const supabase = await createClient();
  await supabase.from("org_invites").delete().eq("id", inviteId);
  revalidatePath("/CRM/settings/team");
}

export async function acceptInvite(token: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: invite, error } = await supabase
    .from("org_invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (error || !invite) throw new Error("Invalid or expired invite");
  if (new Date(invite.expires_at) < new Date()) throw new Error("Invite has expired");

  // Check if already a member
  const { data: existing } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("organization_members").insert({
      organization_id: invite.organization_id,
      user_id: user.id,
      role: invite.role,
      invited_by: invite.invited_by,
    });
  }

  await supabase.from("org_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  // Upsert profile — handles both new users (no row yet) and existing users
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | undefined;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      current_org_id: invite.organization_id,
      ...(fullName ? { full_name: fullName } : {}),
    },
    { onConflict: "id" }
  );

  return invite.organization_id;
}

export async function updateMemberRole(orgId: string, userId: string, role: Role) {
  const supabase = await createClient();
  await supabase.from("organization_members").update({ role }).eq("organization_id", orgId).eq("user_id", userId);
  revalidatePath("/CRM/settings/team");
}

export async function removeMember(orgId: string, userId: string) {
  const supabase = await createClient();
  await supabase.from("organization_members").delete().eq("organization_id", orgId).eq("user_id", userId);
  revalidatePath("/CRM/settings/team");
}

export async function getTeamMembers(orgId: string) {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .order("joined_at");
  if (error) throw error;
  if (!members?.length) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  return members.map((m) => ({ ...m, profile: profileMap[m.user_id] ?? null }));
}

export async function getOrgRole(userId: string, orgId: string): Promise<Role> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();
  return (data?.role as Role) ?? "member";
}

export async function assignTask(data: {
  title: string;
  body?: string;
  assigned_to: string;
  lead_id?: string;
  due_at?: string;
  organization_id: string;
}) {
  const supabase = await createClient();
  const { userId } = await getOrgId();

  const { error } = await supabase.from("activities").insert({
    type: "task",
    title: data.title,
    body: data.body ?? null,
    assigned_to: data.assigned_to,
    lead_id: data.lead_id ?? null,
    organization_id: data.organization_id,
    user_id: userId,
    occurred_at: data.due_at ?? new Date().toISOString(),
    outcome: "pending",
  });

  if (error) throw error;
  revalidatePath("/CRM/tasks");
  revalidatePath("/CRM/settings/team");
}
