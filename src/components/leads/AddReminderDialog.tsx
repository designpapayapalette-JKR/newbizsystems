"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { createReminder } from "@/actions/reminders";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";

const QUICK_PRESETS = [
  { label: "📞 Call Back", title: "Call back" },
  { label: "💰 Payment Follow-up", title: "Follow up on payment" },
  { label: "📄 Send Proposal", title: "Send proposal" },
  { label: "🤝 Follow Up", title: "Follow up" },
  { label: "📦 Demo / Meeting", title: "Schedule demo" },
  { label: "✅ Check In", title: "Check in with lead" },
];

// Default to tomorrow at 10 AM
function defaultDueAt() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function AddReminderDialog({
  leadId,
  leadName,
  trigger,
}: {
  leadId: string;
  leadName: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState(defaultDueAt);

  function applyPreset(preset: { title: string }) {
    setTitle(`${preset.title} — ${leadName}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Enter a reminder title"); return; }
    setLoading(true);
    try {
      await createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        due_at: new Date(dueAt).toISOString(),
        lead_id: leadId,
      });
      toast.success("Reminder set");
      setOpen(false);
      setTitle("");
      setDescription("");
      setDueAt(defaultDueAt());
      router.refresh();
    } catch {
      toast.error("Failed to set reminder");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1">
            <Bell className="h-4 w-4" />
            Set Reminder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Reminder for {leadName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick presets */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Quick presets</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors bg-white"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reminder Title *</Label>
            <Input
              placeholder="e.g. Follow up on payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date & Time *</Label>
            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Set Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
