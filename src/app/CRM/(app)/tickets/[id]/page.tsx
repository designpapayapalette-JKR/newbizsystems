import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getTicketById } from "@/actions/tickets";
import { getMacros } from "@/actions/macros";
import { getTeamMembers } from "@/actions/team";
import { TopBar } from "@/components/layout/TopBar";
import { TicketStatusSelect } from "@/components/tickets/TicketStatusSelect";
import { TicketAssignSelect } from "@/components/tickets/TicketAssignSelect";
import { TicketCommentForm } from "@/components/tickets/TicketCommentForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ClockAlert } from "lucide-react";
import Link from "next/link";
import type { TicketStatus } from "@/types";

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSlaStatus(dueDate: string | null) {
  if (!dueDate) return null;
  const dueTime = new Date(dueDate).getTime();
  const now = Date.now();
  if (dueTime < now) return { label: "Breached", class: "bg-red-100 text-red-800 border-red-200" };
  if (dueTime < now + 2 * 3600000) return { label: "At Risk", class: "bg-orange-100 text-orange-800 border-orange-200" };
  return { label: "On Track", class: "bg-green-100 text-green-800 border-green-200" };
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const ticket = await getTicketById(id).catch(() => null);
  if (!ticket) notFound();

  const members = await getTeamMembers(profile.current_org_id).catch(() => []);
  const macros = await getMacros().catch(() => []);
  const comments = (ticket as any).comments ?? [];
  const slaStatus = getSlaStatus(ticket.sla_due_at);

  return (
    <div className="flex flex-col h-full">
      <TopBar title={ticket.ticket_number} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4">
          <Link
            href="/CRM/tickets"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Left panel: ticket info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{ticket.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Status selector */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <TicketStatusSelect
                    ticketId={ticket.id}
                    currentStatus={ticket.status as TicketStatus}
                  />
                </div>

                {/* Assignee selector */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Assignee</p>
                  <TicketAssignSelect
                    ticketId={ticket.id}
                    currentAssigneeId={ticket.assigned_to}
                    members={members}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Priority</p>
                  <Badge
                    variant="outline"
                    className={`capitalize ${PRIORITY_BADGE[ticket.priority] ?? ""}`}
                  >
                    {ticket.priority}
                  </Badge>
                </div>

                {/* Linked lead */}
                {(ticket as any).lead && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Linked Lead</p>
                    <Link
                      href={`/CRM/leads/${(ticket as any).lead.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {(ticket as any).lead.name}
                    </Link>
                  </div>
                )}

                {/* SLA due */}
                {ticket.sla_due_at && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">SLA Due</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{formatDate(ticket.sla_due_at)}</p>
                      {slaStatus && (
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex gap-1 ${slaStatus.class}`}>
                          {slaStatus.label === "Breached" || slaStatus.label === "At Risk" ? <ClockAlert className="h-3 w-3" /> : null}
                          {slaStatus.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {ticket.description && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Description</p>
                    <div className="text-sm whitespace-pre-wrap bg-muted/40 p-3 rounded-md border">{ticket.description}</div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground border-t pt-3">
                  Created {formatDate(ticket.created_at)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right panel: comment thread */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="text-base">
                  Ticket Thread ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Existing comments */}
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No replies yet. Be the first to start the conversation.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <div
                        key={comment.id}
                        className={`rounded-xl p-4 text-sm ${
                          comment.is_internal
                            ? "bg-amber-50 border border-amber-200 shadow-sm"
                            : "bg-muted/30 border shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                          <span className="font-semibold text-sm text-foreground">
                            {comment.user_profile?.full_name ?? "Unknown"}
                          </span>
                          <div className="flex items-center gap-2">
                            {comment.is_internal && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-amber-100 text-amber-700 border-amber-200"
                              >
                                Internal Note
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                <div className="border-t pt-6 mt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Add Note or Reply</p>
                  <TicketCommentForm ticketId={ticket.id} macros={macros} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
