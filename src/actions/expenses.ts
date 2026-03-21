"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) throw new Error("No organization selected");
  return { supabase, user, orgId: profile.current_org_id };
}

export async function getExpenses() {
  const { supabase, orgId } = await getOrgId();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("organization_id", orgId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createExpense(data: {
  category: string;
  amount: number;
  date: string;
  description?: string;
}) {
  const { supabase, user, orgId } = await getOrgId();
  const { error } = await supabase.from("expenses").insert({
    ...data,
    organization_id: orgId,
    created_by: user.id
  });
  if (error) throw error;
  revalidatePath("/ERP/payments/expenses");
  revalidatePath("/ERP/dashboard");
}

export async function deleteExpense(id: string) {
  const { supabase } = await getOrgId();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/payments/expenses");
  revalidatePath("/ERP/dashboard");
}
