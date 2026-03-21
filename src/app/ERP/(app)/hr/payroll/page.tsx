import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrgRole } from "@/actions/team";
import { HRNav } from "@/components/hr/HRNav";
import { PayrollList } from "@/components/hr/PayrollList";
import { getPayrollRecords } from "@/actions/hr_payroll";

export default async function PayrollPage({ searchParams }: { searchParams: { month?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.current_org_id) redirect("/ERP/onboarding");
  const orgId = profile.current_org_id;

  const currentRole = await getOrgRole(user.id, orgId);
  if (currentRole !== "owner" && currentRole !== "admin") {
    redirect("/ERP/hr");
  }

  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = (await searchParams).month || defaultMonth;

  const payrollRecords = await getPayrollRecords(selectedMonth);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground text-sm">
            Generate, review, and finalize monthly employee salaries with automated deductions.
          </p>
        </div>
      </div>

      <HRNav />

      <PayrollList records={payrollRecords} selectedMonth={selectedMonth} />
    </div>
  );
}
