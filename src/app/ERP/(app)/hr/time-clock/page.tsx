import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { TimeClock } from "@/components/hr/TimeClock";
import { getHrSettings, getHrHolidays } from "@/actions/hr_settings";

export const metadata = { title: "Time Clock | NewBiz ERP" };

export default async function TimeClockPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  // Get employee record
  const { data: employee } = await supabase
    .from("hr_employees")
    .select("id, first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!employee) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <TopBar title="Time Clock" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-medium">No Employee Record Found</h2>
            <p className="text-muted-foreground mt-2">Your user account is not linked to an HR Employee record. Please contact your admin.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get today's attendance record
  const today = new Date().toISOString().split("T")[0];
  const { data: attendance } = await supabase
    .from("hr_attendance")
    .select("*")
    .eq("employee_id", employee.id)
    .eq("date", today)
    .maybeSingle();

  const [settings, holidays] = await Promise.all([
    getHrSettings(),
    getHrHolidays(),
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TopBar title="Time Clock" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <TimeClock 
            employee={employee} 
            todaysAttendance={attendance} 
            settings={settings}
            holidays={holidays}
          />
        </div>
      </div>
    </div>
  );
}
