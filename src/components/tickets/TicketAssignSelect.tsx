"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicket } from "@/actions/tickets";
import { toast } from "sonner";
import { User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TicketAssignSelectProps {
  ticketId: string;
  currentAssigneeId?: string;
  members: any[];
}

export function TicketAssignSelect({
  ticketId,
  currentAssigneeId,
  members,
}: TicketAssignSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAssign(userId: string) {
    setLoading(true);
    try {
      await updateTicket(ticketId, { 
        assigned_to: userId === "unassigned" ? (null as any) : userId 
      });
      toast.success(userId === "unassigned" ? "Ticket unassigned" : "Ticket assigned");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update assignment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Select
        disabled={loading}
        value={currentAssigneeId || "unassigned"}
        onValueChange={handleAssign}
      >
        <SelectTrigger className="w-full h-9">
          <div className="flex items-center gap-2 truncate">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground mr-1" />
            ) : (
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <SelectValue placeholder="Unassigned" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.user_id} value={m.user_id}>
              {m.profile?.full_name || m.profile?.email || "Team Member"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
