"use client";

import { useState, useTransition } from "react";
import { SubscriptionPlan, assignSubscription, updateSubscriptionStatus } from "@/actions/subscriptions";
import { toast } from "sonner";
import { Building2, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  subscription?: {
    status: string;
    billing_cycle: string;
    expires_at: string | null;
    notes: string | null;
    plan?: { id: string; name: string; slug: string; price_monthly: number };
  } | null;
  member_count?: { count: number }[] | null;
}

const STATUS_OPTS = ["active", "trialing", "past_due", "cancelled", "expired"] as const;
const CYCLE_OPTS = ["monthly", "yearly"] as const;

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-600",
};

interface Props {
  orgs: OrgRow[];
  plans: SubscriptionPlan[];
}

export function AdminOrgsTable({ orgs, plans }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<OrgRow | null>(null);
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [cycle, setCycle] = useState<string>("monthly");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(org: OrgRow) {
    const sub = Array.isArray(org.subscription) ? org.subscription[0] : org.subscription;
    const plan = Array.isArray(sub?.plan) ? sub.plan[0] : sub?.plan;
    setEditing(org);
    setPlanId(plan?.id ?? plans.find((p) => p.slug === "free")?.id ?? "");
    setStatus(sub?.status ?? "active");
    setCycle(sub?.billing_cycle ?? "monthly");
    setExpiresAt(sub?.expires_at ? sub.expires_at.slice(0, 10) : "");
    setNotes(sub?.notes ?? "");
  }

  function handleSave() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await assignSubscription(editing.id, planId, {
          billing_cycle: cycle as "monthly" | "yearly",
          status: status as any,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          notes: notes || undefined,
        });
        toast.success(`Subscription updated for ${editing.name}`);
        setEditing(null);
      } catch (e: any) {
        toast.error(e.message ?? "Failed to update subscription");
      }
    });
  }

  return (
    <>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search organizations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none p-0 focus-visible:ring-0 h-auto text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Organization</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Members</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((org) => {
                const sub = Array.isArray(org.subscription) ? org.subscription[0] : org.subscription;
                const plan = Array.isArray(sub?.plan) ? sub.plan[0] : sub?.plan;
                const memberCount = Array.isArray(org.member_count) ? (org.member_count[0]?.count ?? 0) : (org.member_count ?? 0);
                return (
                  <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{org.name}</p>
                          <p className="text-xs text-muted-foreground">{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{plan?.name ?? "Free"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[sub?.status ?? "active"] ?? "bg-gray-100 text-gray-600"}`}>
                        {sub?.status ?? "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {sub?.expires_at
                        ? new Date(sub.expires_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{memberCount}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => openEdit(org)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription — {editing?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Plan</label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.price_monthly === 0 ? "Free" : `₹${p.price_monthly}/mo`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Billing Cycle</label>
                <Select value={cycle} onValueChange={setCycle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_OPTS.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expiry Date <span className="text-muted-foreground font-normal">(leave blank for no expiry)</span></label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Admin Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes about this subscription…"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!planId || isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
