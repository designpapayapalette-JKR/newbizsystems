"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLead, updateLead } from "@/actions/leads";
import { toast } from "sonner";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { Lead, PipelineStage } from "@/types";

interface LeadFormProps {
  stages: PipelineStage[];
  lead?: Lead;
  onSuccess?: () => void;
}

export function LeadForm({ stages, lead, onSuccess }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string>(lead?.tags?.join(", ") ?? "");
  const [showGst, setShowGst] = useState(false);
  const [gstForm, setGstForm] = useState({
    gstin: (lead as any)?.gstin ?? "",
    pan: (lead as any)?.pan ?? "",
    state: (lead as any)?.state ?? "",
    state_code: (lead as any)?.state_code ?? "",
  });

  function setGst(key: string, value: string) {
    setGstForm((prev) => ({ ...prev, [key]: value }));
  }

  const [form, setForm] = useState({
    name: lead?.name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    company: lead?.company ?? "",
    source: lead?.source ?? "",
    deal_value: lead?.deal_value?.toString() ?? "",
    stage_id: lead?.stage_id ?? (stages.find((s) => s.is_default)?.id ?? ""),
    priority: lead?.priority ?? "",
    notes: lead?.notes ?? "",
    next_followup_at: lead?.next_followup_at ? lead.next_followup_at.slice(0, 16) : "",
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);

    const data = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      source: form.source || undefined,
      deal_value: form.deal_value ? parseFloat(form.deal_value) : undefined,
      stage_id: form.stage_id || undefined,
      priority: (form.priority as "hot" | "warm" | "cold" | undefined) || undefined,
      notes: form.notes || undefined,
      next_followup_at: form.next_followup_at ? new Date(form.next_followup_at).toISOString() : undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      gstin: gstForm.gstin || undefined,
      pan: gstForm.pan || undefined,
      state: gstForm.state || undefined,
      state_code: gstForm.state_code || undefined,
    };

    try {
      if (lead) {
        await updateLead(lead.id, data);
        toast.success("Lead updated");
      } else {
        await createLead(data);
        toast.success("Lead created");
      }
      onSuccess?.();
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Contact name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Company name" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Lead Source</Label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="cold_call">Cold Call</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="event">Event / Exhibition</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal_value">Deal Value (₹)</Label>
          <Input id="deal_value" type="number" min="0" step="0.01" placeholder="0.00" value={form.deal_value} onChange={(e) => set("deal_value", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">Pipeline Stage</Label>
          <Select value={form.stage_id} onValueChange={(v) => set("stage_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">🔴 Hot</SelectItem>
              <SelectItem value="warm">🟡 Warm</SelectItem>
              <SelectItem value="cold">🔵 Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="followup">Next Follow-up</Label>
          <Input id="followup" type="datetime-local" value={form.next_followup_at} onChange={(e) => set("next_followup_at", e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" placeholder="hot, enterprise, q4" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Additional notes..." value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
        </div>
      </div>

      {/* GST / Tax Details collapsible */}
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left hover:bg-gray-50"
          onClick={() => setShowGst((v) => !v)}
        >
          <span>GST / Tax Details</span>
          {showGst ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </button>
        {showGst && (
          <div className="px-4 pb-4 pt-2 space-y-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input
                  placeholder="22AAAAA0000A1Z5"
                  value={gstForm.gstin}
                  onChange={(e) => setGst("gstin", e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>PAN</Label>
                <Input
                  placeholder="AAAAA0000A"
                  value={gstForm.pan}
                  onChange={(e) => setGst("pan", e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  placeholder="Maharashtra"
                  value={gstForm.state}
                  onChange={(e) => setGst("state", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State Code</Label>
                <Input
                  placeholder="27"
                  value={gstForm.state_code}
                  onChange={(e) => setGst("state_code", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {lead ? "Update Lead" : "Create Lead"}
      </Button>
    </form>
  );
}
