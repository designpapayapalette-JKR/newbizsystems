"use client";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInvoiceStatus } from "@/actions/invoices";
import { toast } from "sonner";
import type { InvoiceStatus } from "@/types";

const statuses: InvoiceStatus[] = ["draft", "sent", "paid", "partial", "overdue", "cancelled"];

export function InvoiceStatusUpdater({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: InvoiceStatus }) {
  const router = useRouter();

  async function handleChange(status: string) {
    await updateInvoiceStatus(invoiceId, status);
    toast.success("Invoice status updated");
    router.refresh();
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-32 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
