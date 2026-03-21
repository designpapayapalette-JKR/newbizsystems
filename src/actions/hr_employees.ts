"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEmployees() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hr_employees")
    .select("*")
    .order("first_name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createEmployee(data: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  designation?: string;
  department?: string;
  date_of_joining?: string;
  base_salary_monthly?: number;
  pan_number?: string;
  uan_number?: string;
  esic_number?: string;
  bank_account?: string;
  ifsc_code?: string;
  daily_working_hours?: number;
  working_days?: number[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) throw new Error("No organization selected");

  const insertData: Record<string, any> = {
    organization_id: profile.current_org_id,
  };

  // Strip empty strings and undefined values to avoid DB constraint failures on optional columns
  for (const [key, value] of Object.entries(data)) {
    if (value !== "" && value !== null && value !== undefined) {
      insertData[key] = value;
    }
  }

  const { error } = await supabase.from("hr_employees").insert(insertData);

  if (error) {
    console.error("Employee Creation Error:", error);
    throw new Error(error.message);
  }
  revalidatePath("/ERP/hr");
  revalidatePath("/ERP/hr/employees");
}

export async function updateEmployee(id: string, data: any) {
  const supabase = await createClient();
  
  const updateData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== "" && value !== undefined) {
      updateData[key] = value;
    } else if (value === "") {
      updateData[key] = null; // empty strings on edit should clear the field
    }
  }

  const { error } = await supabase
    .from("hr_employees")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Employee Update Error:", error);
    throw new Error(error.message);
  }
  revalidatePath("/ERP/hr");
  revalidatePath("/ERP/hr/employees");
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hr_employees")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/ERP/hr");
  revalidatePath("/ERP/hr/employees");
}
