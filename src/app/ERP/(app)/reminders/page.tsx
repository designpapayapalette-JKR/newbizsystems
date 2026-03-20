import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReminders } from "@/actions/reminders";
import { TopBar } from "@/components/layout/TopBar";
import { ReminderList } from "@/components/reminders/ReminderList";
import { ReminderFormDialog } from "@/components/reminders/ReminderFormDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell } from "lucide-react";

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const [pending, completed] = await Promise.all([
    getReminders(profile.current_org_id, false),
    getReminders(profile.current_org_id, true),
  ]);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Reminders" actions={<ReminderFormDialog />} />
      <div className="flex-1 overflow-y-auto p-4">
        {pending.length === 0 && completed.length === 0 ? (
          <EmptyState icon={Bell} title="No reminders" description="Set reminders to follow up with leads on time" />
        ) : (
          <ReminderList pending={pending as any[]} completed={completed as any[]} />
        )}
      </div>
    </div>
  );
}
