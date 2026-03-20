"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPayment, updatePayment } from "@/actions/payments";
import { toast } from "sonner";
import { Plus, Loader2, Edit2 } from "lucide-react";
import type { Payment } from "@/types";

interface PaymentFormDialogProps {
  leads: { id: string; name: string }[];
  invoices: { id: string; invoice_number: string; total: number }[];
  trigger?: React.ReactNode;
  defaultLeadId?: string;
  defaultInvoiceId?: string;
  payment?: Payment;
}

export function PaymentFormDialog({ leads, invoices, trigger, defaultLeadId, defaultInvoiceId, payment }: PaymentFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(payment ? payment.amount.toString() : "");
  const [currency, setCurrency] = useState(payment?.currency ?? "INR");
  const [leadId, setLeadId] = useState(payment?.lead_id ?? defaultLeadId ?? "");
  const [invoiceId, setInvoiceId] = useState(payment?.invoice_id ?? defaultInvoiceId ?? "");
  const [method, setMethod] = useState<any>(payment?.payment_method ?? "upi");
  const [reference, setReference] = useState(payment?.reference_number ?? "");
  const [dueDate, setDueDate] = useState(payment?.due_date ? String(payment.due_date).split('T')[0] : "");
  const [notes, setNotes] = useState(payment?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const data = {
        amount: parseFloat(amount),
        currency,
        lead_id: leadId || undefined,
        invoice_id: invoiceId || undefined,
        payment_method: method as any,
        reference_number: reference || undefined,
        due_date: dueDate || undefined,
        notes: notes || undefined,
      };

      if (payment) {
        await updatePayment(payment.id, data);
        toast.success("Payment updated");
      } else {
        await createPayment(data);
        toast.success("Payment recorded");
        setAmount("");
      }
      
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(payment ? "Failed to update payment" : "Failed to record payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant={payment ? "ghost" : "default"}>
            {payment ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {payment ? "Edit" : "Add Payment"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{payment ? "Edit Payment" : "Record Payment"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR ₹</SelectItem>
                  <SelectItem value="USD">USD $</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="Select lead (optional)" /></SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Invoice</Label>
            <Select value={invoiceId} onValueChange={setInvoiceId}>
              <SelectTrigger><SelectValue placeholder="Link to invoice (optional)" /></SelectTrigger>
              <SelectContent>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>{inv.invoice_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input placeholder="UTR / transaction ID" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2" />}
            {payment ? "Update Payment" : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
