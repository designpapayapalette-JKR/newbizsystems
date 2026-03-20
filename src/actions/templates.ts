"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrg() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  return { supabase, user, orgId: profile!.current_org_id! };
}

export async function getEmailTemplates() {
  const { supabase, orgId } = await getOrg();
  const { data } = await supabase.from("email_templates").select("*").eq("organization_id", orgId).order("name");
  return data ?? [];
}

export async function createEmailTemplate(data: { name: string; subject: string; body: string; category?: string }) {
  const { supabase, user, orgId } = await getOrg();
  const { error } = await supabase.from("email_templates").insert({ ...data, organization_id: orgId, created_by: user.id });
  if (error) throw error;
  revalidatePath("/ERP/settings/templates");
}

export async function updateEmailTemplate(id: string, data: { name?: string; subject?: string; body?: string; category?: string }) {
  const { supabase } = await getOrg();
  const { error } = await supabase.from("email_templates").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/settings/templates");
}

export async function deleteEmailTemplate(id: string) {
  const { supabase } = await getOrg();
  await supabase.from("email_templates").delete().eq("id", id);
  revalidatePath("/ERP/settings/templates");
}
