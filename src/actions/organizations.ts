"use server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";

const DEFAULT_STAGES = [
  { name: "New Lead", color: "#6366f1", position: 0, is_default: true },
  { name: "Contacted", color: "#f59e0b", position: 1 },
  { name: "Qualified", color: "#3b82f6", position: 2 },
  { name: "Proposal Sent", color: "#8b5cf6", position: 3 },
  { name: "Negotiation", color: "#f97316", position: 4 },
  { name: "Won", color: "#22c55e", position: 5, is_won: true },
  { name: "Lost", color: "#ef4444", position: 6, is_lost: true },
];

export async function createOrganization(name: string, currency = "INR") {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Use service client to bypass RLS for the cascading org setup
  // (pipeline_stages RLS depends on membership which is inserted in the same flow)
  const admin = await createServiceClient();

  const slug = generateSlug(name) + "-" + Math.random().toString(36).slice(2, 6);

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name, slug, currency })
    .select()
    .single();

  if (orgError) throw orgError;

  // Add user as owner
  const { error: memberError } = await admin.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });
  if (memberError) throw memberError;

  // Seed default pipeline stages
  const { error: stagesError } = await admin.from("pipeline_stages").insert(
    DEFAULT_STAGES.map((s) => ({ ...s, organization_id: org.id }))
  );
  if (stagesError) throw stagesError;

  // Update profile current org
  await admin
    .from("profiles")
    .update({ current_org_id: org.id })
    .eq("id", user.id);

  return org;
}

export async function updateOrganization(id: string, data: {
  name?: string;
  currency?: string;
  timezone?: string;
  logo_url?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  invoice_color?: string;
  invoice_footer?: string;
  invoice_template?: string;
  state?: string;
  state_code?: string;
  gstin?: string;
  tax_label?: string;
  pan?: string;
  hsn_sac?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("organizations").update(data).eq("id", id);
  if (error) throw error;

  revalidatePath("/CRM/settings/organization");
}

export async function updatePipelineStages(orgId: string, stages: { id?: string; name: string; color: string; position: number; is_won?: boolean; is_lost?: boolean }[]) {
  const supabase = await createClient();

  // Delete stages not in new list
  const stageIds = stages.filter((s) => s.id).map((s) => s.id!);
  if (stageIds.length > 0) {
    await supabase
      .from("pipeline_stages")
      .delete()
      .eq("organization_id", orgId)
      .not("id", "in", `(${stageIds.join(",")})`);
  } else {
    await supabase.from("pipeline_stages").delete().eq("organization_id", orgId);
  }

  // Upsert stages
  for (const stage of stages) {
    if (stage.id) {
      await supabase.from("pipeline_stages").update({ name: stage.name, color: stage.color, position: stage.position, is_won: stage.is_won ?? false, is_lost: stage.is_lost ?? false }).eq("id", stage.id);
    } else {
      await supabase.from("pipeline_stages").insert({ organization_id: orgId, name: stage.name, color: stage.color, position: stage.position, is_won: stage.is_won ?? false, is_lost: stage.is_lost ?? false });
    }
  }

  revalidatePath("/CRM/settings/pipeline");
  revalidatePath("/CRM/leads");
}
