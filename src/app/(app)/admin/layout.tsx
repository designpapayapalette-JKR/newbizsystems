import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/plans", label: "Subscription Plans" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">You don&apos;t have super admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Admin top bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center gap-3 shrink-0">
        <Shield className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-semibold text-amber-400">Super Admin</span>
        <span className="text-gray-500 text-sm">·</span>
        <nav className="flex gap-4">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </div>
    </div>
  );
}
