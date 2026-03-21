import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyWebhookChecksum } from "@/lib/phonepe/checksum";

const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_KEY_INDEX ?? "1";

export async function POST(req: NextRequest) {
  // Read raw body
  const rawBody = await req.text();
  const receivedChecksum = req.headers.get("X-VERIFY") ?? "";

  let parsed: any;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { response: base64Response } = parsed;
  if (!base64Response) return NextResponse.json({ error: "Missing response" }, { status: 400 });

  // Verify checksum
  const isValid = verifyWebhookChecksum(base64Response, receivedChecksum, SALT_KEY, SALT_INDEX);
  if (!isValid) {
    console.error("PhonePe webhook: invalid checksum");
    return NextResponse.json({ error: "Invalid checksum" }, { status: 400 });
  }

  // Decode payload
  let txnData: any;
  try {
    txnData = JSON.parse(Buffer.from(base64Response, "base64").toString("utf-8"));
  } catch {
    return NextResponse.json({ error: "Cannot decode response" }, { status: 400 });
  }

  const { code, data } = txnData;
  const isSuccess = code === "PAYMENT_SUCCESS";
  const merchantOrderId = data?.merchantTransactionId;
  const phonePeTxnId = data?.transactionId;
  const amountPaise = data?.amount;

  if (!merchantOrderId) {
    return NextResponse.json({ message: "No order ID" }, { status: 200 });
  }

  const supabase = await createServiceClient();

  // Update payment record (idempotent)
  const newStatus = isSuccess ? "paid" : "failed";
  const { data: payment } = await supabase
    .from("payments")
    .update({
      status: newStatus,
      phonepe_txn_id: phonePeTxnId,
      paid_at: isSuccess ? new Date().toISOString() : null,
    })
    .eq("id", merchantOrderId)
    .select("invoice_id, amount")
    .maybeSingle();

  // If paid and linked to invoice, update invoice status
  if (isSuccess && payment?.invoice_id) {
    const { data: allPaidPayments } = await supabase
      .from("payments")
      .select("amount")
      .eq("invoice_id", payment.invoice_id)
      .eq("status", "paid");

    const { data: invoice } = await supabase
      .from("invoices")
      .select("total")
      .eq("id", payment.invoice_id)
      .maybeSingle();

    if (invoice && allPaidPayments) {
      const totalPaid = allPaidPayments.reduce((s: number, p: any) => s + p.amount, 0);
      const invoiceStatus = totalPaid >= invoice.total ? "paid" : totalPaid > 0 ? "partial" : "sent";
      await supabase.from("invoices").update({ status: invoiceStatus }).eq("id", payment.invoice_id);
    }
  }

  return NextResponse.json({ success: true });
}
