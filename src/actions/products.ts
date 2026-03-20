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

export async function getProducts(activeOnly = false) {
  const { supabase, orgId } = await getOrg();
  let q = supabase.from("products").select("*").eq("organization_id", orgId).order("name");
  if (activeOnly) q = q.eq("is_active", true);
  const { data } = await q;
  return data ?? [];
}

export async function createProduct(data: { name: string; description?: string; unit_price: number; currency?: string; category?: string }) {
  const { supabase, user, orgId } = await getOrg();
  const { error } = await supabase.from("products").insert({ ...data, organization_id: orgId, created_by: user.id });
  if (error) throw error;
  revalidatePath("/CRM/settings/products");
}

export async function updateProduct(id: string, data: Partial<{ name: string; description: string; unit_price: number; currency: string; category: string; is_active: boolean }>) {
  const { supabase } = await getOrg();
  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/CRM/settings/products");
}

export async function deleteProduct(id: string) {
  const { supabase } = await getOrg();
  await supabase.from("products").update({ is_active: false }).eq("id", id);
  revalidatePath("/CRM/settings/products");
}
