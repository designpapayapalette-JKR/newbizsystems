"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTicket } from "@/actions/tickets";
import { toast } from "sonner";

export function DeleteTicketButton({ id, ticketNumber }: { id: string, ticketNumber: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ticket ${ticketNumber}?`)) return;
    setLoading(true);
    try {
      await deleteTicket(id);
      toast.success("Ticket deleted");
      router.push("/ERP/tickets");
    } catch {
      toast.error("Failed to delete ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete} 
      disabled={loading}
      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors h-8 w-8"
      title="Delete Ticket"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
