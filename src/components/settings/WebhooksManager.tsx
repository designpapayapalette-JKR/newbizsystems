"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { createWebhook, updateWebhook, deleteWebhook } from "@/actions/webhooks";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Webhook, CheckCircle, XCircle } from "lucide-react";
import type { Webhook as WebhookType } from "@/types";

const ALL_EVENTS = [
  "lead.created",
  "lead.updated",
  "lead.won",
  "lead.lost",
  "ticket.created",
  "ticket.updated",
  "payment.received",
  "invoice.sent",
];

function NewWebhookDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    secret: "",
  });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  function reset() {
    setForm({ name: "", url: "", secret: "" });
    setSelectedEvents([]);
  }

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleSave() {
    if (!form.name.trim() || !form.url.trim()) return;
    if (!form.url.startsWith("https://")) {
      toast.error("Webhook URL must start with https://");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Select at least one event");
      return;
    }
    setLoading(true);
    try {
      await createWebhook({
        name: form.name.trim(),
        url: form.url.trim(),
        events: selectedEvents,
        secret: form.secret.trim() || undefined,
      });
      toast.success("Webhook created");
      setOpen(false);
      reset();
      onDone();
    } catch {
      toast.error("Failed to create webhook");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          New Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              placeholder="e.g. Slack Notifications"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>URL * (https required)</Label>
            <Input
              type="url"
              placeholder="https://example.com/webhook"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Events *</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((event) => (
                <div key={event} className="flex items-center gap-2">
                  <Checkbox
                    id={event}
                    checked={selectedEvents.includes(event)}
                    onCheckedChange={() => toggleEvent(event)}
                  />
                  <Label htmlFor={event} className="text-xs font-mono cursor-pointer">
                    {event}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secret (optional)</Label>
            <Input
              placeholder="Signing secret for verification"
              value={form.secret}
              onChange={(e) => setForm({ ...form, secret: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Sent as X-Webhook-Secret header with each request.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !form.name.trim() || !form.url.trim() || selectedEvents.length === 0}
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            Create Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WebhooksManager({ webhooks: initial }: { webhooks: WebhookType[] }) {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState(initial);

  async function handleToggle(id: string, current: boolean) {
    await updateWebhook(id, { is_active: !current });
    setWebhooks((list) =>
      list.map((w) => (w.id === id ? { ...w, is_active: !current } : w))
    );
    toast.success(current ? "Webhook disabled" : "Webhook enabled");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook?")) return;
    await deleteWebhook(id);
    setWebhooks((list) => list.filter((w) => w.id !== id));
    toast.success("Webhook deleted");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewWebhookDialog onDone={() => router.refresh()} />
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Webhook className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No webhooks configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((hook) => (
            <div key={hook.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{hook.name}</span>
                    {hook.is_active ? (
                      <span className="flex items-center gap-0.5 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                    {hook.url}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {hook.events.map((event) => (
                      <Badge
                        key={event}
                        variant="outline"
                        className="text-xs font-mono py-0"
                      >
                        {event}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last triggered: {formatDate(hook.last_triggered)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleToggle(hook.id, hook.is_active)}
                  >
                    {hook.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(hook.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
