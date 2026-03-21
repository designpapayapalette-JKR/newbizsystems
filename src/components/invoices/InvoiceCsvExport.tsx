"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InvoiceCsvExport({ invoices }: { invoices: any[] }) {
  function exportCsv() {
    const headers = ["Invoice #", "Title", "Total", "Status", "Issue Date", "Due Date", "Lead/Client"];
    const rows = invoices.map((i) => [
      i.invoice_number,
      i.title ?? "",
      i.total,
      i.status,
      i.issue_date,
      i.due_date ?? "",
      i.lead?.name ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
      <Download className="h-4 w-4" /> Export
    </Button>
  );
}
