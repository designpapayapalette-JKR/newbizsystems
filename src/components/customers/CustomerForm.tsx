"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCustomer } from "@/actions/customers";
import { toast } from "sonner";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface CustomerFormProps {
  customer?: any;
  onSuccess?: () => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showGst, setShowGst] = useState(false);

  const [form, setForm] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    company: customer?.company ?? "",
    website: customer?.website ?? "",
    address: customer?.address ?? "",
    status: customer?.status ?? "active",
    gstin: customer?.gstin ?? "",
    pan: customer?.pan ?? "",
    state: customer?.state ?? "",
    state_code: customer?.state_code ?? "",
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);

    try {
      await updateCustomer(customer.id, form);
      toast.success("Customer updated");
      onSuccess?.();
      router.refresh();
    } catch {
      toast.error("Failed to update customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left"
          onClick={() => setShowGst((v) => !v)}
        >
          <span>GST / Tax Details</span>
          {showGst ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showGst && (
          <div className="px-4 pb-4 pt-2 space-y-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>GSTIN</Label><Input value={form.gstin} onChange={(e) => set("gstin", e.target.value)} /></div>
              <div className="space-y-2"><Label>PAN</Label><Input value={form.pan} onChange={(e) => set("pan", e.target.value)} /></div>
              <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
              <div className="space-y-2"><Label>State Code</Label><Input value={form.state_code} onChange={(e) => set("state_code", e.target.value)} /></div>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        Update Customer
      </Button>
    </form>
  );
}
