import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PipelineStagesEditor } from "@/components/settings/PipelineStagesEditor";

export default async function PipelineSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/onboarding");

  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("organization_id", profile.current_org_id)
    .order("position");

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Pipeline Stages</h2>
      <p className="text-sm text-muted-foreground mb-6">Customize the stages in your lead pipeline. Drag to reorder.</p>
      <PipelineStagesEditor stages={stages ?? []} orgId={profile.current_org_id} />
    </div>
  );
}
