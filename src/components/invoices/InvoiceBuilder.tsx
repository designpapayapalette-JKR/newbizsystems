"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvoice } from "@/actions/invoices";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface LineItem {
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
}

export function InvoiceBuilder({ leads, defaultLeadId }: { leads: { id: string; name: string; company: string | null }[]; defaultLeadId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState(defaultLeadId ?? "");
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState("0");
  const [taxPercent, setTaxPercent] = useState("0");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days of invoice date.");
  const [currency, setCurrency] = useState("INR");
  const [items, setItems] = useState<LineItem[]>([{ description: "", hsn_sac: "", quantity: 1, unit_price: 0 }]);

  function addItem() {
    setItems([...items, { description: "", hsn_sac: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountAmt = parseFloat(discount) || 0;
  const taxAmt = ((subtotal - discountAmt) * (parseFloat(taxPercent) || 0)) / 100;
  const total = subtotal - discountAmt + taxAmt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.every((i) => !i.description.trim())) {
      toast.error("Add at least one line item");
      return;
    }
    setLoading(true);
    try {
      const invoice = await createInvoice({
        lead_id: leadId || undefined,
        title: title || undefined,
        issue_date: issueDate,
        due_date: dueDate || undefined,
        discount: discountAmt,
        tax_percent: parseFloat(taxPercent) || 0,
        notes: notes || undefined,
        terms: terms || undefined,
        currency,
        line_items: items.filter((i) => i.description.trim()),
      });
      toast.success("Invoice created!");
      router.push(`/invoices/${invoice.id}`);
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Header */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Client / Lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="Select lead (optional)" /></SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}{l.company ? ` — ${l.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Invoice Title</Label>
            <Input placeholder="e.g. Website Development" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Issue Date *</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={issueDate} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-1">
            <span className="col-span-4">Description</span>
            <span className="col-span-2">HSN / SAC</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-2 text-right">Unit Price</span>
            <span className="col-span-2 text-right">Amount</span>
          </div>

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-12 sm:col-span-4">
                <Input
                  placeholder="Product / Service name"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  required={i === 0}
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <Input
                  placeholder="e.g. 998314"
                  value={item.hsn_sac}
                  onChange={(e) => updateItem(i, "hsn_sac", e.target.value)}
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <Input
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1">
                <span className="text-sm font-medium">{formatCurrency(item.quantity * item.unit_price, currency)}</span>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="border-t pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Discount</span>
                <Input type="number" min="0" step="0.01" className="h-7 w-24 text-sm" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <span className="text-sm">- {formatCurrency(discountAmt, currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tax %</span>
                <Input type="number" min="0" max="100" step="0.1" className="h-7 w-20 text-sm" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
              </div>
              <span className="text-sm">+ {formatCurrency(taxAmt, currency)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1 border-t">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Thank you for your business!" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea placeholder="Payment terms..." value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Create Invoice
      </Button>
    </form>
  );
}
