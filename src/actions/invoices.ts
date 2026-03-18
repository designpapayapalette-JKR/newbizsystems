"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";

export interface LineItemData {
  description: string;
  hsn_sac?: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceFormData {
  lead_id?: string;
  title?: string;
  issue_date: string;
  due_date?: string;
  discount?: number;
  tax_percent?: number;
  notes?: string;
  terms?: string;
  currency?: string;
  line_items: LineItemData[];
}

async function generateInvoiceNumber(orgId: string, supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);
  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `INV-${year}-${seq}`;
}

export async function createInvoice(data: InvoiceFormData) {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();

  const subtotal = data.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discount = data.discount ?? 0;
  const taxPercent = data.tax_percent ?? 0;
  const taxAmount = ((subtotal - discount) * taxPercent) / 100;
  const total = subtotal - discount + taxAmount;

  const invoiceNumber = await generateInvoiceNumber(orgId, supabase);

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      organization_id: orgId,
      created_by: userId,
      invoice_number: invoiceNumber,
      lead_id: data.lead_id,
      title: data.title,
      issue_date: data.issue_date,
      due_date: data.due_date,
      discount,
      tax_percent: taxPercent,
      tax_amount: taxAmount,
      subtotal,
      total,
      notes: data.notes,
      terms: data.terms,
      currency: data.currency ?? "INR",
    })
    .select()
    .single();

  if (error) throw error;

  const lineItems = data.line_items.map((item, i) => ({
    invoice_id: invoice.id,
    description: item.description,
    hsn_sac: item.hsn_sac || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.quantity * item.unit_price,
    position: i,
  }));

  await supabase.from("invoice_line_items").insert(lineItems);

  revalidatePath("/invoices");
  return invoice;
}

export async function updateInvoice(id: string, data: Partial<InvoiceFormData>) {
  const supabase = await createClient();

  const invoiceUpdate: Record<string, unknown> = {};
  if (data.lead_id !== undefined) invoiceUpdate.lead_id = data.lead_id;
  if (data.title !== undefined) invoiceUpdate.title = data.title;
  if (data.issue_date !== undefined) invoiceUpdate.issue_date = data.issue_date;
  if (data.due_date !== undefined) invoiceUpdate.due_date = data.due_date;
  if (data.notes !== undefined) invoiceUpdate.notes = data.notes;
  if (data.terms !== undefined) invoiceUpdate.terms = data.terms;

  if (data.line_items !== undefined) {
    const subtotal = data.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const discount = data.discount ?? 0;
    const taxPercent = data.tax_percent ?? 0;
    const taxAmount = ((subtotal - discount) * taxPercent) / 100;
    invoiceUpdate.subtotal = subtotal;
    invoiceUpdate.discount = discount;
    invoiceUpdate.tax_percent = taxPercent;
    invoiceUpdate.tax_amount = taxAmount;
    invoiceUpdate.total = subtotal - discount + taxAmount;
  } else {
    if (data.discount !== undefined) invoiceUpdate.discount = data.discount;
    if (data.tax_percent !== undefined) invoiceUpdate.tax_percent = data.tax_percent;
  }

  await supabase.from("invoices").update(invoiceUpdate).eq("id", id);

  if (data.line_items) {
    await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
    await supabase.from("invoice_line_items").insert(
      data.line_items.map((item, i) => ({
        invoice_id: id,
        description: item.description,
        hsn_sac: item.hsn_sac || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
        position: i,
      }))
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("invoices").update({ status }).eq("id", id);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  await supabase.from("invoices").update({ status: "cancelled" }).eq("id", id);
  revalidatePath("/invoices");
}

export async function getInvoices(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(`*, lead:leads(id, name, company), line_items:invoice_line_items(*)`)
    .eq("organization_id", orgId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(`*, lead:leads(id, name, company, email, phone), line_items:invoice_line_items(*), org:organizations(*)`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
