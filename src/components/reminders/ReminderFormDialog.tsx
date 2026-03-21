"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createReminder, updateReminder } from "@/actions/reminders";
import { toast } from "sonner";
import { Plus, Loader2, Pencil } from "lucide-react";

interface ReminderFormDialogProps {
  reminder?: any;
  leadId?: string;
  trigger?: React.ReactNode;
}

export function ReminderFormDialog({ reminder, leadId, trigger }: ReminderFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(reminder?.title || "");
  const [description, setDescription] = useState(reminder?.description || "");
  const [dueAt, setDueAt] = useState(reminder?.due_at ? new Date(reminder.due_at).toISOString().slice(0, 16) : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueAt) return;
    setLoading(true);
    try {
      if (reminder) {
        await updateReminder(reminder.id, {
          title,
          description: description || undefined,
          due_at: new Date(dueAt).toISOString()
        });
        toast.success("Reminder updated");
      } else {
        await createReminder({ title, description: description || undefined, due_at: new Date(dueAt).toISOString(), lead_id: leadId });
        toast.success("Reminder set");
      }
      setOpen(false);
      if (!reminder) {
        setTitle("");
        setDescription("");
        setDueAt("");
      }
      router.refresh();
    } catch {
      toast.error(reminder ? "Failed to update" : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (reminder ? (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reminder ? "Edit Reminder" : "Set Reminder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. Follow up with client" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Due Date & Time *</Label>
            <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required min={reminder ? undefined : new Date().toISOString().slice(0, 16)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Additional context..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !title.trim() || !dueAt}>
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            {reminder ? "Update Reminder" : "Set Reminder"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
