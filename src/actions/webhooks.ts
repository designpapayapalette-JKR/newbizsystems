"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrg() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  if (!profile?.current_org_id) throw new Error("No organization assigned to this profile");
  return { supabase, user, orgId: profile.current_org_id };
}

export async function getWebhooks() {
  const { supabase, orgId } = await getOrg();
  const { data } = await supabase.from("webhooks").select("*").eq("organization_id", orgId).order("created_at", { ascending: false });
  return data ?? [];
}

export async function createWebhook(data: { name: string; url: string; events: string[]; secret?: string }) {
  const { supabase, orgId } = await getOrg();
  const { error } = await supabase.from("webhooks").insert({ ...data, organization_id: orgId });
  if (error) throw error;
  revalidatePath("/ERP/settings/webhooks");
}

export async function updateWebhook(id: string, data: Partial<{ name: string; url: string; events: string[]; is_active: boolean; secret: string }>) {
  const { supabase } = await getOrg();
  const { error } = await supabase.from("webhooks").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/settings/webhooks");
}

export async function deleteWebhook(id: string) {
  const { supabase } = await getOrg();
  await supabase.from("webhooks").delete().eq("id", id);
  revalidatePath("/ERP/settings/webhooks");
}

// Called server-side to fire webhooks for an event
export async function triggerWebhook(orgId: string, event: string, payload: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: hooks } = await supabase.from("webhooks").select("*").eq("organization_id", orgId).eq("is_active", true).contains("events", [event]);
  if (!hooks?.length) return;
  await Promise.allSettled(hooks.map(async (hook) => {
    try {
      await fetch(hook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(hook.secret ? { "X-Webhook-Secret": hook.secret } : {}) },
        body: JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload }),
      });
      await supabase.from("webhooks").update({ last_triggered: new Date().toISOString() }).eq("id", hook.id);
    } catch {}
  }));
}
