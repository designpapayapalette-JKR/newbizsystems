import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { InvoicePreviewClient } from "@/components/invoices/InvoicePreviewClient";
import { TopBar } from "@/components/layout/TopBar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, invoice_number, org:organizations(invoice_template)")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const orgRaw = (invoice as any).org;
  const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
  const defaultTemplate = org?.invoice_template ?? "classic";

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Invoice Preview" />
      <div className="flex-1 overflow-y-auto p-4">
        <Link href={`/invoices/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <InvoicePreviewClient invoiceId={id} invoiceNumber={invoice.invoice_number} defaultTemplate={defaultTemplate} />
      </div>
    </div>
  );
}
