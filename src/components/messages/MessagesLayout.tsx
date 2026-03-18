"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChannelList } from "./ChannelList";
import { MessageThread } from "./MessageThread";
import { getMessages, getOrCreateDMChannel, ensureChannelMember } from "@/actions/messages";
import { MessageCircle } from "lucide-react";

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

interface MessagesLayoutProps {
  initialChannels: Channel[];
  members: Member[];
  currentUserId: string;
  currentUserName: string | null;
  defaultChannelId?: string;
  defaultMessages?: any[];
}

export function MessagesLayout({
  initialChannels,
  members,
  currentUserId,
  currentUserName,
  defaultChannelId,
  defaultMessages = [],
}: MessagesLayoutProps) {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(defaultChannelId ?? null);
  const [messages, setMessages] = useState<any[]>(defaultMessages);
  const [isPending, startTransition] = useTransition();

  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? null;

  async function handleSelectChannel(channelId: string) {
    if (channelId === activeChannelId) return;
    setActiveChannelId(channelId);
    startTransition(() => {
      getMessages(channelId).then(setMessages);
    });
  }

  async function handleStartDM(otherUserId: string) {
    startTransition(() => {
      getOrCreateDMChannel(otherUserId).then(async (channelId) => {
        router.refresh();

        setChannels((prev) => {
          if (prev.some((c) => c.id === channelId)) return prev;
          const otherMember = members.find((m) => m.user_id === otherUserId);
          return [
            ...prev,
            {
              id: channelId,
              type: "direct",
              name: null,
              otherProfile: otherMember?.profile ?? null,
              lastMessage: null,
              lastReadAt: null,
            },
          ];
        });

        const msgs = await getMessages(channelId);
        setMessages(msgs);
        setActiveChannelId(channelId);
      });
    });
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Channel sidebar */}
      <ChannelList
        channels={channels}
        members={members}
        currentUserId={currentUserId}
        activeChannelId={activeChannelId}
        onSelectChannel={handleSelectChannel}
        onStartDM={handleStartDM}
      />

      {/* Message thread */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeChannel ? (
          isPending ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="animate-pulse text-sm">Loading messages…</div>
            </div>
          ) : (
            <MessageThread
              key={activeChannel.id}
              channel={activeChannel}
              initialMessages={messages}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageCircle className="h-12 w-12 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-0.5">Choose a channel or start a direct message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
