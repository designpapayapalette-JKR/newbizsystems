"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bell, CreditCard, FileText, CheckSquare, Headphones, MessageSquare, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const allTabs = [
  { href: "/CRM/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner","admin","member"] },
  { href: "/CRM/leads",     label: "Leads",      icon: Users,           roles: ["owner","admin","member"] },
  { href: "/CRM/reminders", label: "Reminders",  icon: Bell,            roles: ["owner","admin","member"] },
  { href: "/CRM/tasks",     label: "Tasks",      icon: CheckSquare,     roles: ["owner","admin","member"] },
  { href: "/CRM/tickets",   label: "Tickets",    icon: Headphones,      roles: ["owner","admin","member"] },
  { href: "/CRM/messages",  label: "Messages",   icon: MessageSquare,   roles: ["owner","admin","member"] },
  { href: "/CRM/payments",  label: "Payments",   icon: CreditCard,      roles: ["owner","admin"] },
  { href: "/CRM/invoices",  label: "Invoices",   icon: FileText,        roles: ["owner","admin"] },
  { href: "/CRM/hr",        label: "HR & Payroll",icon: Briefcase,      roles: ["owner","admin"] },
];

export function MobileNav({ userRole }: { userRole: Role }) {
  const pathname = usePathname();
  const tabs = allTabs.filter((t) => t.roles.includes(userRole));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex md:hidden safe-area-pb">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 text-xs gap-1 transition-colors",
              active ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
