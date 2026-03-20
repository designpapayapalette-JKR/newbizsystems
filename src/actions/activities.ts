"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";
import type { ActivityType } from "@/types";

export interface ActivityFormData {
  type: ActivityType;
  title?: string;
  body?: string;
  outcome?: string;
  duration_mins?: number;
  occurred_at?: string;
}

export interface ActivityDirectData {
  lead_id: string;
  organization_id: string;
  type: ActivityType;
  title?: string;
  body?: string;
  outcome?: string;
  duration_mins?: number;
  occurred_at?: string;
}

export async function logActivity(
  leadIdOrData: string | ActivityDirectData,
  data?: ActivityFormData
) {
  const supabase = await createClient();

  if (typeof leadIdOrData === "string") {
    // Original signature: logActivity(leadId, data)
    const leadId = leadIdOrData;
    const { orgId, userId } = await getOrgId();

    const { error } = await supabase.from("activities").insert({
      ...data,
      lead_id: leadId,
      organization_id: orgId,
      user_id: userId,
    });
    if (error) throw error;

    await supabase.from("leads").update({ last_activity_at: new Date().toISOString() }).eq("id", leadId);

    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/CRM/dashboard");
  } else {
    // Direct signature: logActivity({ lead_id, organization_id, type, ... })
    const directData = leadIdOrData;
    const { userId } = await getOrgId();

    const { error } = await supabase.from("activities").insert({
      ...directData,
      user_id: userId,
    });
    if (error) throw error;

    await supabase.from("leads").update({ last_activity_at: new Date().toISOString() }).eq("id", directData.lead_id);

    revalidatePath(`/leads/${directData.lead_id}`);
    revalidatePath("/CRM/dashboard");
  }
}

export async function updateActivity(id: string, data: { outcome?: string; title?: string; body?: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("activities").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/CRM/tasks");
  revalidatePath("/CRM/leads");
}

export async function deleteActivity(id: string, leadId: string) {
  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", id);
  revalidatePath(`/leads/${leadId}`);
}

export async function getMyTasks(userId: string, orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*, lead:leads(id, name)")
    .eq("organization_id", orgId)
    .eq("type", "task")
    .eq("assigned_to", userId)
    .order("occurred_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOrgTasks(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*, lead:leads(id, name)")
    .eq("organization_id", orgId)
    .eq("type", "task")
    .order("occurred_at", { ascending: true });
  if (error) throw error;
  if (!data?.length) return [];

  const userIds = [...new Set(
    [...data.map((a) => a.assigned_to), ...data.map((a) => a.user_id)].filter(Boolean)
  )];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return data.map((a) => ({
    ...a,
    assigned_profile: a.assigned_to ? (profileMap[a.assigned_to] ?? null) : null,
    created_by_profile: a.user_id ? (profileMap[a.user_id] ?? null) : null,
  }));
}

export async function getActivities(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  if (!data?.length) return [];

  const userIds = [...new Set(data.map((a) => a.user_id).filter(Boolean))];
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return data.map((a) => ({ ...a, user_profile: a.user_id ? (profileMap[a.user_id] ?? null) : null }));
}
