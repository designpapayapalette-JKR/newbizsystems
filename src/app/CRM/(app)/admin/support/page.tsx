import { getAllPlatformTickets } from "@/actions/platform_tickets";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function AdminSupportPage() {
  const tickets = await getAllPlatformTickets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage bug reports and support requests from subscribers.</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Ticket</th>
              <th className="px-5 py-3 font-medium">Organization</th>
              <th className="px-5 py-3 font-medium">Creator</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">
                  <Link href={`/CRM/admin/support/${t.id}`} className="hover:text-amber-600 truncate block max-w-xs">
                    {t.subject}
                  </Link>
                </td>
                <td className="px-5 py-3">{t.organization?.name || "Unknown"}</td>
                <td className="px-5 py-3">{t.creator?.full_name || "Unknown"}</td>
                <td className="px-5 py-3 capitalize">{t.type.replace('_', ' ')}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                    t.status === 'open' ? 'bg-green-100 text-green-700' :
                    t.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    t.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3">{formatDateTime(t.created_at)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
