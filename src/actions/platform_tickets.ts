"use server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId } from "./leads";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
  if (!profile?.is_super_admin) throw new Error("Super admin access required");
  return user;
}

// SUBSCRIBER ACTIONS
export async function getClientPlatformTickets() {
  const { orgId } = await getOrgId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_tickets")
    .select("*, messages:platform_ticket_messages(count)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPlatformTicket(data: { type: string, subject: string, description: string }) {
  const { orgId, userId } = await getOrgId();
  const supabase = await createClient();
  const { error } = await supabase.from("platform_tickets").insert({
    organization_id: orgId,
    created_by: userId,
    type: data.type,
    subject: data.subject,
    description: data.description,
  });
  if (error) throw error;
  revalidatePath("/CRM/settings/support");
}

export async function getPlatformTicketDetails(ticketId: string) {
  const supabase = await createClient();
  
  const { data: ticket, error: ticketError } = await supabase
    .from("platform_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();
    
  if (ticketError) throw ticketError;
  
  const { data: messages, error: msgsError } = await supabase
    .from("platform_ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
    
  if (msgsError) throw msgsError;
  
  // Fetch profiles manually
  const senderIds = [...new Set((messages || []).map(m => m.sender_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url, is_super_admin").in("id", senderIds);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  
  const msgsWithProfiles = (messages || []).map(m => ({ ...m, profile: profileMap[m.sender_id] }));
  
  // Fetch org manually
  const { data: org } = await supabase.from("organizations").select("name").eq("id", ticket.organization_id).single();
  ticket.organization = org;
  
  return { ticket, messages: msgsWithProfiles };
}

export async function replyToPlatformTicket(ticketId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Ensure ticket exists and user has access (RLS handles this for subscribers, SuperAdmin needs service role maybe, but we'll try authenticated)
  // Super Adms have a policy now
  const { error } = await supabase.from("platform_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    content,
  });
  
  if (error) throw error;
  
  // Update ticket updated_at
  await supabase.from("platform_tickets").update({ updated_at: new Date().toISOString() }).eq("id", ticketId);
  
  revalidatePath(`/CRM/settings/support/${ticketId}`);
  revalidatePath(`/CRM/admin/support/${ticketId}`);
}

// SUPER ADMIN ACTIONS
export async function getAllPlatformTickets() {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  
  const { data: tickets, error } = await admin.from("platform_tickets").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  
  const orgIds = [...new Set((tickets || []).map(t => t.organization_id))];
  const { data: orgs } = await admin.from("organizations").select("id, name").in("id", orgIds);
  const orgMap = Object.fromEntries((orgs || []).map(o => [o.id, o]));
  
  const creatorIds = [...new Set((tickets || []).map(t => t.created_by))];
  const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", creatorIds);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  
  return (tickets || []).map(t => ({ 
    ...t, 
    organization: orgMap[t.organization_id],
    creator: profileMap[t.created_by]
  }));
}

export async function updatePlatformTicketStatus(ticketId: string, status: string) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  const { error } = await admin.from("platform_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticketId);
  if (error) throw error;
  revalidatePath(`/CRM/admin/support/${ticketId}`);
  revalidatePath(`/CRM/admin/support`);
}
