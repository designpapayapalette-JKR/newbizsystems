import { HRNav } from "@/components/hr/HRNav";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR & Payroll</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage employees, attendance, leaves, and generate payroll.</p>
      </div>
      <HRNav />
      {children}
    </div>
  );
}
