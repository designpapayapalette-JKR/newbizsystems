"use client";
import { cn, getInitials, formatRelative } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Hash } from "lucide-react";

interface Channel {
  id: string;
  type: "group" | "direct";
  name: string | null;
  otherProfile: { full_name?: string | null; avatar_url?: string | null } | null;
  lastMessage: { content: string; created_at: string } | null;
  lastReadAt: string | null;
}

interface Member {
  user_id: string;
  profile: { full_name?: string | null } | null;
}

interface ChannelListProps {
  channels: Channel[];
  members: Member[];
  currentUserId: string;
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onStartDM: (userId: string) => void;
}

export function ChannelList({
  channels,
  members,
  currentUserId,
  activeChannelId,
  onSelectChannel,
  onStartDM,
}: ChannelListProps) {
  const groupChannels = channels.filter((c) => c.type === "group");
  const dmChannels = channels.filter((c) => c.type === "direct");

  // Build set of user IDs that already have a DM channel
  const dmmedUserIds = new Set(
    dmChannels
      .map((c) => c.otherProfile)
      .filter(Boolean)
      .map((p: any) => p?.id)
      .filter(Boolean)
  );

  // Members who don't yet have a DM channel (fallback — shouldn't happen after ensureAllMemberDMs)
  const membersWithoutDM = members.filter(
    (m) => m.user_id !== currentUserId && !dmmedUserIds.has(m.user_id)
  );

  function hasUnread(ch: Channel) {
    if (!ch.lastMessage || !ch.lastReadAt) return !!ch.lastMessage;
    return new Date(ch.lastMessage.created_at) > new Date(ch.lastReadAt);
  }

  return (
    <div className="flex flex-col h-full w-64 shrink-0 border-r bg-white">
      <div className="px-4 py-3 border-b">
        <p className="text-sm font-semibold text-foreground">Messages</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Group channels */}
        <div className="px-3 mb-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Channels</p>
          {groupChannels.map((ch) => {
            const unread = hasUnread(ch);
            const active = ch.id === activeChannelId;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Hash className="h-4 w-4 shrink-0 opacity-70" />
                <span className={cn("flex-1 truncate", unread && !active && "font-semibold")}>
                  {ch.name ?? "Team"}
                </span>
                {unread && !active && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Direct messages — all org members */}
        <div className="px-3 mt-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
            Direct Messages
          </p>

          {/* Existing DM channels */}
          {dmChannels.map((ch) => {
            const unread = hasUnread(ch);
            const active = ch.id === activeChannelId;
            const name = ch.otherProfile?.full_name ?? "Unknown";
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarFallback className="text-[9px]">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <span className={cn("flex-1 truncate", unread && !active && "font-semibold")}>
                  {name}
                </span>
                {unread && !active && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}

          {/* Fallback: members whose DM channel wasn't pre-created yet */}
          {membersWithoutDM.map((m) => (
            <button
              key={m.user_id}
              onClick={() => onStartDM(m.user_id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
            >
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarFallback className="text-[9px]">{getInitials(m.profile?.full_name)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{m.profile?.full_name ?? "Member"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
