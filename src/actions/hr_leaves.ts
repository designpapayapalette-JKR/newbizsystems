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
  
  // If approving, deduct from balance
  if (status === "approved") {
    const { data: leave } = await supabase.from("hr_leaves").select("*").eq("id", leaveId).single();
    if (leave) {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const balanceField = `${leave.type}_leave_used`;
      const { data: balance } = await supabase
        .from("hr_leave_balances")
        .select("*")
        .eq("employee_id", leave.employee_id)
        .eq("year", start.getFullYear())
        .maybeSingle();
        
      if (balance) {
        const newUsed = Number(balance[balanceField] || 0) + days;
        await supabase.from("hr_leave_balances").update({ [balanceField]: newUsed }).eq("id", balance.id);
      } else {
        // Create balance record if missing (lazy init)
        await supabase.from("hr_leave_balances").insert({
          organization_id: leave.organization_id,
          employee_id: leave.employee_id,
          year: start.getFullYear(),
          [balanceField]: days
        });
      }
    }
  }

  const { error } = await supabase
    .from("hr_leaves")
    .update({ status, approved_by: user.id })
    .eq("id", leaveId);
  if (error) throw error;
  revalidatePath("/ERP/hr/leaves");
}

export async function getLeaveBalances(employeeId?: string) {
  const { supabase, orgId } = await getOrgId();
  const year = new Date().getFullYear();
  let q = supabase.from("hr_leave_balances").select("*, hr_employees(first_name, last_name)").eq("organization_id", orgId).eq("year", year);
  if (employeeId) q = q.eq("employee_id", employeeId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function deleteLeave(leaveId: string) {
  const { supabase } = await getOrgId();
  const { error } = await supabase.from("hr_leaves").delete().eq("id", leaveId);
  if (error) throw error;
  revalidatePath("/ERP/hr/leaves");
}
