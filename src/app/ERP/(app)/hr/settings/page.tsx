import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getHrSettings, getHrHolidays } from "@/actions/hr_settings";
import { SettingsForm } from "@/components/hr/SettingsForm";
import { HolidaysList } from "@/components/hr/HolidaysList";

export const metadata = { title: "HR Settings | NewBiz ERP" };

export default async function HrSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  // Auth / Role check
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", profile.current_org_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (member?.role !== "admin" && member?.role !== "owner") {
    redirect("/ERP/hr/attendance"); // Fallback for non-admins
  }

  const [settings, holidays] = await Promise.all([
    getHrSettings(),
    getHrHolidays(),
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TopBar title="HR & Attendance Settings" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* General Working Hours & Limits */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Time & Attendance Rules</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure your organization's default working hours, breaks, and margins.</p>
            </div>
            <SettingsForm initialData={settings} />
          </div>

          {/* Statutory Holidays */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Holidays List</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage public and company holidays. These days won't be marked as absent.</p>
            </div>
            <HolidaysList initialHolidays={holidays} />
          </div>

        </div>
      </div>
    </div>
  );
}
