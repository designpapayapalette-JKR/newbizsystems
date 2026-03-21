"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";

export async function getHrSettings() {
  const supabase = await createClient();
  const { orgId } = await getOrgId();
  
  const { data, error } = await supabase
    .from("hr_settings")
    .select("*")
    .eq("organization_id", orgId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // ignore no rows
  return data;
}

export async function updateHrSettings(data: any) {
  const supabase = await createClient();
  const { orgId } = await getOrgId();
  
  const { error } = await supabase
    .from("hr_settings")
    .upsert({ ...data, organization_id: orgId }, { onConflict: "organization_id" });

  if (error) throw error;
  revalidatePath("/ERP/hr/settings");
}

export async function getHrHolidays() {
  const supabase = await createClient();
  const { orgId } = await getOrgId();

  const { data, error } = await supabase
    .from("hr_holidays")
    .select("*")
    .eq("organization_id", orgId)
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addHrHoliday(data: { name: string; date: string; is_active?: boolean; type?: string }) {
  const supabase = await createClient();
  const { orgId } = await getOrgId();

  const { error } = await supabase
    .from("hr_holidays")
    .insert({ ...data, organization_id: orgId });

  if (error) throw error;
  revalidatePath("/ERP/hr/settings");
}

export async function updateHrHoliday(id: string, data: { name: string; date: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hr_holidays")
    .update(data)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/ERP/hr/settings");
}

export async function toggleHrHoliday(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hr_holidays")
    .update({ is_active })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/ERP/hr/settings");
}

export async function deleteHrHoliday(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hr_holidays")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/ERP/hr/settings");
}
