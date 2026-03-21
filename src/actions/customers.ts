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

export async function getCustomers() {
  const { supabase, orgId } = await getOrg();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function updateCustomer(id: string, data: any) {
  const { supabase } = await getOrg();
  const { error } = await supabase.from("customers").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/customers");
  revalidatePath(`/ERP/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  const { supabase } = await getOrg();
  const { error } = await supabase.from("customers").update({ status: "archived" }).eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/customers");
}
