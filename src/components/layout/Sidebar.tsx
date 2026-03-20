"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Bell, CreditCard, FileText,
  Settings, LogOut, Building2, CheckSquare, Headphones, BarChart2, MessageSquare, Shield, BookOpen, LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/types";

const allNavItems = [
  { href: "/CRM/dashboard",         label: "Dashboard",  icon: LayoutDashboard, roles: ["owner","admin","member"] },
  { href: "/CRM/leads",             label: "Leads",       icon: Users,           roles: ["owner","admin","member"] },
  { href: "/CRM/reminders",         label: "Reminders",   icon: Bell,            roles: ["owner","admin","member"] },
  { href: "/CRM/tasks",             label: "Tasks",       icon: CheckSquare,     roles: ["owner","admin","member"] },
  { href: "/CRM/tickets",           label: "Tickets",     icon: Headphones,      roles: ["owner","admin","member"] },
  { href: "/CRM/messages",          label: "Messages",    icon: MessageSquare,   roles: ["owner","admin","member"] },
  { href: "/CRM/reports",           label: "Reports",     icon: BarChart2,       roles: ["owner","admin"] },
  { href: "/CRM/payments",          label: "Payments",    icon: CreditCard,      roles: ["owner","admin"] },
  { href: "/CRM/invoices",          label: "Invoices",    icon: FileText,        roles: ["owner","admin"] },
  { href: "/CRM/settings/profile",  label: "Settings",    icon: Settings,        roles: ["owner","admin","member"] },
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

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/CRM/login");
  }

  return (
    <div className="flex flex-col h-full bg-white border-r w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b">
        <img src="/logo-compact.png" alt={orgName} className="h-8 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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
      </nav>

      {/* Super Admin link */}
      {isSuperAdmin && (
        <div className="px-2 pb-2">
          <Link
            href="/CRM/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith("/CRM/admin")
                ? "bg-amber-500 text-white"
                : "text-amber-600 hover:bg-amber-50"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            Super Admin
          </Link>
        </div>
      )}

      {/* Role badge + User */}
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
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
