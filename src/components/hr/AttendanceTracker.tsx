"use client";
import { useState, useTransition } from "react";
import { markAttendance } from "@/actions/hr_attendance";
import { Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "present",  label: "Present",  color: "bg-green-500",  textColor: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  { value: "absent",   label: "Absent",   color: "bg-red-500",    textColor: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
  { value: "half_day", label: "Half Day", color: "bg-amber-500",  textColor: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  { value: "leave",    label: "On Leave", color: "bg-blue-500",   textColor: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
];

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export function AttendanceTracker({ employees, initialDate }: { employees: any[]; initialDate: string }) {
  const [date, setDate] = useState(initialDate);
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    employees.forEach(e => { defaults[e.id] = "present"; });
    return defaults;
  });
  const [isPending, startTransition] = useTransition();

  function changeDate(direction: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + direction);
    setDate(formatDate(d));
  }

  function toggleStatus(empId: string, status: string) {
    setAttendance(prev => ({ ...prev, [empId]: status }));
  }

  function handleSave() {
    const records = employees.map(e => ({
      employee_id: e.id,
      date,
      status: attendance[e.id] || "present",
    }));

    startTransition(async () => {
      try {
        await markAttendance(records);
        toast.success(`Attendance saved for ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to save attendance");
      }
    });
  }

  const summary = STATUS_OPTIONS.map(s => ({
    ...s,
    count: Object.values(attendance).filter(v => v === s.value).length,
  }));

  return (
    <div className="space-y-4">
      {/* Date Picker Header */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
        <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-xs text-muted-foreground">{employees.length} active employees</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => changeDate(1)} disabled={date >= formatDate(new Date())}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-2">
        {summary.map(s => (
          <div key={s.value} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium", s.bg, s.border, s.textColor)}>
            <div className={cn("w-2 h-2 rounded-full", s.color)} />
            {s.count} {s.label}
          </div>
        ))}
      </div>

      {/* Employee Attendance Grid */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Employee</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map(emp => {
                const status = attendance[emp.id] || "present";
                const opt = STATUS_OPTIONS.find(s => s.value === status);
                return (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-muted-foreground">{emp.designation || emp.department || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s.value}
                            onClick={() => toggleStatus(emp.id, s.value)}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                              status === s.value
                                ? cn(s.bg, s.border, s.textColor, "ring-2 ring-offset-1", s.border.replace("border-", "ring-"))
                                : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-muted-foreground">No active employees found. Add employees first in the Directory tab.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      {employees.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending} size="lg">
            {isPending ? "Saving..." : `Save Attendance for ${employees.length} Employees`}
          </Button>
        </div>
      )}
    </div>
  );
}
