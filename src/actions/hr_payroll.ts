"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";

export async function getPayrollRecords(monthYear: string) {
  const supabase = await createClient();
  const { orgId } = await getOrgId();

  const { data, error } = await supabase
    .from("hr_payroll")
    .select("*, employee:employee_id(first_name, last_name, employee_type)")
    .eq("organization_id", orgId)
    .eq("month_year", monthYear)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function generateMonthlyPayroll(monthYear: string) {
  const supabase = await createClient();
  const { orgId } = await getOrgId();

  // 1. Get HR Settings for global deduction thresholds
  const { data: settings } = await supabase
    .from("hr_settings")
    .select("*")
    .eq("organization_id", orgId)
    .single();

  const enablePF = settings?.enable_pf_deduction ?? false;
  const enableESI = settings?.enable_esi_deduction ?? false;
  const enablePT = settings?.enable_pt_deduction ?? false;

  // 2. Fetch all active employees
  const { data: employees, error: empError } = await supabase
    .from("hr_employees")
    .select("id, base_salary_monthly, status, working_days")
    .eq("organization_id", orgId)
    .eq("status", "active");

  if (empError) throw empError;
  if (!employees?.length) return { count: 0 };

  // Helper to count working days in a month
  const [year, monthNum] = monthYear.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  
  const payrollUpserts = [];

  for (const emp of employees) {
    const gross = Number(emp.base_salary_monthly) || 0;
    
    // Calculate attendance-based deduction
    // 1. Get attendance records for this month
    const { data: attendance } = await supabase
      .from("hr_attendance")
      .select("id, status")
      .eq("employee_id", emp.id)
      .gte("date", `${monthYear}-01`)
      .lte("date", `${monthYear}-${daysInMonth}`);

    const presentDays = attendance?.filter(a => a.status === "present" || a.status === "on_time" || a.status === "late").length || 0;
    const halfDays = attendance?.filter(a => a.status === "half_day").length || 0;
    const actualDays = presentDays + (halfDays * 0.5);

    // Calculate expected working days (assuming simplified 30 days or based on emp.working_days)
    // For simplicity, we use 26 days average or calculate based on working_days
    const allowedWorkingDaysIndices = Array.isArray(emp.working_days) ? emp.working_days : [1,2,3,4,5];
    let expectedDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthNum - 1, d);
      if (allowedWorkingDaysIndices.includes(date.getDay())) {
        expectedDays++;
      }
    }

    // Daily Rate
    const dailyRate = gross / (expectedDays || 30);
    const absentDays = Math.max(0, expectedDays - actualDays);
    const absenceDeduction = absentDays * dailyRate;

    const adjustedGross = Math.max(0, gross - absenceDeduction);

    // Standard Output Component Formula (on adjusted gross)
    const basic = adjustedGross * 0.50;
    const hra = adjustedGross * 0.20;
    const specialAllowance = adjustedGross - (basic + hra); 

    // Compute statutory deductions based on Admin toggles
    const pf = enablePF ? (basic * 0.12) : 0;
    const esi = enableESI && (adjustedGross <= 21000) ? (adjustedGross * 0.0075) : 0;
    const pt = enablePT && (adjustedGross > 15000) ? 200 : 0;
    const tds = 0; 

    const netPayable = adjustedGross - pf - esi - pt - tds;

    payrollUpserts.push({
      organization_id: orgId,
      employee_id: emp.id,
      month_year: monthYear,
      basic_salary: basic,
      hra: hra,
      special_allowance: specialAllowance,
      gross_salary: gross, // Store original gross
      pf_deduction: pf,
      esi_deduction: esi,
      pt_deduction: pt,
      tds_deduction: tds,
      net_payable: netPayable,
      status: "draft"
    });
  }

  // 3. Upsert to database
  if (payrollUpserts.length > 0) {
    for (const record of payrollUpserts) {
      const { error } = await supabase
        .from("hr_payroll")
        .upsert(record, { onConflict: "employee_id, month_year" });
      if (error) console.error("Payroll generation error:", error);
    }
  }

  revalidatePath("/ERP/hr/payroll");
  return { count: payrollUpserts.length };
}

export async function finalizePayroll(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hr_payroll")
    .update({ status: "paid", paid_on: new Date().toISOString().split('T')[0] })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/hr/payroll");
}
