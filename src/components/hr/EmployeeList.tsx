"use client";
import { useState, useTransition } from "react";
import { createEmployee, updateEmployee, deleteEmployee } from "@/actions/hr_employees";
import { Plus, Search, Pencil, Trash2, UserCircle, Phone, Mail, LayoutDashboard, Briefcase, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export function EmployeeList({ initialEmployees }: { initialEmployees: any[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create Mode
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    first_name: "", last_name: "", email: "", phone: "", employee_id: "", designation: "", department: "",
    base_salary_monthly: "", pan_number: "", uan_number: "", esic_number: "",
    daily_working_hours: "9", employee_type: "Full Time"
  });

  // Edit Mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmp, setEditEmp] = useState<any>({});

  const filtered = initialEmployees.filter(e => 
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newEmp.first_name || !newEmp.last_name || !newEmp.department) {
      toast.error("First Name, Last Name, and Department are required");
      return;
    }
    startTransition(async () => {
      try {
        await createEmployee({
          ...newEmp,
          base_salary_monthly: newEmp.base_salary_monthly ? Number(newEmp.base_salary_monthly) : 0,
          daily_working_hours: newEmp.daily_working_hours ? Number(newEmp.daily_working_hours) : 9
        });
        toast.success("Employee added successfully");
        setIsNewOpen(false);
        setNewEmp({ first_name: "", last_name: "", email: "", phone: "", employee_id: "", designation: "", department: "", base_salary_monthly: "", pan_number: "", uan_number: "", esic_number: "", daily_working_hours: "9", employee_type: "Full Time" });
      } catch (e: any) {
        toast.error(e.message || "Failed to add employee");
      }
    });
  }

  function openEdit(emp: any) {
    setEditingId(emp.id);
    setEditEmp({ 
      ...emp, 
      base_salary_monthly: emp.base_salary_monthly || "",
      daily_working_hours: emp.daily_working_hours || "9"
    });
  }

  function handleUpdate() {
    if (!editingId) return;
    startTransition(async () => {
      try {
        await updateEmployee(editingId, {
          ...editEmp,
          base_salary_monthly: editEmp.base_salary_monthly ? Number(editEmp.base_salary_monthly) : 0,
          daily_working_hours: editEmp.daily_working_hours ? Number(editEmp.daily_working_hours) : 9
        });
        toast.success("Employee updated successfully");
        setEditingId(null);
      } catch (e: any) {
        toast.error(e.message || "Failed to update employee");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to completely delete ${name}? This will remove all their HR records.`)) return;
    startTransition(async () => {
      try {
        await deleteEmployee(id);
        toast.success("Employee deleted successfully");
      } catch (e: any) {
        toast.error(e.message || "Failed to delete employee");
      }
    });
  }

  const FormFields = ({ data, setData }: { data: any, setData: any }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-1.5">
        <label className="text-xs font-medium">First Name *</label>
        <Input value={data.first_name} onChange={e => setData({...data, first_name: e.target.value})} placeholder="John" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Last Name *</label>
        <Input value={data.last_name} onChange={e => setData({...data, last_name: e.target.value})} placeholder="Doe" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Employee ID</label>
        <Input value={data.employee_id} onChange={e => setData({...data, employee_id: e.target.value})} placeholder="EMP-001" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Email</label>
        <Input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="john@example.com" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Phone</label>
        <Input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} placeholder="+91 9876543210" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Department *</label>
        <select 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={data.department} 
          onChange={e => setData({...data, department: e.target.value})}
          required
        >
          <option value="" disabled>Select Department</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
          <option value="Finance">Finance</option>
          <option value="HR">HR</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Designation</label>
        <Input value={data.designation} onChange={e => setData({...data, designation: e.target.value})} placeholder="Manager" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Employment Type</label>
        <select 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={data.employee_type || "Full Time"} 
          onChange={e => setData({...data, employee_type: e.target.value})}
        >
          <option value="Full Time">Full Time</option>
          <option value="Intern">Intern</option>
          <option value="Contract">Contract</option>
          <option value="Part Time">Part Time</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Base Salary (₹/month)</label>
        <Input type="number" value={data.base_salary_monthly} onChange={e => setData({...data, base_salary_monthly: e.target.value})} placeholder="40000" />
      </div>
      <div className="space-y-1.5 pt-2 pb-1 sm:col-span-2 border-b">
        <h4 className="text-sm font-semibold text-gray-700 pb-1">Scheduling</h4>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Daily Working Hours</label>
        <Input type="number" step="0.5" value={data.daily_working_hours || "9"} onChange={e => setData({...data, daily_working_hours: e.target.value})} placeholder="9" />
      </div>
      <div className="space-y-1.5 sm:col-span-2 pt-2 pb-1 border-b">
        <h4 className="text-sm font-semibold text-gray-700 pb-1">Compliance & Banking</h4>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">PAN Number</label>
        <Input value={data.pan_number || ""} onChange={e => setData({...data, pan_number: e.target.value})} placeholder="ABCDE1234F" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">UAN (PF Number)</label>
        <Input value={data.uan_number || ""} onChange={e => setData({...data, uan_number: e.target.value})} placeholder="100XXXXXXXXX" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">ESIC Number</label>
        <Input value={data.esic_number || ""} onChange={e => setData({...data, esic_number: e.target.value})} />
      </div>
    </div>
  );

  return (
    <>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
        </div>
        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 whitespace-nowrap">
              <tr>
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Salary / Compliance</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 h-9 w-9 rounded-full flex items-center justify-center font-bold">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs text-muted-foreground">{emp.employee_id || "No ID"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-xs space-y-1 text-gray-500">
                      {emp.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {emp.email}</div>}
                      {emp.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {emp.phone}</div>}
                      {!emp.email && !emp.phone && "—"}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-xs font-medium text-gray-900">{emp.department || "—"}</div>
                    <div className="text-[10px] text-gray-500">{emp.designation || "—"}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-xs font-semibold text-gray-900 border border-gray-200 bg-gray-50 inline-flex items-center px-1.5 py-0.5 rounded">
                      <IndianRupee className="h-3 w-3 mr-0.5" /> {(emp.base_salary_monthly || 0).toLocaleString("en-IN")}/mo
                    </div>
                    {(emp.uan_number || emp.esic_number) && (
                       <div className="text-[10px] text-blue-600 mt-1 font-medium bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                         PF/ESI Active
                       </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => openEdit(emp)} disabled={isPending}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)} disabled={isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No employees found in directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
          <FormFields data={newEmp} setData={setNewEmp} />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isPending || !newEmp.first_name || !newEmp.last_name || !newEmp.department}>
              {isPending ? "Saving..." : "Save Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingId} onOpenChange={(val) => !val && setEditingId(null)}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle>Edit Employee Records</DialogTitle></DialogHeader>
          <FormFields data={editEmp} setData={setEditEmp} />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isPending || !editEmp.first_name || !editEmp.last_name || !editEmp.department}>
              {isPending ? "Updating..." : "Update Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
