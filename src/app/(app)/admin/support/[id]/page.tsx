import { getPlatformTicketDetails } from "@/actions/platform_tickets";
import { TicketThread } from "@/components/support/TicketThread";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { ticket, messages } = await getPlatformTicketDetails(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/support" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Ticket</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and respond to subscriber request.</p>
        </div>
      </div>

      <TicketThread ticket={ticket} messages={messages} currentUserId={user.id} isAdmin={true} />
    </div>
  );
}
