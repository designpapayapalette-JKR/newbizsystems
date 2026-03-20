import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getLeadById } from "@/actions/leads";
import { getActivities } from "@/actions/activities";
import { getLeadReminders } from "@/actions/reminders";
import { CommunicationBar } from "@/components/communication/CommunicationBar";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { LogActivityDialog } from "@/components/activities/LogActivityDialog";
import { LeadFormDialog } from "@/components/leads/LeadFormDialog";
import { LeadDeleteButton } from "@/components/leads/LeadDeleteButton";
import { QuickNoteForm } from "@/components/leads/QuickNoteForm";
import { AddReminderDialog } from "@/components/leads/AddReminderDialog";
import { AssignLeadDialog } from "@/components/leads/AssignLeadDialog";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate, formatRelative, getInitials } from "@/lib/utils";
import { ArrowLeft, Calendar, Building2, Mail, Phone, DollarSign, Pencil, UserCircle } from "lucide-react";
import { getTeamMembers } from "@/actions/team";
import Link from "next/link";

const PRIORITY_STYLES: Record<string, { color: string; label: string }> = {
  hot: { color: "bg-red-100 text-red-700 border-red-300", label: "Hot" },
  warm: { color: "bg-amber-100 text-amber-700 border-amber-300", label: "Warm" },
  cold: { color: "bg-blue-100 text-blue-700 border-blue-300", label: "Cold" },
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const [lead, activities, reminders, stagesResult, teamMembers] = await Promise.all([
    getLeadById(id).catch(() => null),
    getActivities(id),
    getLeadReminders(id),
    supabase.from("pipeline_stages").select("*").eq("organization_id", profile.current_org_id).order("position"),
    getTeamMembers(profile.current_org_id),
  ]);

  if (!lead) notFound();

  const stages = stagesResult.data ?? [];
  const priorityStyle = lead.priority ? PRIORITY_STYLES[lead.priority] : null;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={lead.name}
        actions={
          <div className="flex gap-2">
            <AddReminderDialog leadId={lead.id} leadName={lead.name} />
            <LogActivityDialog leadId={lead.id} />
            <AssignLeadDialog
              leadId={lead.id}
              currentAssigneeId={(lead as any).assigned_to ?? null}
              members={teamMembers as any[]}
            />
            <LeadFormDialog
              stages={stages}
              lead={lead as any}
              trigger={
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              }
            />
            <LeadDeleteButton leadId={lead.id} />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto">
        {/* Back link */}
        <div className="px-4 pt-4">
          <Link href="/CRM/leads" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Left: Lead info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{lead.name}</CardTitle>
                    {lead.company && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {lead.company}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {priorityStyle && (
                      <Badge variant="outline" className={priorityStyle.color}>
                        {priorityStyle.label}
                      </Badge>
                    )}
                    {lead.stage && (
                      <Badge variant="outline" style={{ borderColor: lead.stage.color, color: lead.stage.color }}>
                        {lead.stage.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Assignee */}
                {(lead as any).assignee ? (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px]">
                          {getInitials((lead as any).assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">Assigned to</span>
                      <span className="font-medium">{(lead as any).assignee.full_name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCircle className="h-4 w-4 shrink-0" />
                    <span>Unassigned</span>
                  </div>
                )}
                {lead.deal_value && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">{formatCurrency(lead.deal_value, lead.currency)}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.next_followup_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Next follow-up</p>
                      <p>{formatRelative(lead.next_followup_at)}</p>
                    </div>
                  </div>
                )}
                {lead.source && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Source: </span>
                    <span className="capitalize">{lead.source.replace(/_/g, " ")}</span>
                  </div>
                )}
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                {lead.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                )}
                <div className="border-t pt-3">
                  <p className="text-muted-foreground text-xs mb-2">Quick Note</p>
                  <QuickNoteForm leadId={lead.id} orgId={profile.current_org_id} />
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Created {formatDate(lead.created_at)}
                </div>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Contact</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CommunicationBar name={lead.name} phone={lead.phone} email={lead.email} />
              </CardContent>
            </Card>

            {/* Quick links */}
            <Card>
              <CardContent className="py-3 flex gap-2">
                <Link href={`/CRM/leads/${lead.id}/invoices`} className="flex-1 text-center text-sm text-primary hover:underline">Invoices</Link>
                <Link href={`/CRM/leads/${lead.id}/payments`} className="flex-1 text-center text-sm text-primary hover:underline">Payments</Link>
              </CardContent>
            </Card>
          </div>

          {/* Right: Activity timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                  <LogActivityDialog leadId={lead.id} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ActivityTimeline activities={activities as any[]} reminders={reminders as any[]} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
