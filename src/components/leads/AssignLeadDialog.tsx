"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserPlus, Loader2, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Member {
  user_id: string;
  profile: { full_name?: string | null; avatar_url?: string | null } | null;
}

interface AssignLeadDialogProps {
  leadId: string;
  currentAssigneeId: string | null;
  members: Member[];
}

export function AssignLeadDialog({ leadId, currentAssigneeId, members }: AssignLeadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAssign(userId: string | null) {
    setLoading(userId ?? "unassign");
    try {
      await assignLead(leadId, userId);
      toast.success(userId ? "Lead assigned" : "Lead unassigned");
      router.refresh();
      setOpen(false);
    } catch {
      toast.error("Failed to update assignment");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {members.map((m) => {
            const name = m.profile?.full_name ?? "Member";
            const isSelected = m.user_id === currentAssigneeId;
            const isLoading = loading === m.user_id;
            return (
              <button
                key={m.user_id}
                onClick={() => handleAssign(isSelected ? null : m.user_id)}
                disabled={!!loading}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-gray-100 text-gray-800"
                )}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px]">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium">{name}</span>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSelected && !isLoading && (
                  <span className="text-xs opacity-80">Assigned · click to remove</span>
                )}
              </button>
            );
          })}

          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No team members found.
            </p>
          )}

          {currentAssigneeId && (
            <div className="pt-2 border-t">
              <button
                onClick={() => handleAssign(null)}
                disabled={!!loading}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                {loading === "unassign" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Remove assignment
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
