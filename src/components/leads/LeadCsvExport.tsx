"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Lead } from "@/types";

export function LeadCsvExport({ leads }: { leads: Lead[] }) {
  function exportCsv() {
    const headers = ["Name","Email","Phone","Company","Source","Priority","Deal Value","Currency","Stage","Tags","Next Follow-up","Notes","Created At"];
    const rows = leads.map((l) => [
      l.name,
      l.email ?? "",
      l.phone ?? "",
      l.company ?? "",
      l.source ?? "",
      l.priority ?? "",
      l.deal_value ?? "",
      l.currency,
      l.stage?.name ?? "",
      (l.tags ?? []).join(";"),
      l.next_followup_at ?? "",
      (l.notes ?? "").replace(/\n/g," "),
      l.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1">
      <Download className="h-4 w-4" /> Export
    </Button>
  );
}
