"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Bell, CreditCard, FileText,
  Settings, LogOut, Briefcase, CheckSquare, Headphones,
  BarChart2, MessageSquare, Shield, ChevronRight, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/types";

const navGroups = [
  {
    label: "Sales & CRM",
    items: [
      { href: "/ERP/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner","admin","member"] },
      { href: "/ERP/leads",     label: "Leads",     icon: Users,           roles: ["owner","admin","member"] },
      { href: "/ERP/tasks",     label: "Tasks",     icon: CheckSquare,     roles: ["owner","admin","member"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/ERP/tickets",   label: "Helpdesk",  icon: Headphones,      roles: ["owner","admin","member"] },
      { href: "/ERP/messages",  label: "Messages",  icon: MessageSquare,   roles: ["owner","admin","member"] },
      { href: "/ERP/reminders", label: "Reminders", icon: Bell,            roles: ["owner","admin","member"] },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/ERP/invoices",  label: "Invoices",  icon: FileText,        roles: ["owner","admin"] },
      { href: "/ERP/payments",  label: "Payments",  icon: CreditCard,      roles: ["owner","admin"] },
      { href: "/ERP/reports",   label: "Reports",   icon: BarChart2,       roles: ["owner","admin"] },
    ],
  },
  {
    label: "HR & Payroll",
    items: [
      { href: "/ERP/hr",        label: "HR & Payroll", icon: Briefcase,    roles: ["owner","admin"] },
      { href: "/ERP/hr/time-clock", label: "Time Clock", icon: Clock,      roles: ["owner","admin","member"] },
    ],
  },
];

interface SidebarProps {
  orgName: string;
  userFullName: string | null;
  userAvatarUrl: string | null;
  userRole: Role;
  isSuperAdmin?: boolean;
}

export function Sidebar({ orgName, userFullName, userAvatarUrl, userRole, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/ERP/login");
  }

  return (
    <div className="flex flex-col h-full bg-white border-r w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b">
        <img src="/logo-full.png" alt={orgName} className="h-8 w-auto min-w-[100px] max-w-[130px]" />
      </div>

      {/* Grouped Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Settings always at bottom */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1">System</p>
          <div className="space-y-0.5">
            <Link
              href="/ERP/settings/profile"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith("/ERP/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Super Admin */}
      {isSuperAdmin && (
        <div className="px-2 pb-2">
          <Link
            href="/ERP/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith("/ERP/admin")
                ? "bg-amber-500 text-white"
                : "text-amber-600 hover:bg-amber-50"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            Super Admin
          </Link>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatarUrl ?? undefined} />
            <AvatarFallback className="text-xs">{getInitials(userFullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userFullName ?? "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
