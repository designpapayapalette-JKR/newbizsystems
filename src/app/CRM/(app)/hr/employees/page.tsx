import { getEmployees } from "@/actions/hr_employees";
import { EmployeeList } from "@/components/hr/EmployeeList";

export default async function HREmployeesPage() {
  const employees = await getEmployees();
  
  return (
    <div className="space-y-4">
      <EmployeeList initialEmployees={employees} />
    </div>
  );
}
