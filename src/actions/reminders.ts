"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";

export interface ReminderFormData {
  title: string;
  description?: string;
  due_at: string;
  lead_id?: string;
}

export async function createReminder(data: ReminderFormData) {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();
  const { error } = await supabase.from("reminders").insert({ ...data, organization_id: orgId, user_id: userId });
  if (error) throw error;
  revalidatePath("/ERP/reminders");
  revalidatePath("/ERP/dashboard");
}

export async function completeReminder(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("reminders").select("lead_id").eq("id", id).maybeSingle();
  await supabase.from("reminders").update({ is_completed: true, completed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/ERP/reminders");
  revalidatePath("/ERP/dashboard");
  if (data?.lead_id) revalidatePath(`/ERP/leads/${data.lead_id}`);
}

export async function deleteReminder(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("reminders").select("lead_id").eq("id", id).maybeSingle();
  await supabase.from("reminders").delete().eq("id", id);
  revalidatePath("/ERP/reminders");
  if (data?.lead_id) revalidatePath(`/ERP/leads/${data.lead_id}`);
}

export async function updateReminder(id: string, data: Partial<ReminderFormData>) {
  const supabase = await createClient();
  await supabase.from("reminders").update(data).eq("id", id);
  revalidatePath("/ERP/reminders");
}

export async function getReminders(orgId: string, completed = false) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminders")
    .select(`*, lead:leads(id, name, company)`)
    .eq("organization_id", orgId)
    .eq("is_completed", completed)
    .order("due_at");
  if (error) throw error;
  return data;
}

export async function getLeadReminders(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("lead_id", leadId)
    .order("due_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
