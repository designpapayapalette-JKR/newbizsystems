import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  paid:     { label: "Paid",     className: "bg-green-100 text-green-700 border-green-200" },
  partial:  { label: "Partial",  className: "bg-blue-100 text-blue-700 border-blue-200" },
  overdue:  { label: "Overdue",  className: "bg-red-100 text-red-700 border-red-200" },
  refunded: { label: "Refunded", className: "bg-gray-100 text-gray-600 border-gray-200" },
  failed:   { label: "Failed",   className: "bg-red-100 text-red-600 border-red-200" },
};

export default async function LeadPaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const [leadResult, paymentsResult, invoicesResult] = await Promise.all([
    supabase.from("leads").select("id, name").eq("id", id).single(),
    supabase
      .from("payments")
      .select("*, invoice:invoices(id, invoice_number, total)")
      .eq("lead_id", id)
      .eq("organization_id", profile.current_org_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, total")
      .eq("lead_id", id)
      .eq("organization_id", profile.current_org_id)
      .neq("status", "cancelled"),
  ]);

  if (!leadResult.data) notFound();
  const lead = leadResult.data;
  const payments = paymentsResult.data ?? [];
  const invoices = invoicesResult.data ?? [];

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={`${lead.name} — Payments`}
        actions={
          <PaymentFormDialog
            leads={[lead]}
            invoices={invoices}
            defaultLeadId={id}
          />
        }
      />
      <div className="flex-1 overflow-y-auto p-4">
        <Link href={`/CRM/leads/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Lead
        </Link>

        {payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments yet" description="Record a payment for this lead" />
        ) : (
          <div className="space-y-2 max-w-3xl">
            {payments.map((p) => {
              const cfg = statusConfig[p.status] ?? statusConfig.pending;
              return (
                <div key={p.id} className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{formatCurrency(p.amount, p.currency)}</span>
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                      {p.payment_method && (
                        <span className="text-xs text-muted-foreground capitalize">{p.payment_method.replace(/_/g, " ")}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {(p as any).invoice && (
                        <Link href={`/CRM/invoices/${(p as any).invoice.id}`} className="hover:text-primary">
                          {(p as any).invoice.invoice_number}
                        </Link>
                      )}
                      {p.due_date && <span>Due: {formatDate(p.due_date)}</span>}
                      {p.paid_at && <span>Paid: {formatDate(p.paid_at)}</span>}
                      {p.reference_number && <span>Ref: {p.reference_number}</span>}
                    </div>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                  </div>
                </div>
              );
            })}
            {totalPaid > 0 && (
              <div className="pt-2 border-t text-sm font-semibold flex justify-between max-w-3xl">
                <span>Total received</span>
                <span className="text-green-700">{formatCurrency(totalPaid, payments[0]?.currency ?? "INR")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
