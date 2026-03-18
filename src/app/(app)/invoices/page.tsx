import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getInvoices } from "@/actions/invoices";
import { TopBar } from "@/components/layout/TopBar";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/onboarding");

  // Only admin/owner can access invoices
  const { data: memberRow } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", profile.current_org_id)
    .eq("user_id", user.id)
    .single();
  if (!memberRow || memberRow.role === "member") redirect("/dashboard");

  const invoices = await getInvoices(profile.current_org_id);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Invoices"
        actions={
          <Button asChild size="sm">
            <Link href="/invoices/new">+ New Invoice</Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4">
        {invoices.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices yet" description="Create your first invoice to start billing clients" />
        ) : (
          <InvoiceList invoices={invoices as any[]} />
        )}
      </div>
    </div>
  );
}
