import { getEmployeesForAttendance } from "@/actions/hr_attendance";
import { AttendanceTracker } from "@/components/hr/AttendanceTracker";

export default async function AttendancePage() {
  const employees = await getEmployeesForAttendance();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <AttendanceTracker employees={employees} initialDate={today} />
    </div>
  );
}
