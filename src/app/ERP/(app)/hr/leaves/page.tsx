import { getLeaves } from "@/actions/hr_leaves";
import { getEmployees } from "@/actions/hr_employees";
import { LeaveManager } from "@/components/hr/LeaveManager";

export default async function LeavesPage() {
  const [leaves, employees] = await Promise.all([
    getLeaves(),
    getEmployees(),
  ]);

  return (
    <div className="space-y-4">
      <LeaveManager leaves={leaves} employees={employees} />
    </div>
  );
}
