"use server";
import { createClient } from "@/lib/supabase/server";

async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  if (!profile?.current_org_id) throw new Error("No organization assigned to this profile");
  return { supabase, orgId: profile.current_org_id };
}

export async function exportLeadsToCSV() {
  const { supabase, orgId } = await getOrgId();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("name, company, email, phone, status, deal_value, created_at")
    .eq("organization_id", orgId)
    .eq("is_archived", false);

  if (error) throw error;
  if (!leads || leads.length === 0) return "";

  const headers = ["Name", "Company", "Email", "Phone", "Status", "Value", "Date"];
  const rows = leads.map(l => [
    l.name,
    l.company || "",
    l.email || "",
    l.phone || "",
    l.status,
    l.deal_value || 0,
    new Date(l.created_at).toLocaleDateString()
  ]);

  return [headers, ...rows].map(r => r.join(",")).join("\n");
}

export async function exportInvoicesToCSV() {
  const { supabase, orgId } = await getOrgId();
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("invoice_number, title, total, status, issue_date, due_date")
    .eq("organization_id", orgId)
    .neq("status", "cancelled");

  if (error) throw error;
  if (!invoices || invoices.length === 0) return "";

  const headers = ["Invoice #", "Title", "Total", "Status", "Issue Date", "Due Date"];
  const rows = invoices.map(i => [
    i.invoice_number,
    i.title || "",
    i.total,
    i.status,
    i.issue_date,
    i.due_date || ""
  ]);

  return [headers, ...rows].map(r => r.join(",")).join("\n");
}
