import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getInvoiceById } from "@/actions/invoices";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InvoiceStatusUpdater } from "@/components/invoices/InvoiceStatusUpdater";

const statusColors: Record<string, string> = {
  draft: "secondary", sent: "info", paid: "success", partial: "warning", overdue: "destructive", cancelled: "outline"
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const invoice = await getInvoiceById(id).catch(() => null);
  if (!invoice) notFound();

  const lineItems = ((invoice as any).line_items ?? []).sort((a: any, b: any) => a.position - b.position);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={invoice.invoice_number}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/invoices/${id}/preview`}>
                <Eye className="h-4 w-4" /> Preview
              </Link>
            </Button>
            <Button asChild size="sm">
              <a href={`/api/invoices/${id}/pdf`} download={`${invoice.invoice_number}.pdf`}>
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-4">
        <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </Link>

        <div className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>{invoice.invoice_number}</CardTitle>
                  {invoice.title && <p className="text-muted-foreground mt-1">{invoice.title}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={(statusColors[invoice.status] as any) ?? "secondary"} className="capitalize">
                    {invoice.status}
                  </Badge>
                  <InvoiceStatusUpdater invoiceId={invoice.id} currentStatus={invoice.status as any} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              {(invoice as any).lead && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Bill To</p>
                  <p className="font-medium">{(invoice as any).lead.name}</p>
                  {(invoice as any).lead.company && <p className="text-muted-foreground">{(invoice as any).lead.company}</p>}
                </div>
              )}
              <div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Issue Date</p>
                    <p>{formatDate(invoice.issue_date)}</p>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <p className="text-muted-foreground text-xs">Due Date</p>
                      <p>{formatDate(invoice.due_date)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardContent className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 font-medium text-muted-foreground">Description</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">Unit Price</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.unit_price, invoice.currency)}</td>
                      <td className="py-2 text-right">{formatCurrency(item.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 border-t pt-4 space-y-1.5 ml-auto max-w-xs">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>- {formatCurrency(invoice.discount, invoice.currency)}</span>
                  </div>
                )}
                {invoice.tax_percent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({invoice.tax_percent}%)</span>
                    <span>+ {formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1.5">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(invoice.notes || invoice.terms) && (
            <Card>
              <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-sm">
                {invoice.notes && (
                  <div>
                    <p className="font-medium mb-1">Notes</p>
                    <p className="text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="font-medium mb-1">Terms</p>
                    <p className="text-muted-foreground">{invoice.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
