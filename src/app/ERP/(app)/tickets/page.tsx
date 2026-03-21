import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTickets } from "@/actions/tickets";
import { getTeamMembers } from "@/actions/team";
import { TopBar } from "@/components/layout/TopBar";
import { TicketFormDialog } from "@/components/tickets/TicketFormDialog";
import { DeleteTicketButton } from "@/components/tickets/DeleteTicketButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import { Ticket, ClockAlert, User as UserIcon } from "lucide-react";

function getSlaStatus(dueDate: string | null) {
  if (!dueDate) return null;
  const dueTime = new Date(dueDate).getTime();
  const now = Date.now();
  if (dueTime < now) return { label: "Breached", class: "bg-red-100 text-red-800 border-red-200" };
  if (dueTime < now + 2 * 3600000) return { label: "At Risk", class: "bg-orange-100 text-orange-800 border-orange-200" };
  return null;
}

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
  mine: "Assigned to Me",
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
  if (!user) redirect("/ERP/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/ERP/onboarding");

  const sp = await searchParams;
  const statusFilter = sp.status ?? "all";

  const members = await getTeamMembers(profile.current_org_id).catch(() => []);
  const tickets = await getTickets({ 
    status: statusFilter === "mine" ? undefined : statusFilter,
    assigned_to: statusFilter === "mine" ? user.id : undefined 
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Support Tickets"
        actions={<TicketFormDialog members={members} />}
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
            <Link href={value === "all" ? "/ERP/tickets" : `/tickets?status=${value}`}>
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
                href={`/ERP/tickets/${ticket.id}`}
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lead: {ticket.lead.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex -space-x-1">
                      {ticket.assignee ? (
                        <div 
                          className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
                          title={`Assigned to ${ticket.assignee.full_name || ticket.assignee.email}`}
                        >
                          {(ticket.assignee.full_name || ticket.assignee.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      ) : (
                        <div 
                          className="h-6 w-6 rounded-full bg-muted border border-dashed flex items-center justify-center text-muted-foreground"
                          title="Unassigned"
                        >
                          <UserIcon className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    {(() => {
                      const sla = getSlaStatus(ticket.sla_due_at);
                      return sla ? (
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex gap-1 ${sla.class}`}>
                          <ClockAlert className="h-3 w-3" /> {sla.label}
                        </Badge>
                      ) : null;
                    })()}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize ${PRIORITY_BADGE[ticket.priority] ?? ""}`}
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 capitalize ${STATUS_BADGE[ticket.status] ?? ""}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-1 border-l pl-3 ml-1" onClick={(e) => e.preventDefault()}>
                      <TicketFormDialog members={members} ticket={ticket} />
                      <DeleteTicketButton id={ticket.id} ticketNumber={ticket.ticket_number} />
                    </div>
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
