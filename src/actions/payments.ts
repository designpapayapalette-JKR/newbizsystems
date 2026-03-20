"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrgId } from "./leads";
import type { PaymentStatus, PaymentMethod } from "@/types";

export interface PaymentFormData {
  lead_id?: string;
  invoice_id?: string;
  amount: number;
  currency?: string;
  payment_method?: PaymentMethod;
  reference_number?: string;
  due_date?: string;
  notes?: string;
}

export async function createPayment(data: PaymentFormData) {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ ...data, organization_id: orgId, created_by: userId, status: "pending", currency: data.currency ?? "INR" })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/ERP/payments");
  return payment;
}

export async function updatePayment(id: string, data: Partial<PaymentFormData>) {
  const supabase = await createClient();
  
  const { data: payment, error } = await supabase
    .from("payments")
    .update({ ...data })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/ERP/payments");
  revalidatePath(`/ERP/payments/${id}`);
  return payment;
}

export async function markPaymentPaid(id: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: payment } = await supabase.from("payments").update({ status: "paid", paid_at: now }).eq("id", id).select().single();

  // Check if linked invoice is fully paid
  if (payment?.invoice_id) {
    const { data: allPayments } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("invoice_id", payment.invoice_id)
      .eq("status", "paid");

    const { data: invoice } = await supabase.from("invoices").select("total").eq("id", payment.invoice_id).single();

    if (invoice && allPayments) {
      const paid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      if (paid >= invoice.total) {
        await supabase.from("invoices").update({ status: "paid" }).eq("id", payment.invoice_id);
      } else if (paid > 0) {
        await supabase.from("invoices").update({ status: "partial" }).eq("id", payment.invoice_id);
      }
    }
  }

  revalidatePath("/ERP/payments");
  revalidatePath("/ERP/invoices");
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  const supabase = await createClient();
  await supabase.from("payments").update({ status }).eq("id", id);
  revalidatePath("/ERP/payments");
}

export async function deletePayment(id: string) {
  const supabase = await createClient();
  await supabase.from("payments").delete().eq("id", id);
  revalidatePath("/ERP/payments");
}

export async function getPayments(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(`*, lead:leads(id, name, company), invoice:invoices(id, invoice_number, total)`)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
