"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markChannelRead } from "@/actions/messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, formatDateTime, cn } from "@/lib/utils";
import { Send, Hash, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: { full_name?: string | null; avatar_url?: string | null } | null;
}

interface Channel {
  id: string;
  type: "group" | "direct";
  name: string | null;
  otherProfile: { full_name?: string | null } | null;
}

interface MessageThreadProps {
  channel: Channel;
  initialMessages: Message[];
  currentUserId: string;
  currentUserName: string | null;
}

export function MessageThread({ channel, initialMessages, currentUserId, currentUserName }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark channel read on mount and when new messages arrive
  useEffect(() => {
    markChannelRead(channel.id);
  }, [channel.id, messages.length]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const sub = supabase
      .channel(`messages:${channel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as { id: string; content: string; created_at: string; sender_id: string };

          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages((prev) => {
            // Avoid duplicates (optimistic update already added it)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, sender: profile ?? null }];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [channel.id]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Optimistic update
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      content: trimmed,
      created_at: new Date().toISOString(),
      sender_id: currentUserId,
      sender: { full_name: currentUserName },
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    textareaRef.current?.focus();

    setSending(true);
    try {
      await sendMessage(channel.id, trimmed);
    } catch {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const channelTitle =
    channel.type === "group"
      ? `# ${channel.name ?? "Team"}`
      : channel.otherProfile?.full_name ?? "Direct Message";

  // Group consecutive messages by same sender
  const grouped = messages.reduce<{ sender_id: string; msgs: Message[] }[]>((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.sender_id === msg.sender_id) {
      last.msgs.push(msg);
    } else {
      acc.push({ sender_id: msg.sender_id, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-12 border-b bg-white shrink-0">
        {channel.type === "group"
          ? <Hash className="h-4 w-4 text-muted-foreground" />
          : <MessageCircle className="h-4 w-4 text-muted-foreground" />
        }
        <span className="font-semibold text-sm">{channelTitle}</span>
        {channel.type === "group" && (
          <span className="text-xs text-muted-foreground ml-1">· All team members</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
            {channel.type === "group"
              ? <Hash className="h-10 w-10 opacity-20" />
              : <MessageCircle className="h-10 w-10 opacity-20" />
            }
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">
              {channel.type === "group"
                ? "Send a message to the whole team"
                : `Start a conversation with ${channel.otherProfile?.full_name ?? "this person"}`}
            </p>
          </div>
        )}

        {grouped.map((group, gi) => {
          const isMine = group.sender_id === currentUserId;
          const senderName = group.msgs[0].sender?.full_name ?? "Unknown";

          return (
            <div key={gi} className={cn("flex gap-2.5", isMine && "flex-row-reverse")}>
              {/* Avatar — only shown for others */}
              {!isMine && (
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(senderName)}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={cn("flex flex-col gap-1 max-w-[70%]", isMine && "items-end")}>
                {/* Sender name + time for first bubble in group */}
                {!isMine && (
                  <span className="text-xs font-medium text-muted-foreground px-1">{senderName}</span>
                )}

                {group.msgs.map((msg, mi) => (
                  <div key={msg.id} className="flex flex-col gap-0.5">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                        isMine
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white border text-foreground rounded-tl-sm shadow-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                    {mi === group.msgs.length - 1 && (
                      <span className={cn("text-[10px] text-muted-foreground px-1", isMine && "text-right")}>
                        {formatDateTime(msg.created_at)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-white shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            placeholder={`Message ${channel.type === "group" ? "#" + (channel.name ?? "team") : channel.otherProfile?.full_name ?? ""}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[40px] max-h-32 resize-none flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="shrink-0 h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
