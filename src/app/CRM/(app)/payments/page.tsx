import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPayments } from "@/actions/payments";
import { TopBar } from "@/components/layout/TopBar";
import { PaymentList } from "@/components/payments/PaymentList";
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreditCard } from "lucide-react";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  // Only admin/owner can access payments
  const { data: memberRow } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", profile.current_org_id)
    .eq("user_id", user.id)
    .single();
  if (!memberRow || memberRow.role === "member") redirect("/CRM/dashboard");

  const [payments, leadsResult, invoicesResult] = await Promise.all([
    getPayments(profile.current_org_id),
    supabase.from("leads").select("id, name").eq("organization_id", profile.current_org_id).eq("is_archived", false).order("name"),
    supabase.from("invoices").select("id, invoice_number, total").eq("organization_id", profile.current_org_id).neq("status", "cancelled"),
  ]);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Payments"
        actions={
          <PaymentFormDialog
            leads={leadsResult.data ?? []}
            invoices={invoicesResult.data ?? []}
          />
        }
      />
      <div className="flex-1 overflow-y-auto p-4">
        {payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments yet" description="Track payments from your clients here" />
        ) : (
          <PaymentList payments={payments as any[]} leads={leadsResult.data ?? []} invoices={invoicesResult.data ?? []} />
        )}
      </div>
    </div>
  );
}
