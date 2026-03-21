"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface LeadFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  deal_value?: number;
  stage_id?: string;
  assigned_to?: string;
  next_followup_at?: string;
  notes?: string;
  tags?: string[];
  priority?: "hot" | "warm" | "cold";
  lead_score?: number;
  title?: string;
  win_reason?: string;
  loss_reason?: string;
  close_date?: string;
  probability?: number;
  gdpr_consent?: boolean;
  gdpr_consent_at?: string;
  gstin?: string;
  pan?: string;
  state?: string;
  state_code?: string;
}

export async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_org_id")
    .eq("id", user.id)
    .maybeSingle();
    
  if (!profile?.current_org_id) throw new Error("No organization found");
  return { orgId: profile.current_org_id, userId: user.id };
}

export async function createLead(data: LeadFormData) {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();

  // Deduplication check
  if (data.email || data.phone) {
    let dupQuery = supabase.from("leads").select("id, name").eq("organization_id", orgId).eq("is_archived", false);
    if (data.email) dupQuery = dupQuery.eq("email", data.email);
    else if (data.phone) dupQuery = dupQuery.eq("phone", data.phone);
    const { data: existing } = await dupQuery.limit(1).maybeSingle();
    if (existing) throw new Error(`DUPLICATE:${existing.id}:${existing.name}`);
  }

  const { tags, ...leadData } = data;

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({ ...leadData, organization_id: orgId, created_by: userId })
    .select()
    .maybeSingle();

  if (error) throw error;

  if (tags && tags.length > 0) {
    await supabase.from("lead_tags").insert(tags.map((tag) => ({ lead_id: lead.id, tag })));
  }

  revalidatePath("/ERP/leads");
  return lead;
}

export async function updateLead(id: string, data: Partial<LeadFormData>) {
  const supabase = await createClient();
  const { tags, ...leadData } = data;

  const { error } = await supabase.from("leads").update(leadData).eq("id", id);
  if (error) throw error;

  if (tags !== undefined) {
    await supabase.from("lead_tags").delete().eq("lead_id", id);
    if (tags.length > 0) {
      await supabase.from("lead_tags").insert(tags.map((tag) => ({ lead_id: id, tag })));
    }
  }

  revalidatePath("/ERP/leads");
  revalidatePath(`/ERP/leads/${id}`);
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();
  const { data: member } = await supabase.from("organization_members").select("role").eq("organization_id", orgId).eq("user_id", userId).maybeSingle();
  const role = member?.role ?? "member";
  if (role !== "admin" && role !== "owner") throw new Error("Only admins can delete leads");

  await supabase.from("leads").update({ is_archived: true }).eq("id", id);
  revalidatePath("/ERP/leads");
}

export async function restoreLead(id: string) {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();
  const { data: member } = await supabase.from("organization_members").select("role").eq("organization_id", orgId).eq("user_id", userId).maybeSingle();
  const role = member?.role ?? "member";
  if (role !== "admin" && role !== "owner") throw new Error("Only admins can restore leads");

  await supabase.from("leads").update({ is_archived: false }).eq("id", id);
  revalidatePath("/ERP/leads");
}

export async function updateLeadStage(id: string, stageId: string, position: number) {
  const supabase = await createClient();
  await supabase.from("leads").update({ stage_id: stageId, position }).eq("id", id);
  revalidatePath("/ERP/leads");
}

export async function getLeads(orgId: string, filters?: {
  search?: string;
  stage_id?: string;
  source?: string;
  priority?: string;
  assigned_to?: string;
  sort?: string;
  archived?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select(`*, stage:pipeline_stages(*), tags:lead_tags(tag)`)
    .eq("organization_id", orgId)
    .eq("is_archived", filters?.archived ?? false);

  if (filters?.search) {
    const s = filters.search;
    query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,company.ilike.%${s}%`);
  }
  if (filters?.stage_id) {
    query = query.eq("stage_id", filters.stage_id);
  }
  if (filters?.source) {
    query = query.eq("source", filters.source);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.assigned_to) {
    query = query.eq("assigned_to", filters.assigned_to);
  }

  const sort = filters?.sort;
  if (sort === "name") {
    query = query.order("name");
  } else if (sort === "deal_value") {
    query = query.order("deal_value", { ascending: false });
  } else if (sort === "created_at") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "followup") {
    query = query.order("next_followup_at", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("position");
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((lead) => ({
    ...lead,
    tags: lead.tags?.map((t: { tag: string }) => t.tag) ?? [],
  }));
}

export async function getLeadById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(`*, stage:pipeline_stages(*), tags:lead_tags(tag)`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  const lead = { ...data, tags: data.tags?.map((t: { tag: string }) => t.tag) ?? [] };

  // Fetch assignee profile if assigned
  if (lead.assigned_to) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", lead.assigned_to)
      .maybeSingle();
    (lead as any).assignee = profile ?? null;
  }

  return lead;
}

export async function assignLead(leadId: string, userId: string | null) {
  const supabase = await createClient();
  const { orgId, userId: currentUserId } = await getOrgId();
  const { data: member } = await supabase.from("organization_members").select("role").eq("organization_id", orgId).eq("user_id", currentUserId).maybeSingle();
  const role = member?.role ?? "member";
  if (role !== "admin" && role !== "owner") throw new Error("Only admins can assign leads");

  const { data: lead, error } = await supabase
    .from("leads")
    .update({ assigned_to: userId })
    .eq("id", leadId)
    .select("name")
    .maybeSingle();

  if (error || !lead) throw error || new Error("Lead not found");
  
  // Create notification for new assignee
  // The orgId is already available from the getOrgId() call above.
  if (userId) { // Only create reminder if a user is actually assigned
    await supabase.from("reminders").insert({
      organization_id: orgId,
      user_id: userId,
      lead_id: leadId, // Keep lead_id for context
      title: `Lead Assigned: ${lead.name}`,
      description: `You have been assigned to lead ${lead.name}`,
      due_at: new Date().toISOString(),
      priority: "medium"
    });
  }

  revalidatePath(`/ERP/leads/${leadId}`);
  revalidatePath("/ERP/leads");
}

export async function convertToCustomer(leadId: string) {
  const supabase = await createClient();
  const { orgId } = await getOrgId();
  
  // 1. Fetch lead details
  const { data: lead, error: fetchErr } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();
    
  if (fetchErr || !lead) throw new Error("Lead not found");
  
  // 2. Insert into customers
  const { data: customer, error: insertErr } = await supabase
    .from("customers")
    .insert({
      organization_id: orgId,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      gstin: lead.gstin,
      address: lead.address,
      state: lead.state,
      state_code: lead.state_code,
      pan: lead.pan,
      website: lead.website,
      source_lead_id: lead.id,
      status: "active"
    })
    .select()
    .maybeSingle();
    
  if (insertErr) throw insertErr;
  
  // 3. Update lead status to reflect conversion
  await supabase.from("leads").update({ status: "converted" }).eq("id", leadId);
  
  // 4. Link existing invoices of this lead to the new customer record
  await supabase.from("invoices").update({ customer_id: customer.id }).eq("lead_id", leadId);
  
  revalidatePath("/ERP/leads");
  revalidatePath("/ERP/customers");
  return customer;
}
