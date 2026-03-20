import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiatePhonePePayment } from "@/lib/phonepe/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentId, amount, currency, phone } = await req.json();
  if (!paymentId || !amount) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/CRM/payments/${paymentId}?status=return`;

  const result = await initiatePhonePePayment({
    merchantOrderId: paymentId,
    amount: Math.round(amount * 100), // paise
    redirectUrl,
    mobileNumber: phone,
    userId: user.id,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Store PhonePe order ID and payment URL on the payment record
  await supabase.from("payments").update({
    phonepe_order_id: paymentId,
    payment_url: result.paymentUrl,
  }).eq("id", paymentId);

  return NextResponse.json({ paymentUrl: result.paymentUrl });
}
