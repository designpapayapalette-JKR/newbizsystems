"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrgAndUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
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
  
  // Business-Hours SLA Logic
  let sla_due_at = null;
  if (data.sla_hours) {
    const { data: settings } = await supabase.from("hr_settings").select("work_start_time, work_end_time").eq("organization_id", orgId).maybeSingle();
    const startStr = settings?.work_start_time || "09:30:00";
    const endStr = settings?.work_end_time || "18:30:00";
    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);
    
    let current = new Date();
    let remainingSla = data.sla_hours;
    
    while (remainingSla > 0) {
      const dow = current.getDay();
      if (dow === 0 || dow === 6) { // Skip weekends
        current.setDate(current.getDate() + 1);
        current.setHours(startH, startM, 0, 0);
        continue;
      }
      
      const tStart = new Date(current); tStart.setHours(startH, startM, 0, 0);
      const tEnd = new Date(current); tEnd.setHours(endH, endM, 0, 0);
      
      if (current < tStart) current = tStart;
      if (current >= tEnd) {
        current.setDate(current.getDate() + 1);
        current.setHours(startH, startM, 0, 0);
        continue;
      }
      
      const hrsLeft = (tEnd.getTime() - current.getTime()) / 3600000;
      if (remainingSla <= hrsLeft) {
        current = new Date(current.getTime() + remainingSla * 3600000);
        remainingSla = 0;
      } else {
        remainingSla -= hrsLeft;
        current.setDate(current.getDate() + 1);
        current.setHours(startH, startM, 0, 0);
      }
    }
    sla_due_at = current.toISOString();
  }

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
  revalidatePath("/ERP/tickets");
  return ticket;
}

export async function updateTicket(id: string, data: { title?: string; description?: string; status?: string; priority?: string; assigned_to?: string }) {
  const { supabase } = await getOrgAndUser();
  const update: Record<string, unknown> = { ...data };
  if (data.status === "resolved" || data.status === "closed") update.resolved_at = new Date().toISOString();
  
  const { data: ticket, error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", id)
    .select("ticket_number, title")
    .single();

  if (error) throw error;

  // Create notification if assigned
  if (data.assigned_to) {
    const { orgId } = await getOrgAndUser();
    await supabase.from("reminders").insert({
      organization_id: orgId,
      user_id: data.assigned_to,
      title: `New Ticket Assigned: ${ticket.ticket_number}`,
      description: `Support Ticket #${ticket.ticket_number} (${ticket.title}) has been assigned to you.`,
      due_at: new Date().toISOString(),
      priority: "high"
    });
  }

  revalidatePath("/ERP/tickets");
  revalidatePath(`/ERP/tickets/${id}`);
}

export async function deleteTicket(id: string) {
  const { supabase } = await getOrgAndUser();
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/tickets");
}

export async function addTicketComment(ticketId: string, body: string, isInternal = false) {
  const { supabase, user } = await getOrgAndUser();
  const { error } = await supabase.from("ticket_comments").insert({ ticket_id: ticketId, user_id: user.id, body, is_internal: isInternal });
  if (error) throw error;
  revalidatePath(`/ERP/tickets/${ticketId}`);
}

export async function getTickets(filters?: { status?: string; priority?: string; assigned_to?: string }) {
  const { supabase, orgId } = await getOrgAndUser();
  let q = supabase
    .from("tickets")
    .select("*, lead:leads(id, name)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
  if (filters?.priority && filters.priority !== "all") q = q.eq("priority", filters.priority);
  if (filters?.assigned_to) q = q.eq("assigned_to", filters.assigned_to);
  const { data, error } = await q;
  if (error) throw error;
  if (!data?.length) return [];

  // Fetch assignee profiles manually
  const assigneeIds = [...new Set(data.map((t: any) => t.assigned_to).filter(Boolean))];
  const { data: profiles } = assigneeIds.length
    ? await supabase.from("profiles").select("id, full_name, avatar_url, email").in("id", assigneeIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return data.map((t: any) => ({
    ...t,
    assignee: t.assigned_to ? (profileMap[t.assigned_to] ?? null) : null,
  }));
}

export async function getTicketById(id: string) {
  const { supabase } = await getOrgAndUser();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, lead:leads(id, name), comments:ticket_comments(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const commentUserIds = (data.comments ?? []).map((c: any) => c.user_id).filter(Boolean);
  const allUserIds = [...new Set([...commentUserIds, data.assigned_to].filter(Boolean))];
  
  const { data: profiles } = allUserIds.length
    ? await supabase.from("profiles").select("*").in("id", allUserIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return {
    ...data,
    assignee: data.assigned_to ? (profileMap[data.assigned_to] ?? null) : null,
    comments: (data.comments ?? []).map((c: any) => ({
      ...c,
      user_profile: c.user_id ? (profileMap[c.user_id] ?? null) : null,
    })),
  };
}
