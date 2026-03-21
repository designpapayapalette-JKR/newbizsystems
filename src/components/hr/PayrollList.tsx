"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateMonthlyPayroll, finalizePayroll } from "@/actions/hr_payroll";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle, RefreshCcw, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PayrollListProps {
  records: any[];
  selectedMonth: string;
}

export function PayrollList({ records, selectedMonth }: PayrollListProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(selectedMonth);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateMonthlyPayroll(month);
      if (res.count === 0) {
        toast.error("No active employees found to generate payroll.");
      } else {
        toast.success(`Payroll generated for ${res.count} employees.`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate payroll");
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      await finalizePayroll(id);
      toast.success("Payroll record finalized.");
    } catch (e: any) {
      toast.error(e.message || "Failed to finalize payroll");
    }
  };

  const handleDownloadSlip = (id: string, empName: string) => {
    // Open a new tab pointing to the PDF generation endpoint
    window.open(`/api/payroll/${id}/pdf`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Input 
            type="month" 
            value={month} 
            onChange={(e) => {
              setMonth(e.target.value);
              router.push(`/ERP/hr/payroll?month=${e.target.value}`);
            }} 
            className="w-48"
          />
        </div>
        
        {records.length === 0 ? (
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Generate Drafts for {month}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Regenerate Missing Drafts
          </Button>
        )}
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Gross Pay</TableHead>
              <TableHead className="text-right">Deductions (PF+ESI+PT)</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No payroll records generated for this month.
                </TableCell>
              </TableRow>
            ) : (
              records.map((row) => {
                const totalDeductions = Number(row.pf_deduction) + Number(row.esi_deduction) + Number(row.pt_deduction) + Number(row.tds_deduction);
                const isPaid = row.status === "paid";

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.employee?.first_name} {row.employee?.last_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{row.employee?.employee_type || 'Full Time'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPaid ? "default" : "secondary"}>
                        {isPaid ? "Finalized / Paid" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.gross_salary)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(totalDeductions)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(row.net_payable)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isPaid && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleFinalize(row.id)} className="text-blue-600 hover:text-blue-800" title="Finalize">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <PayrollEditDialog record={row} trigger={
                              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary" title="Edit Draft">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            } />
                            <Button size="sm" variant="ghost" onClick={async () => {
                              if (!confirm("Delete this payroll draft?")) return;
                              try {
                                const { deletePayrollRecord } = await import("@/actions/hr_payroll");
                                await deletePayrollRecord(row.id);
                                toast.success("Draft deleted");
                              } catch { toast.error("Delete failed"); }
                            }} className="text-muted-foreground hover:text-destructive" title="Delete Draft">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDownloadSlip(row.id, row.employee?.first_name)} title="Download Slip">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PayrollEditDialog({ record, trigger }: { record: any; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gross_salary: record.gross_salary,
    pf_deduction: record.pf_deduction,
    esi_deduction: record.esi_deduction,
    pt_deduction: record.pt_deduction,
    tds_deduction: record.tds_deduction,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { updatePayrollRecord } = await import("@/actions/hr_payroll");
      const netPayable = Number(form.gross_salary) - Number(form.pf_deduction) - Number(form.esi_deduction) - Number(form.pt_deduction) - Number(form.tds_deduction);
      await updatePayrollRecord(record.id, { ...form, net_payable: netPayable });
      toast.success("Payroll record updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Payroll Draft — {record.employee?.first_name}</DialogTitle></DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Gross Salary</Label><Input type="number" value={form.gross_salary} onChange={(e) => setForm({...form, gross_salary: e.target.value})} /></div>
            <div className="space-y-2"><Label>PF Deduction</Label><Input type="number" value={form.pf_deduction} onChange={(e) => setForm({...form, pf_deduction: e.target.value})} /></div>
            <div className="space-y-2"><Label>ESI Deduction</Label><Input type="number" value={form.esi_deduction} onChange={(e) => setForm({...form, esi_deduction: e.target.value})} /></div>
            <div className="space-y-2"><Label>PT Deduction</Label><Input type="number" value={form.pt_deduction} onChange={(e) => setForm({...form, pt_deduction: e.target.value})} /></div>
            <div className="space-y-2"><Label>TDS Deduction</Label><Input type="number" value={form.tds_deduction} onChange={(e) => setForm({...form, tds_deduction: e.target.value})} /></div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
