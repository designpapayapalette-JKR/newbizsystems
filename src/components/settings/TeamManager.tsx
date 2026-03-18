"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inviteTeamMember, removeMember, updateMemberRole, revokeInvite } from "@/actions/team";
import { AssignTaskDialog } from "@/components/tasks/AssignTaskDialog";
import { getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, UserMinus, Send, Link2, Copy, Check, X, Clock, ClipboardList, ShieldCheck, Shield } from "lucide-react";
import type { Role } from "@/types";

const ROLE_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
  owner: { color: "bg-purple-100 text-purple-700 border-purple-300", label: "Owner",  icon: ShieldCheck },
  admin: { color: "bg-blue-100 text-blue-700 border-blue-300",       label: "Admin",   icon: Shield },
  member: { color: "bg-gray-100 text-gray-700 border-gray-300",      label: "Member",  icon: null },
};

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  token?: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  profile: { full_name?: string | null; avatar_url?: string | null } | null;
}

interface TeamManagerProps {
  members: Member[];
  pendingInvites: PendingInvite[];
  orgId: string;
  currentUserId: string;
  currentUserRole: Role;
  leads?: { id: string; name: string }[];
}

export function TeamManager({ members, pendingInvites: initialInvites, orgId, currentUserId, currentUserRole, leads = [] }: TeamManagerProps) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [loading, setLoading] = useState(false);
  const [inviteLinkModal, setInviteLinkModal] = useState<{ url: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(initialInvites);

  const isAdminOrOwner = currentUserRole === "admin" || currentUserRole === "owner";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.includes("@")) return;
    setLoading(true);
    try {
      const result = await inviteTeamMember(inviteEmail, inviteRole);
      setInviteLinkModal({ url: result.inviteUrl, email: inviteEmail });
      setInviteEmail("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  async function handleRevoke(inviteId: string) {
    await revokeInvite(inviteId);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    toast.success("Invite revoked");
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this team member from the organization?")) return;
    await removeMember(orgId, userId);
    toast.success("Member removed");
    router.refresh();
  }

  async function handleRoleChange(userId: string, role: string) {
    await updateMemberRole(orgId, userId, role as Role);
    toast.success("Role updated");
    router.refresh();
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      {/* Invite Link Modal */}
      <Dialog open={!!inviteLinkModal} onOpenChange={(v) => { if (!v) setInviteLinkModal(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Invite Link Created
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link with <strong>{inviteLinkModal?.email}</strong>. It expires in 7 days.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteLinkModal?.url ?? ""}
                className="text-xs font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => handleCopyLink(inviteLinkModal?.url ?? "")}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The invitee must sign in or create an account to accept the invite.
            </p>
            <Button className="w-full" onClick={() => setInviteLinkModal(null)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite form — admin/owner only */}
      {isAdminOrOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite Team Member</CardTitle>
            <CardDescription>Send an invite link to add someone to your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-2 flex-wrap">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 min-w-0"
                required
              />
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — full access</SelectItem>
                  <SelectItem value="member">Member — limited access</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                Send Invite
              </Button>
            </form>
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
              <p><strong>Admin:</strong> Can view Payments, Invoices, Reports; manage leads; assign tasks</p>
              <p><strong>Member:</strong> Can view Leads, Reminders, Tasks, Tickets; cannot access financials</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites */}
      {isAdminOrOwner && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Invites ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvites.map((invite) => {
              const inviteUrl = invite.token ? `${appUrl}/invite/${invite.token}` : null;
              return (
                <div key={invite.id} className="flex items-center gap-3 p-2 rounded-lg border bg-amber-50/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Role: {invite.role} · Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {inviteUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => setInviteLinkModal({ url: inviteUrl, email: invite.email })}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Link
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevoke(invite.id)}
                      title="Revoke invite"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Team Members ({members.length})</CardTitle>
              <CardDescription>Manage roles and assign tasks to your team</CardDescription>
            </div>
            {isAdminOrOwner && (
              <AssignTaskDialog
                members={members.filter((m) => m.user_id !== currentUserId)}
                orgId={orgId}
                leads={leads}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => {
            const roleConf = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.member;
            const RoleIcon = roleConf.icon;
            const isSelf = m.user_id === currentUserId;
            const isOwner = m.role === "owner";

            return (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">{getInitials(m.profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{m.profile?.full_name ?? "Invited User"}</p>
                    {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {RoleIcon && <RoleIcon className="h-3 w-3 text-muted-foreground" />}
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full border", roleConf.color)}>
                      {roleConf.label}
                    </span>
                  </div>
                </div>

                {/* Actions — only admin/owner can manage others, cannot manage owner */}
                {isAdminOrOwner && !isSelf && !isOwner && (
                  <div className="flex items-center gap-1 shrink-0">
                    <AssignTaskDialog
                      members={[m]}
                      orgId={orgId}
                      leads={leads}
                      defaultAssignedTo={m.user_id}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="Assign task">
                          <ClipboardList className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <Select value={m.role} onValueChange={(v) => handleRoleChange(m.user_id, v)}>
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(m.user_id)}
                      title="Remove member"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
