"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) throw new Error("No organization selected");
  return { supabase, orgId: profile.current_org_id };
}

export async function getAttendanceForDate(date: string) {
  const { supabase } = await getOrgId();
  const { data, error } = await supabase
    .from("hr_attendance")
    .select("*, hr_employees(id, first_name, last_name, designation, department)")
    .eq("date", date);
  if (error) throw error;
  return data;
}

export async function getEmployeesForAttendance() {
  const { supabase } = await getOrgId();
  const { data, error } = await supabase
    .from("hr_employees")
    .select("id, first_name, last_name, designation, department")
    .eq("status", "active")
    .order("first_name");
  if (error) throw error;
  return data;
}

export async function markAttendance(records: {
  employee_id: string;
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}[]) {
  const { supabase, orgId } = await getOrgId();
  const payload = records.map(r => ({ ...r, organization_id: orgId }));
  const { error } = await supabase
    .from("hr_attendance")
    .upsert(payload, { onConflict: "employee_id,date" });
  if (error) throw error;
  revalidatePath("/CRM/hr/attendance");
}

export async function getAttendanceSummary(employeeId: string, month: string) {
  // month format: "2024-03"
  const { supabase } = await getOrgId();
  const { data, error } = await supabase
    .from("hr_attendance")
    .select("date, status")
    .eq("employee_id", employeeId)
    .gte("date", `${month}-01`)
    .lte("date", `${month}-31`);
  if (error) throw error;
  return data;
}
