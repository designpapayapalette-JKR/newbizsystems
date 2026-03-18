import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTickets } from "@/actions/tickets";
import { TopBar } from "@/components/layout/TopBar";
import { TicketFormDialog } from "@/components/tickets/TicketFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { Ticket } from "lucide-react";

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/onboarding");

  const sp = await searchParams;
  const statusFilter = sp.status ?? "all";

  const tickets = await getTickets({ status: statusFilter });

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Support Tickets"
        actions={<TicketFormDialog />}
      />

      {/* Filter bar */}
      <div className="flex gap-1 px-4 pt-3 pb-1 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <Button
            key={value}
            asChild
            variant={statusFilter === value ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
          >
            <Link href={value === "all" ? "/tickets" : `/tickets?status=${value}`}>
              {label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="No support tickets match the current filter"
          />
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket: any) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block bg-white border rounded-lg px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        {ticket.ticket_number}
                      </span>
                      <span className="font-medium text-sm truncate">{ticket.title}</span>
                    </div>
                    {ticket.lead?.name && (
                      <p className="text-xs text-muted-foreground">
                        Lead: {ticket.lead.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${PRIORITY_BADGE[ticket.priority] ?? ""}`}
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${STATUS_BADGE[ticket.status] ?? ""}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
