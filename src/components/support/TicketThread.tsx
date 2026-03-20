"use client";
import { useState } from "react";
import { replyToPlatformTicket, updatePlatformTicketStatus } from "@/actions/platform_tickets";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function TicketThread({ ticket, messages, currentUserId, isAdmin = false }: any) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  
  async function handleReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await replyToPlatformTicket(ticket.id, reply);
      setReply("");
      toast.success("Reply sent");
    } catch (e: any) {
      toast.error(e.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updatePlatformTicketStatus(ticket.id, status);
      toast.success("Status updated");
    } catch(e: any) {
      toast.error("Failed to update status");
    }
  }

  // Handle cases where profile or names might be missing
  const getAvatarName = (profile: any, fallback: string = "User") => {
    return profile?.full_name || fallback;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Ticket Header */}
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{ticket.subject}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {ticket.organization?.name || "Unknown Org"} · {formatDateTime(ticket.created_at)}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
              ticket.status === 'open' ? 'bg-green-100 text-green-700' :
              ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
              ticket.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Conversation</h3>
          {messages.map((m: any) => {
            const isMine = m.sender_id === currentUserId;
            const displayName = getAvatarName(m.profile, isMine ? "You" : "User");
            return (
              <div key={m.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={isMine ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[80%] ${isMine ? 'items-end' : ''}`}>
                  <span className="text-xs font-medium text-muted-foreground px-1">
                    {displayName} {m.profile?.is_super_admin && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded ml-1">Admin</span>}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${isMine ? 'bg-amber-600 text-white rounded-tr-sm' : 'bg-white border text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    {m.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">{formatDateTime(m.created_at)}</span>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed bg-gray-50">No replies yet.</p>}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'closed' && (
          <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
            <Textarea 
              placeholder="Type your reply here..." 
              value={reply} 
              onChange={e => setReply(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleReply} disabled={sending || !reply.trim()}>
                {sending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar sidebar */}
      {isAdmin && (
        <div className="bg-white border rounded-xl p-5 h-max space-y-4 sticky top-6">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Admin Controls</h3>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Update Status</label>
            <div className="flex flex-col gap-2">
              {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                <Button 
                  key={s} 
                  variant={ticket.status === s ? "default" : "outline"} 
                  className={ticket.status === s ? "bg-amber-600 hover:bg-amber-700" : "justify-start"}
                  onClick={() => handleStatusChange(s)}
                  disabled={ticket.status === s}
                >
                  {s.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
