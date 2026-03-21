import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { TasksList } from "@/components/tasks/TasksList";
import { AssignTaskDialog } from "@/components/tasks/AssignTaskDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { getOrgRole, getTeamMembers } from "@/actions/team";
import { getMyTasks, getOrgTasks } from "@/actions/activities";
import { CheckSquare } from "lucide-react";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const orgId = profile.current_org_id;

  const [userRole, members] = await Promise.all([
    getOrgRole(user.id, orgId),
    getTeamMembers(orgId),
  ]);

  const isAdminOrOwner = userRole === "admin" || userRole === "owner";

  // Admin/owner sees all org tasks; member sees only tasks assigned to them
  const tasks = isAdminOrOwner
    ? await getOrgTasks(orgId)
    : await getMyTasks(user.id, orgId);

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("is_archived", false)
    .order("name");

  const openTasks = tasks.filter((t) => !t.outcome || t.outcome === "pending");
  const doneTasks = tasks.filter((t) => t.outcome === "completed" || t.outcome === "done");

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Tasks"
        subtitle={isAdminOrOwner ? "All team tasks" : "Tasks assigned to you"}
        actions={
          isAdminOrOwner ? (
            <AssignTaskDialog
              members={members as any[]}
              orgId={orgId}
              leads={leads ?? []}
            />
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {openTasks.length === 0 && doneTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description={
              isAdminOrOwner
                ? "Assign tasks to team members from the Tasks page or the Team settings"
                : "No tasks have been assigned to you yet"
            }
          />
        ) : (
          <>
            {openTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground">
                  Open ({openTasks.length})
                </h3>
                <TasksList tasks={openTasks as any[]} showAssignee={isAdminOrOwner} />
              </div>
            )}
            {doneTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Completed ({doneTasks.length})
                </h3>
                <TasksList tasks={doneTasks as any[]} done showAssignee={isAdminOrOwner} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
