"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Eye } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types";

const statusConfig: Record<InvoiceStatus, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "info" },
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="space-y-2">
      {invoices.map((inv) => {
        const config = statusConfig[inv.status] ?? statusConfig.draft;
        return (
          <div key={inv.id} className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/invoices/${inv.id}`} className="font-medium text-sm hover:text-primary">
                  {inv.invoice_number}
                </Link>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              {inv.title && <p className="text-sm text-muted-foreground mb-1">{inv.title}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {(inv as any).lead && <span>{(inv as any).lead.name}</span>}
                <span>Issued: {formatDate(inv.issue_date)}</span>
                {inv.due_date && <span>Due: {formatDate(inv.due_date)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatCurrency(inv.total, inv.currency)}</span>
              <div className="flex gap-1">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={`/invoices/${inv.id}/preview`} title="Preview">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <a href={`/api/invoices/${inv.id}/pdf`} download={`${inv.invoice_number}.pdf`} title="Download PDF">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
