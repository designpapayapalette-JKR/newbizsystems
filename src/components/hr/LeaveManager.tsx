"use client";
import { useState, useTransition } from "react";
import { createLeaveRequest, updateLeaveStatus, deleteLeave, updateLeaveRequest } from "@/actions/hr_leaves";
import { Plus, Check, X, Trash2, CalendarOff, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const LEAVE_TYPES = ["sick", "casual", "earned", "maternity", "paternity", "unpaid"];

function daysBetween(start: string, end: string) {
  const s = new Date(start), e = new Date(end);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function LeaveManager({ leaves, employees }: { leaves: any[]; employees: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<any>(null);
  const [form, setForm] = useState({ employee_id: "", type: "sick", start_date: "", end_date: "", reason: "" });
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? leaves : leaves.filter(l => l.status === filter);

  function handleOpenNew() {
    setEditingLeave(null);
    setForm({ employee_id: "", type: "sick", start_date: "", end_date: "", reason: "" });
    setIsNewOpen(true);
  }

  function handleOpenEdit(leave: any) {
    setEditingLeave(leave);
    setForm({
      employee_id: leave.employee_id,
      type: leave.type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason || ""
    });
    setIsNewOpen(true);
  }

  function handleSubmit() {
    if (!form.employee_id || !form.start_date || !form.end_date) {
      toast.error("Employee, start date, and end date are required");
      return;
    }
    startTransition(async () => {
      try {
        if (editingLeave) {
          await updateLeaveRequest(editingLeave.id, {
            type: form.type,
            start_date: form.start_date,
            end_date: form.end_date,
            reason: form.reason
          });
          toast.success("Leave request updated");
        } else {
          await createLeaveRequest(form);
          toast.success("Leave request created");
        }
        setIsNewOpen(false);
        setEditingLeave(null);
        setForm({ employee_id: "", type: "sick", start_date: "", end_date: "", reason: "" });
      } catch (e: any) {
        toast.error(e.message || "Failed to process leave request");
      }
    });
  }

  function handleStatus(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      try {
        await updateLeaveStatus(id, status);
        toast.success(`Leave ${status}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to update status");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this leave request?")) return;
    startTransition(async () => {
      try {
        await deleteLeave(id);
        toast.success("Leave request deleted");
      } catch (e: any) {
        toast.error(e.message || "Failed to delete");
      }
    });
  }

  const counts = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full border capitalize transition-colors",
                filter === f
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              )}
            >
              {f} <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="h-4 w-4 mr-2" /> Apply Leave
        </Button>
      </div>

      {/* Leave Cards */}
      <div className="space-y-3">
        {filtered.map(leave => {
          const emp = Array.isArray(leave.hr_employees) ? leave.hr_employees[0] : leave.hr_employees;
          const days = daysBetween(leave.start_date, leave.end_date);
          return (
            <div key={leave.id} className="bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-indigo-100 text-indigo-700 h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{emp?.first_name} {emp?.last_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{leave.type} leave · {days} day{days !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex-1 text-sm">
                <p className="text-gray-700 font-medium">
                  {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} –{" "}
                  {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                {leave.reason && <p className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{leave.reason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded border capitalize", STATUS_STYLES[leave.status])}>
                  {leave.status}
                </span>
                {leave.status === "pending" && (
                  <>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenEdit(leave)} disabled={isPending} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleStatus(leave.id, "approved")} disabled={isPending} title="Approve">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleStatus(leave.id, "rejected")} disabled={isPending} title="Reject">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(leave.id)} disabled={isPending} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-muted-foreground">
            <CalendarOff className="h-6 w-6 mx-auto mb-2 text-gray-300" />
            No {filter === "all" ? "" : filter} leave requests found.
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingLeave ? "Edit Leave Request" : "Apply for Leave"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {!editingLeave && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Employee *</label>
                <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Leave Type *</label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Start Date *</label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">End Date *</label>
                <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Reason</label>
              <textarea
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                rows={2}
                placeholder="Optional reason..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.employee_id || !form.start_date || !form.end_date}>
              {isPending ? "Processing..." : (editingLeave ? "Update Request" : "Submit Request")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
