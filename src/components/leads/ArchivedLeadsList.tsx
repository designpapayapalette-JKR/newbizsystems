"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { restoreLead } from "@/actions/leads";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Lead } from "@/types";

export function ArchivedLeadsList({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState<string | null>(null);

  async function handleRestore(id: string) {
    setRestoring(id);
    try {
      await restoreLead(id);
      toast.success("Lead restored");
      router.refresh();
    } catch { toast.error("Failed to restore"); }
    finally { setRestoring(null); }
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <div key={lead.id} className="bg-white border rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{lead.name}</p>
            {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
            <p className="text-xs text-muted-foreground mt-0.5">
              {lead.deal_value ? formatCurrency(lead.deal_value) + " · " : ""}
              Archived {formatDate(lead.updated_at)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={restoring === lead.id}
            onClick={() => handleRestore(lead.id)}
          >
            {restoring === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Restore
          </Button>
        </div>
      ))}
    </div>
  );
}
