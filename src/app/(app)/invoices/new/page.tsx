import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ lead_id?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/onboarding");

  const sp = await searchParams;

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, company, gstin, state, state_code")
    .eq("organization_id", profile.current_org_id)
    .eq("is_archived", false)
    .order("name");

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, gstin, state, state_code, currency")
    .eq("id", profile.current_org_id)
    .single();

  const backHref = sp.lead_id ? `/leads/${sp.lead_id}/invoices` : "/invoices";

  return (
    <div className="flex flex-col h-full">
      <TopBar title="New Invoice" />
      <div className="flex-1 overflow-y-auto p-4">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <InvoiceBuilder 
          leads={leads ?? []} 
          defaultLeadId={sp.lead_id} 
          organization={org as any}
        />
      </div>
    </div>
  );
}
