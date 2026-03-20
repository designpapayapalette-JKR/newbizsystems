"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";

export interface LineItemData {
  description: string;
  hsn_sac?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number; // GST rate per item
}

export interface InvoiceFormData {
  lead_id?: string;
  title?: string;
  issue_date: string;
  due_date?: string;
  discount?: number;
  tax_percent?: number; // This will now represent the average or total tax for backward compatibility if needed, but we'll use per-item tax.
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

  // Fetch org and lead for GST validation
  const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();
  const { data: lead } = data.lead_id 
    ? await supabase.from("leads").select("*").eq("id", data.lead_id).single()
    : { data: null };

  const currency = data.currency ?? "INR";
  
  // Strict GST Validation for INR
  if (currency === "INR") {
    if (!org?.gstin) throw new Error("Organization GSTIN is required for INR invoices. Please update in Settings.");
    if (!lead?.gstin) throw new Error("Lead/Client GSTIN is required for INR invoices. Please update Lead details.");
  }

  const subtotal = data.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discount = data.discount ?? 0;
  
  // Per-item GST Calculation
  let totalTaxAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const processedItems = data.line_items.map(item => {
    const itemSubtotal = item.quantity * item.unit_price;
    // Apply discount proportionally to each item for tax calculation
    const itemDiscount = subtotal > 0 ? (itemSubtotal / subtotal) * discount : 0;
    const itemTaxableValue = itemSubtotal - itemDiscount;
    const itemTaxRate = item.tax_rate ?? 0;
    const itemTaxAmount = (itemTaxableValue * itemTaxRate) / 100;

    let itemCgst = 0, itemSgst = 0, itemIgst = 0;
    if (currency === "INR" && itemTaxAmount > 0) {
      if (org?.state_code === lead?.state_code) {
        itemCgst = itemTaxAmount / 2;
        itemSgst = itemTaxAmount / 2;
      } else {
        itemIgst = itemTaxAmount;
      }
    }

    totalTaxAmount += itemTaxAmount;
    totalCgst += itemCgst;
    totalSgst += itemSgst;
    totalIgst += itemIgst;

    return {
      ...item,
      amount: itemSubtotal,
      tax_amount: itemTaxAmount,
      cgst_amount: itemCgst,
      sgst_amount: itemSgst,
      igst_amount: itemIgst
    };
  });

  const total = (subtotal - discount) + totalTaxAmount;
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
      tax_percent: subtotal > 0 ? (totalTaxAmount / (subtotal - discount)) * 100 : 0, // Average tax percentage
      tax_amount: totalTaxAmount,
      cgst_amount: totalCgst,
      sgst_amount: totalSgst,
      igst_amount: totalIgst,
      subtotal,
      total,
      notes: data.notes,
      terms: data.terms,
      currency,
    })
    .select()
    .single();

  if (error) throw error;

  const lineItems = processedItems.map((item, i) => ({
    invoice_id: invoice.id,
    description: item.description,
    hsn_sac: item.hsn_sac || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.amount,
    tax_rate: item.tax_rate || 0,
    tax_amount: item.tax_amount,
    cgst_amount: item.cgst_amount,
    sgst_amount: item.sgst_amount,
    igst_amount: item.igst_amount,
    position: i,
  }));

  await supabase.from("invoice_line_items").insert(lineItems);

  revalidatePath("/CRM/invoices");
  return invoice;
}

export async function updateInvoice(id: string, data: Partial<InvoiceFormData>) {
  const supabase = await createClient();
  const { orgId } = await getOrgId();

  const invoiceUpdate: Record<string, unknown> = {};
  if (data.lead_id !== undefined) invoiceUpdate.lead_id = data.lead_id;
  if (data.title !== undefined) invoiceUpdate.title = data.title;
  if (data.issue_date !== undefined) invoiceUpdate.issue_date = data.issue_date;
  if (data.due_date !== undefined) invoiceUpdate.due_date = data.due_date;
  if (data.notes !== undefined) invoiceUpdate.notes = data.notes;
  if (data.terms !== undefined) invoiceUpdate.terms = data.terms;

  if (data.line_items !== undefined || data.tax_percent !== undefined || data.discount !== undefined) {
    // Re-fetch current invoice to get existing values for calculation if not provided
    const { data: current } = await supabase.from("invoices").select("*").eq("id", id).single();
    
    // Fetch org and lead for recalculation
    const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();
    const lId = data.lead_id ?? current.lead_id;
    const { data: lead } = lId ? await supabase.from("leads").select("*").eq("id", lId).single() : { data: null };

    const items = data.line_items ?? [];
    const subtotal = data.line_items ? items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) : current.subtotal;
    const discount = data.discount ?? current.discount;
    const currency = data.currency ?? current.currency;

    let totalTaxAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const processedItems = items.map(item => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = subtotal > 0 ? (itemSubtotal / subtotal) * discount : 0;
      const itemTaxableValue = itemSubtotal - itemDiscount;
      const itemTaxRate = item.tax_rate ?? 0;
      const itemTaxAmount = (itemTaxableValue * itemTaxRate) / 100;

      let itemCgst = 0, itemSgst = 0, itemIgst = 0;
      if (currency === "INR" && itemTaxAmount > 0) {
        if (org?.state_code === lead?.state_code) {
          itemCgst = itemTaxAmount / 2;
          itemSgst = itemTaxAmount / 2;
        } else {
          itemIgst = itemTaxAmount;
        }
      }

      totalTaxAmount += itemTaxAmount;
      totalCgst += itemCgst;
      totalSgst += itemSgst;
      totalIgst += itemIgst;

      return {
        ...item,
        amount: itemSubtotal,
        tax_amount: itemTaxAmount,
        cgst_amount: itemCgst,
        sgst_amount: itemSgst,
        igst_amount: itemIgst
      };
    });

    invoiceUpdate.subtotal = subtotal;
    invoiceUpdate.discount = discount;
    invoiceUpdate.tax_amount = totalTaxAmount;
    invoiceUpdate.cgst_amount = totalCgst;
    invoiceUpdate.sgst_amount = totalSgst;
    invoiceUpdate.igst_amount = totalIgst;
    invoiceUpdate.tax_percent = subtotal > 0 ? (totalTaxAmount / (subtotal - discount)) * 100 : 0;
    invoiceUpdate.total = (subtotal - discount) + totalTaxAmount;

    if (data.line_items) {
      await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
      await supabase.from("invoice_line_items").insert(
        processedItems.map((item, i) => ({
          invoice_id: id,
          description: item.description,
          hsn_sac: item.hsn_sac || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          tax_rate: item.tax_rate || 0,
          tax_amount: item.tax_amount,
          cgst_amount: item.cgst_amount,
          sgst_amount: item.sgst_amount,
          igst_amount: item.igst_amount,
          position: i,
        }))
      );
    }
  }

  if (Object.keys(invoiceUpdate).length > 0) {
    const { error } = await supabase.from("invoices").update(invoiceUpdate).eq("id", id);
    if (error) throw error;
  }

  revalidatePath("/CRM/invoices");
  revalidatePath(`/CRM/invoices/${id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("invoices").update({ status }).eq("id", id);
  revalidatePath("/CRM/invoices");
  revalidatePath(`/CRM/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  await supabase.from("invoices").update({ status: "cancelled" }).eq("id", id);
  revalidatePath("/CRM/invoices");
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
