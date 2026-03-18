"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { logActivity } from "@/actions/activities";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import type { ActivityType } from "@/types";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "📞 Call" },
  { value: "email", label: "📧 Email" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "sms", label: "📱 SMS" },
  { value: "note", label: "📝 Note" },
  { value: "meeting", label: "🤝 Meeting" },
  { value: "task", label: "✅ Task" },
];

export function LogActivityDialog({
  leadId,
  trigger,
  defaultType,
}: {
  leadId?: string;
  trigger?: React.ReactNode;
  defaultType?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ActivityType>((defaultType as ActivityType) ?? "note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [outcome, setOutcome] = useState("");
  const [duration, setDuration] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (val) {
      // Re-apply defaultType when reopening
      setType((defaultType as ActivityType) ?? "note");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !title.trim()) return;
    setLoading(true);
    try {
      if (leadId) {
        await logActivity(leadId, {
          type,
          title: title || undefined,
          body: body || undefined,
          outcome: outcome || undefined,
          duration_mins: duration ? parseInt(duration) : undefined,
          occurred_at: new Date(occurredAt).toISOString(),
        });
      } else {
        toast.error("No lead selected");
        setLoading(false);
        return;
      }
      toast.success("Activity logged");
      setOpen(false);
      setBody("");
      setTitle("");
      setOutcome("");
      setDuration("");
      router.refresh();
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Log Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Title (optional)</Label>
            <Input placeholder="Brief summary..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes *</Label>
            <Textarea placeholder="What happened? Key points discussed..." value={body} onChange={(e) => setBody(e.target.value)} rows={3} required={!title} />
          </div>
          {(type === "call" || type === "meeting") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (mins)</Label>
                <Input type="number" min="1" placeholder="30" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Input placeholder="e.g. Interested, Follow up" value={outcome} onChange={(e) => setOutcome(e.target.value)} />
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Log Activity
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
