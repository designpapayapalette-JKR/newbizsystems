"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { assignTask } from "@/actions/team";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ClipboardList, Loader2 } from "lucide-react";

interface Member {
  user_id: string;
  profile: { full_name?: string | null; avatar_url?: string | null } | null;
}

interface AssignTaskDialogProps {
  members: Member[];
  orgId: string;
  leads?: { id: string; name: string }[];
  defaultAssignedTo?: string;
  trigger?: React.ReactNode;
}

export function AssignTaskDialog({ members, orgId, leads = [], defaultAssignedTo, trigger }: AssignTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [assignedTo, setAssignedTo] = useState(defaultAssignedTo ?? "");
  const [leadId, setLeadId] = useState("");
  const [dueAt, setDueAt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assignedTo) return;
    setLoading(true);
    try {
      await assignTask({
        title: title.trim(),
        body: body.trim() || undefined,
        assigned_to: assignedTo,
        lead_id: leadId || undefined,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
        organization_id: orgId,
      });
      toast.success("Task assigned");
      setOpen(false);
      setTitle("");
      setBody("");
      setLeadId("");
      setDueAt("");
      router.refresh();
    } catch {
      toast.error("Failed to assign task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Assign Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task to Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Assign To *</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.profile?.full_name ?? getInitials(m.profile?.full_name) ?? m.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Task Title *</Label>
            <Input
              placeholder="e.g. Follow up with client, Prepare proposal..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Task details, instructions..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {leads.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Lead</Label>
                <Select value={leadId || "none"} onValueChange={(v) => setLeadId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lead</SelectItem>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !assignedTo || !title.trim()}>
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
            Assign Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
