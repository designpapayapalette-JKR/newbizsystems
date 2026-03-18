"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/actions/templates";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Mail } from "lucide-react";
import type { EmailTemplate } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  follow_up: "Follow Up",
  proposal: "Proposal",
  invoice: "Invoice",
  thank_you: "Thank You",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-600 border-gray-200",
  follow_up: "bg-blue-100 text-blue-700 border-blue-200",
  proposal: "bg-purple-100 text-purple-700 border-purple-200",
  invoice: "bg-green-100 text-green-700 border-green-200",
  thank_you: "bg-pink-100 text-pink-700 border-pink-200",
};

interface TemplateDialogProps {
  template?: EmailTemplate;
  onDone: () => void;
}

function TemplateDialog({ template, onDone }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: template?.name ?? "",
    category: template?.category ?? "general",
    subject: template?.subject ?? "",
    body: template?.body ?? "",
  });

  function reset() {
    if (!template) {
      setForm({ name: "", category: "general", subject: "", body: "" });
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return;
    setLoading(true);
    try {
      if (template) {
        await updateEmailTemplate(template.id, form);
        toast.success("Template updated");
      } else {
        await createEmailTemplate(form);
        toast.success("Template created");
      }
      setOpen(false);
      reset();
      onDone();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {template ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "New Email Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Welcome Email"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              placeholder="e.g. Following up on our conversation"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Body *</Label>
            <p className="text-xs text-muted-foreground">
              Variables: {"{{"} name {"}}"}, {"{{"} company {"}}"}, {"{{"} deal_value {"}}"}
            </p>
            <Textarea
              placeholder="Hi {{name}},&#10;&#10;I wanted to follow up on..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !form.name.trim() || !form.subject.trim() || !form.body.trim()}
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplatesManager({ templates: initial }: { templates: EmailTemplate[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initial);

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await deleteEmailTemplate(id);
    setTemplates((t) => t.filter((x) => x.id !== id));
    toast.success("Template deleted");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TemplateDialog onDone={() => router.refresh()} />
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No email templates yet. Create your first template.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white border rounded-lg px-4 py-3 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm">{t.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${CATEGORY_COLORS[t.category] ?? ""}`}
                  >
                    {CATEGORY_LABELS[t.category] ?? t.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <TemplateDialog template={t} onDone={() => router.refresh()} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
