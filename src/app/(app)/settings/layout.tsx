import Link from "next/link";

const settingsNav = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/organization", label: "Organization" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/billing", label: "Billing & Plan" },
  { href: "/settings/pipeline", label: "Pipeline Stages" },
  { href: "/settings/knowledge-base", label: "Knowledge Base" },
  { href: "/settings/support", label: "Help Center / Support" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/products", label: "Products & Services" },
  { href: "/settings/templates", label: "Email Templates" },
  { href: "/settings/webhooks", label: "Webhooks" },
  { href: "/settings/audit", label: "Audit Log" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <aside className="md:w-52 shrink-0 border-r bg-white">
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Settings</p>
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
