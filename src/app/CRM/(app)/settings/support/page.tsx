import { getClientPlatformTickets } from "@/actions/platform_tickets";
import { CreateTicketDialog } from "@/components/support/CreateTicketDialog";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function SettingsSupportPage() {
  const tickets = await getClientPlatformTickets();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Support</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your support requests and bug reports.</p>
        </div>
        <CreateTicketDialog />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 whitespace-nowrap">
            <tr>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-center">Replies</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {tickets.map(t => (
               <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">
                  <Link href={`/settings/support/${t.id}`} className="hover:text-blue-600 block truncate max-w-sm">
                    {t.subject}
                  </Link>
                </td>
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
                <td className="px-5 py-3 text-center">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600 font-medium inline-block min-w-[20px]">
                    {Array.isArray(t.messages) ? t.messages[0]?.count : t.messages?.count || 0}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(t.created_at)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">You haven&apos;t opened any support tickets yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
