import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getInvoiceById } from "@/actions/invoices";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const resolvedParams = await params;
  const invoiceId = resolvedParams.id;

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice || invoice.organization_id !== profile.current_org_id) {
    redirect("/CRM/invoices");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, company, gstin, state, state_code")
    .eq("organization_id", profile.current_org_id)
    .order("name");

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, gstin, state, state_code, currency")
    .eq("id", profile.current_org_id)
    .single();

  return (
    <div className="flex flex-col h-full">
      <TopBar title={`Edit Invoice ${invoice.invoice_number}`} />
      <div className="flex-1 overflow-y-auto p-4">
        <Link href={`/CRM/invoices/${invoice.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Invoice
        </Link>
        <InvoiceBuilder 
          leads={leads ?? []} 
          organization={org as any}
          invoice={invoice}
        />
      </div>
    </div>
  );
}
