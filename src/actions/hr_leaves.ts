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

export async function getLeaves() {
  const { supabase } = await getOrgId();
  const { data, error } = await supabase
    .from("hr_leaves")
    .select("*, hr_employees(id, first_name, last_name, designation, department)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createLeaveRequest(data: {
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}) {
  const { supabase, orgId } = await getOrgId();
  const { error } = await supabase.from("hr_leaves").insert({
    ...data,
    organization_id: orgId,
    status: "pending",
  });
  if (error) throw error;
  revalidatePath("/ERP/hr/leaves");
}

export async function updateLeaveStatus(leaveId: string, status: "approved" | "rejected") {
  const { supabase, user } = await getOrgId();
  const { error } = await supabase
    .from("hr_leaves")
    .update({ status, approved_by: user.id })
    .eq("id", leaveId);
  if (error) throw error;
  revalidatePath("/ERP/hr/leaves");
}

export async function deleteLeave(leaveId: string) {
  const { supabase } = await getOrgId();
  const { error } = await supabase.from("hr_leaves").delete().eq("id", leaveId);
  if (error) throw error;
  revalidatePath("/ERP/hr/leaves");
}
