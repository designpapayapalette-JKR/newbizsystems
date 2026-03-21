import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import type { Role } from "@/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, org:organizations(*)")
    .eq("id", user.id)
    .single();

  const orgId = (profile as any)?.current_org_id;
  const orgName = (profile as any)?.org?.name ?? "My Business";
  const isSuperAdmin = (profile as any)?.is_super_admin === true;

  // Fetch user's role in the current org and their HR department
  let userRole: Role = "member";
  let userDepartment: string | null = null;
  if (orgId) {
    const { data: memberRow } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("user_id", user.id)
      .single();
    userRole = (memberRow?.role as Role) ?? "member";

    const { data: empRow } = await supabase
      .from("hr_employees")
      .select("department")
      .eq("organization_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();
    userDepartment = empRow?.department ?? null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          orgName={orgName}
          userFullName={profile?.full_name ?? null}
          userAvatarUrl={profile?.avatar_url ?? null}
          userRole={userRole}
          userDepartment={userDepartment}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav userRole={userRole} userDepartment={userDepartment} />

      {/* Notification permission prompt + in-tab reminder poller */}
      <NotificationProvider />
    </div>
  );
}
