"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { markPaymentPaid } from "@/actions/payments";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Payment, PaymentStatus } from "@/types";

const statusConfig: Record<PaymentStatus, { label: string; variant: any }> = {
  pending: { label: "Pending", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "info" },
  overdue: { label: "Overdue", variant: "destructive" },
  refunded: { label: "Refunded", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
};

export function PaymentList({ payments }: { payments: Payment[] }) {
  const router = useRouter();

  async function handleMarkPaid(id: string) {
    await markPaymentPaid(id);
    toast.success("Payment marked as paid");
    router.refresh();
  }

  async function handleSendLink(payment: Payment) {
    const res = await fetch("/api/phonepe/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.id, amount: payment.amount, currency: payment.currency }),
    });
    const data = await res.json();
    if (data.paymentUrl) {
      window.open(data.paymentUrl, "_blank");
    } else {
      toast.error(data.error ?? "Failed to generate payment link");
    }
  }

  async function handleCopyLink(payment: Payment) {
    if (payment.payment_url) {
      await navigator.clipboard.writeText(payment.payment_url);
      toast.success("Payment link copied!");
    } else {
      await handleSendLink(payment);
    }
  }

  return (
    <div className="space-y-2">
      {payments.map((p) => {
        const config = statusConfig[p.status] ?? statusConfig.pending;
        return (
          <div key={p.id} className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm">{formatCurrency(p.amount, p.currency)}</span>
                <Badge variant={config.variant}>{config.label}</Badge>
                {p.payment_method && (
                  <span className="text-xs text-muted-foreground capitalize">{p.payment_method.replace(/_/g, " ")}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {(p as any).lead && (
                  <Link href={`/leads/${(p as any).lead.id}`} className="hover:text-primary">{(p as any).lead.name}</Link>
                )}
                {(p as any).invoice && (
                  <Link href={`/invoices/${(p as any).invoice.id}`} className="hover:text-primary">{(p as any).invoice.invoice_number}</Link>
                )}
                {p.due_date && <span>Due: {formatDate(p.due_date)}</span>}
                {p.paid_at && <span>Paid: {formatDate(p.paid_at)}</span>}
                {p.reference_number && <span>Ref: {p.reference_number}</span>}
              </div>
              {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {p.status === "pending" && (
                <>
                  <Button variant="outline" size="sm" className="gap-1 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleMarkPaid(p.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Paid
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleSendLink(p)}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Pay via PhonePe
                  </Button>
                  {p.payment_url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyLink(p)} title="Copy link">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
