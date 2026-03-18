"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrgAndUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) throw new Error("No org");
  return { supabase, user, orgId: profile.current_org_id };
}

async function nextTicketNumber(supabase: Awaited<ReturnType<typeof createClient>>, orgId: string) {
  const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("organization_id", orgId);
  return `TKT-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function createTicket(data: {
  title: string;
  description?: string;
  priority?: string;
  lead_id?: string;
  assigned_to?: string;
  sla_hours?: number;
}) {
  const { supabase, user, orgId } = await getOrgAndUser();
  const ticket_number = await nextTicketNumber(supabase, orgId);
  const sla_due_at = data.sla_hours ? new Date(Date.now() + data.sla_hours * 3600000).toISOString() : null;
  const { data: ticket, error } = await supabase.from("tickets").insert({
    organization_id: orgId,
    ticket_number,
    title: data.title,
    description: data.description,
    priority: data.priority ?? "medium",
    lead_id: data.lead_id,
    assigned_to: data.assigned_to,
    sla_due_at,
    created_by: user.id,
  }).select().single();
  if (error) throw error;
  revalidatePath("/tickets");
  return ticket;
}

export async function updateTicket(id: string, data: { title?: string; description?: string; status?: string; priority?: string; assigned_to?: string }) {
  const { supabase } = await getOrgAndUser();
  const update: Record<string, unknown> = { ...data };
  if (data.status === "resolved" || data.status === "closed") update.resolved_at = new Date().toISOString();
  const { error } = await supabase.from("tickets").update(update).eq("id", id);
  if (error) throw error;
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
}

export async function addTicketComment(ticketId: string, body: string, isInternal = false) {
  const { supabase, user } = await getOrgAndUser();
  const { error } = await supabase.from("ticket_comments").insert({ ticket_id: ticketId, user_id: user.id, body, is_internal: isInternal });
  if (error) throw error;
  revalidatePath(`/tickets/${ticketId}`);
}

export async function getTickets(filters?: { status?: string; priority?: string; assigned_to?: string }) {
  const { supabase, orgId } = await getOrgAndUser();
  let q = supabase.from("tickets").select("*, lead:leads(id, name)").eq("organization_id", orgId).order("created_at", { ascending: false });
  if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
  if (filters?.priority && filters.priority !== "all") q = q.eq("priority", filters.priority);
  if (filters?.assigned_to) q = q.eq("assigned_to", filters.assigned_to);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getTicketById(id: string) {
  const { supabase } = await getOrgAndUser();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, lead:leads(id, name), comments:ticket_comments(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  if (!data) return null;

  const userIds = [...new Set((data.comments ?? []).map((c: any) => c.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return {
    ...data,
    comments: (data.comments ?? []).map((c: any) => ({
      ...c,
      user_profile: c.user_id ? (profileMap[c.user_id] ?? null) : null,
    })),
  };
}
