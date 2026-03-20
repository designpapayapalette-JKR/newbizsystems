"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CalendarCheck, FileText, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Overview", href: "/ERP/hr", icon: BarChart2 }, // Assuming we import BarChart2 or just use text if we want. Let's just use text for simplicity or basic icons.
  { name: "Directory", href: "/ERP/hr/employees", icon: Users },
  { name: "Attendance", href: "/ERP/hr/attendance", icon: CalendarCheck },
  { name: "Leaves", href: "/ERP/hr/leaves", icon: FileText },
  { name: "Payroll", href: "/ERP/hr/payroll", icon: IndianRupee },
];

import { BarChart2 } from "lucide-react";

export function HRNav() {
  const pathname = usePathname();
  
  return (
    <div className="border-b mb-6 overflow-x-auto">
      <nav className="-mb-px flex space-x-6 min-w-max">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
