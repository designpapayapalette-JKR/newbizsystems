import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Download, Eye, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:     { label: "Draft",     className: "bg-gray-100 text-gray-600 border-gray-200" },
  sent:      { label: "Sent",      className: "bg-blue-100 text-blue-700 border-blue-200" },
  paid:      { label: "Paid",      className: "bg-green-100 text-green-700 border-green-200" },
  partial:   { label: "Partial",   className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  overdue:   { label: "Overdue",   className: "bg-red-100 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-400 border-gray-200" },
};

export default async function LeadInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/onboarding");

  const [leadResult, invoicesResult] = await Promise.all([
    supabase.from("leads").select("id, name").eq("id", id).single(),
    supabase
      .from("invoices")
      .select("*, line_items:invoice_line_items(*)")
      .eq("lead_id", id)
      .eq("organization_id", profile.current_org_id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false }),
  ]);

  if (!leadResult.data) notFound();
  const lead = leadResult.data;
  const invoices = invoicesResult.data ?? [];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={`${lead.name} — Invoices`}
        actions={
          <Button asChild size="sm">
            <Link href={`/invoices/new?lead_id=${id}`}>
              <Plus className="h-4 w-4" /> New Invoice
            </Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4">
        <Link href={`/leads/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Lead
        </Link>

        {invoices.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices yet" description="Create an invoice for this lead" />
        ) : (
          <div className="space-y-2 max-w-3xl">
            {invoices.map((inv) => {
              const cfg = statusConfig[inv.status] ?? statusConfig.draft;
              return (
                <div key={inv.id} className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-sm hover:text-primary">
                        {inv.invoice_number}
                      </Link>
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                    </div>
                    {inv.title && <p className="text-sm text-muted-foreground">{inv.title}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span>Issued: {formatDate(inv.issue_date)}</span>
                      {inv.due_date && <span>Due: {formatDate(inv.due_date)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(inv.total, inv.currency)}</span>
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
              );
            })}
            <div className="pt-2 border-t text-sm font-semibold flex justify-between max-w-3xl">
              <span>Total invoiced</span>
              <span>{formatCurrency(invoices.reduce((s, i) => s + i.total, 0), invoices[0]?.currency ?? "INR")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
