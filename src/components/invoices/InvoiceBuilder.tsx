"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface LineItem {
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface Org {
  id: string;
  name: string;
  gstin?: string;
  state?: string;
  state_code?: string;
  currency?: string;
}

interface Lead {
  id: string;
  name: string;
  company: string | null;
  gstin?: string;
  state?: string;
  state_code?: string;
}

export function InvoiceBuilder({ 
  leads, 
  defaultLeadId,
  organization: org,
  invoice
}: { 
  leads: Lead[]; 
  defaultLeadId?: string;
  organization?: Org;
  invoice?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState(invoice?.lead_id ?? defaultLeadId ?? "");
  const [title, setTitle] = useState(invoice?.title ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ? invoice.issue_date.split('T')[0] : new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(invoice?.due_date ? invoice.due_date.split('T')[0] : "");
  const [discount, setDiscount] = useState(invoice?.discount?.toString() ?? "0");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [terms, setTerms] = useState(invoice?.terms ?? "Payment due within 30 days of invoice date.");
  const [currency, setCurrency] = useState(invoice?.currency ?? org?.currency ?? "INR");
  
  const initialItems = invoice?.line_items?.length 
    ? invoice.line_items.map((i: any) => ({
        description: i.description,
        hsn_sac: i.hsn_sac || "",
        quantity: i.quantity,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate || 0,
      }))
    : [{ description: "", hsn_sac: "", quantity: 1, unit_price: 0, tax_rate: 18 }];
    
  const [items, setItems] = useState<LineItem[]>(initialItems);

  const selectedLead = leads.find(l => l.id === leadId);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountAmt = parseFloat(discount) || 0;
  
  // Real-time GST Calculation (Aggregated from line items)
  let totalTaxAmt = 0;
  let totalCgst = 0, totalSgst = 0, totalIgst = 0;

  items.forEach(item => {
    const itemSubtotal = item.quantity * item.unit_price;
    const itemDiscount = subtotal > 0 ? (itemSubtotal / subtotal) * discountAmt : 0;
    const itemTaxableValue = itemSubtotal - itemDiscount;
    const itemTax = (itemTaxableValue * (item.tax_rate || 0)) / 100;

    totalTaxAmt += itemTax;

    if (currency === "INR" && itemTax > 0) {
      const isIntraState = org?.state_code === selectedLead?.state_code;
      if (isIntraState) {
        totalCgst += itemTax / 2;
        totalSgst += itemTax / 2;
      } else {
        totalIgst += itemTax;
      }
    }
  });

  const total = (subtotal - discountAmt) + totalTaxAmt;

  const isGSTMissing = currency === "INR" && (!org?.gstin || (leadId && !selectedLead?.gstin));

  function addItem() {
    setItems([...items, { description: "", hsn_sac: "", quantity: 1, unit_price: 0, tax_rate: 18 }]);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.every((i) => !i.description.trim())) {
      toast.error("Add at least one line item");
      return;
    }
    if (isGSTMissing) {
      toast.error("GST details missing. Both parties must have GSTIN for INR invoices.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        lead_id: leadId || undefined,
        title: title || undefined,
        issue_date: issueDate,
        due_date: dueDate || undefined,
        discount: discountAmt,
        notes: notes || undefined,
        terms: terms || undefined,
        currency,
        line_items: items.filter((i) => i.description.trim()),
      };

      if (invoice) {
        await updateInvoice(invoice.id, payload);
        toast.success("Invoice updated!");
        router.push(`/CRM/invoices/${invoice.id}`);
      } else {
        const newInvoice = await createInvoice(payload);
        toast.success("Invoice created!");
        router.push(`/CRM/invoices/${newInvoice.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || (invoice ? "Failed to update invoice" : "Failed to create invoice"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* GST Validation Warning */}
      {isGSTMissing && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <div>
            <p className="font-bold">GST Compliance Required</p>
            <p className="mt-0.5 opacity-90">
              For INR invoices, Indian guidelines require GSTIN for both parties. 
              {!org?.gstin && <span> Please update your <strong>organization GSTIN</strong> in Settings.</span>}
              {leadId && !selectedLead?.gstin && <span> Please update the <strong>lead/client details</strong> with their GSTIN.</span>}
            </p>
          </div>
        </div>
      )}

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
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-1">
            <span className="col-span-3">Description</span>
            <span className="col-span-2">HSN / SAC</span>
            <span className="col-span-1 text-center">GST %</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-2 text-right">Unit Price</span>
            <span className="col-span-2 text-right">Amount</span>
          </div>

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-12 sm:col-span-3">
                <Input
                  placeholder="Product / Service name"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  required={i === 0}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Input
                  placeholder="HSN/SAC"
                  value={item.hsn_sac}
                  onChange={(e) => updateItem(i, "hsn_sac", e.target.value)}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="%"
                  value={item.tax_rate}
                  onChange={(e) => updateItem(i, "tax_rate", parseFloat(e.target.value) || 0)}
                  className="px-1 text-center"
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
            {discountAmt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>- {formatCurrency(discountAmt, currency)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tax / GST</span>
              <span>+ {formatCurrency(totalTaxAmt, currency)}</span>
            </div>

            {/* GST Breakdown */}
            {currency === "INR" && totalTaxAmt > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 mt-2 space-y-1 border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">GST Breakdown ({org?.state_code === selectedLead?.state_code ? "Intra-state" : "Inter-state"})</div>
                {totalCgst > 0 && (
                  <div className="flex justify-between text-[12px] px-1">
                    <span className="text-muted-foreground">CGST</span>
                    <span className="font-medium">{formatCurrency(totalCgst, currency)}</span>
                  </div>
                )}
                {totalSgst > 0 && (
                  <div className="flex justify-between text-[12px] px-1">
                    <span className="text-muted-foreground">SGST</span>
                    <span className="font-medium">{formatCurrency(totalSgst, currency)}</span>
                  </div>
                )}
                {totalIgst > 0 && (
                  <div className="flex justify-between text-[12px] px-1">
                    <span className="text-muted-foreground">IGST</span>
                    <span className="font-medium">{formatCurrency(totalIgst, currency)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between font-bold text-lg pt-1.5 border-t border-gray-200 mt-2">
              <span>Total Amount</span>
              <span className="text-primary">{formatCurrency(total, currency)}</span>
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
        {loading && <Loader2 className="animate-spin mr-2" />}
        {invoice ? "Update Invoice" : "Create Invoice"}
      </Button>
    </form>
  );
}
