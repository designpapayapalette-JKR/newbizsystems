"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicket } from "@/actions/tickets";
import { toast } from "sonner";
import type { TicketStatus } from "@/types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

interface TicketStatusSelectProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

export function TicketStatusSelect({ ticketId, currentStatus }: TicketStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(value: string) {
    const newStatus = value as TicketStatus;
    setStatus(newStatus);
    setLoading(true);
    try {
      await updateTicket(ticketId, { status: newStatus });
      toast.success("Status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-36 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
