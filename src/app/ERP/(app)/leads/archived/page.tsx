import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLeads } from "@/actions/leads";
import { TopBar } from "@/components/layout/TopBar";
import { ArchivedLeadsList } from "@/components/leads/ArchivedLeadsList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Archive, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ArchivedLeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const leads = await getLeads(profile.current_org_id, { archived: true });

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Archived Leads"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/ERP/leads"><ArrowLeft className="h-4 w-4" /> Back to Leads</Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4">
        {leads.length === 0 ? (
          <EmptyState icon={Archive} title="No archived leads" description="Deleted leads will appear here" />
        ) : (
          <ArchivedLeadsList leads={leads} />
        )}
      </div>
    </div>
  );
}
