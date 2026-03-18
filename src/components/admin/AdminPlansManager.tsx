"use client";

import { useState, useTransition } from "react";
import { SubscriptionPlan, createPlan, updatePlan, deletePlan } from "@/actions/subscriptions";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const EMPTY_PLAN: Omit<SubscriptionPlan, "id"> = {
  name: "",
  slug: "",
  price_monthly: 0,
  price_yearly: 0,
  currency: "INR",
  max_leads: 100,
  max_members: 1,
  max_invoices: 10,
  features: [],
  is_active: true,
  sort_order: 0,
};

interface Props {
  plans: SubscriptionPlan[];
}

export function AdminPlansManager({ plans }: Props) {
  const [editing, setEditing] = useState<(Partial<SubscriptionPlan> & { id?: string }) | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setEditing({ ...EMPTY_PLAN });
    setFeaturesText("");
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditing({ ...plan });
    setFeaturesText((plan.features ?? []).join("\n"));
  }

  function handleSave() {
    if (!editing) return;
    const features = featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
    const payload = { ...editing, features } as any;

    startTransition(async () => {
      try {
        if (editing.id) {
          await updatePlan(editing.id, payload);
          toast.success("Plan updated");
        } else {
          await createPlan(payload);
          toast.success("Plan created");
        }
        setEditing(null);
      } catch (e: any) {
        toast.error(e.message ?? "Failed to save plan");
      }
    });
  }

  function handleDelete(plan: SubscriptionPlan) {
    if (!confirm(`Deactivate "${plan.name}" plan? It won't be shown to customers.`)) return;
    startTransition(async () => {
      try {
        await deletePlan(plan.id);
        toast.success("Plan deactivated");
      } catch (e: any) {
        toast.error(e.message ?? "Failed to deactivate plan");
      }
    });
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{plan.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">/{plan.slug}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(plan)} className="p-1 rounded hover:bg-white/10 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(plan)} className="p-1 rounded hover:bg-white/10 transition-colors text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {plan.price_monthly === 0 ? "Free" : `₹${plan.price_monthly.toLocaleString("en-IN")}/mo`}
                </p>
                {plan.price_yearly > 0 && (
                  <p className="text-xs text-muted-foreground">₹{plan.price_yearly.toLocaleString("en-IN")}/yr</p>
                )}
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between"><span>Leads</span><span className="font-medium">{plan.max_leads == null ? "∞" : plan.max_leads}</span></div>
                <div className="flex justify-between"><span>Members</span><span className="font-medium">{plan.max_members == null ? "∞" : plan.max_members}</span></div>
                <div className="flex justify-between"><span>Invoices</span><span className="font-medium">{plan.max_invoices == null ? "∞" : plan.max_invoices}</span></div>
              </div>

              <ul className="space-y-1">
                {(plan.features ?? []).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editing?.name ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))}
                  placeholder="Starter"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={editing?.slug ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  placeholder="starter"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Monthly Price (₹)</label>
                <Input
                  type="number"
                  value={editing?.price_monthly ?? 0}
                  onChange={(e) => setEditing((p) => ({ ...p!, price_monthly: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Yearly Price (₹)</label>
                <Input
                  type="number"
                  value={editing?.price_yearly ?? 0}
                  onChange={(e) => setEditing((p) => ({ ...p!, price_yearly: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Leads</label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={editing?.max_leads ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, max_leads: e.target.value === "" ? null : Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Members</label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={editing?.max_members ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, max_members: e.target.value === "" ? null : Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Invoices</label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={editing?.max_invoices ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, max_invoices: e.target.value === "" ? null : Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                value={editing?.sort_order ?? 0}
                onChange={(e) => setEditing((p) => ({ ...p!, sort_order: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Features <span className="text-muted-foreground font-normal text-xs">(one per line)</span></label>
              <textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                rows={5}
                placeholder={"Up to 500 leads\n3 team members\nEmail templates"}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!editing?.name || !editing?.slug || isPending}>
              {isPending ? "Saving…" : editing?.id ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
