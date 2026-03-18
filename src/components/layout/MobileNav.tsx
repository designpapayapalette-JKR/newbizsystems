"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bell, CreditCard, FileText, CheckSquare, Headphones, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const allTabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner","admin","member"] },
  { href: "/leads",     label: "Leads",      icon: Users,           roles: ["owner","admin","member"] },
  { href: "/reminders", label: "Reminders",  icon: Bell,            roles: ["owner","admin","member"] },
  { href: "/tasks",     label: "Tasks",      icon: CheckSquare,     roles: ["owner","admin","member"] },
  { href: "/tickets",   label: "Tickets",    icon: Headphones,      roles: ["owner","admin","member"] },
  { href: "/messages",  label: "Messages",   icon: MessageSquare,   roles: ["owner","admin","member"] },
  { href: "/payments",  label: "Payments",   icon: CreditCard,      roles: ["owner","admin"] },
  { href: "/invoices",  label: "Invoices",   icon: FileText,        roles: ["owner","admin"] },
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
