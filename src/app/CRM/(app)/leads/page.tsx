import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { LeadListView } from "@/components/leads/LeadListView";
import { TopBar } from "@/components/layout/TopBar";
import { LeadFormDialog } from "@/components/leads/LeadFormDialog";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadCsvExport } from "@/components/leads/LeadCsvExport";
import { LeadCsvImport } from "@/components/leads/LeadCsvImport";
import { ViewToggle } from "@/components/leads/ViewToggle";
import { getLeads } from "@/actions/leads";
import { Users, Archive } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; search?: string; stage_id?: string; source?: string; priority?: string; sort?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const orgId = profile.current_org_id;
  const sp = await searchParams;

  const [leads, stagesResult] = await Promise.all([
    getLeads(orgId, {
      search: sp.search,
      stage_id: sp.stage_id,
      source: sp.source,
      priority: sp.priority,
      sort: sp.sort,
    }),
    supabase.from("pipeline_stages").select("*").eq("organization_id", orgId).order("position"),
  ]);

  const stages = stagesResult.data ?? [];
  const view = sp.view === "list" ? "list" : "kanban";

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Leads"
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link href="/CRM/leads/archived"><Archive className="h-4 w-4" /> Archived</Link>
            </Button>
            <LeadCsvImport stages={stages} />
            <LeadCsvExport leads={leads} />
            <ViewToggle currentView={view} />
            <LeadFormDialog stages={stages} />
          </div>
        }
      />
      <LeadFilters stages={stages} />
      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description="Try adjusting your filters or add your first lead"
        />
      ) : view === "list" ? (
        <div className="flex-1 overflow-y-auto py-2">
          <LeadListView leads={leads} />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden pt-2">
          <KanbanBoard stages={stages} leads={leads} />
        </div>
      )}
    </div>
  );
}
