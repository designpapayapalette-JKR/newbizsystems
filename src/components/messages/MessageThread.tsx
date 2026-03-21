"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markChannelRead } from "@/actions/messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, formatDateTime, cn } from "@/lib/utils";
import { Send, Hash, MessageCircle, Paperclip, FileText, X } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender: { full_name?: string | null; avatar_url?: string | null } | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const newMsg = payload.new as Message;

          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .maybeSingle();

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
    if ((!trimmed && !file) || sending || uploading) return;

    setSending(true);
    if (file) setUploading(true);

    let fileData = undefined;

    try {
      if (file) {
        const supabase = createClient();
        const ext = file.name.split('.').pop() || '';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
        const filePath = `${channel.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("message_attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("message_attachments")
          .getPublicUrl(filePath);

        fileData = {
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        };
      }

      // Optimistic update
      const optimisticId = `opt-${Date.now()}`;
      const optimistic: Message = {
        id: optimisticId,
        content: trimmed,
        created_at: new Date().toISOString(),
        sender_id: currentUserId,
        sender: { full_name: currentUserName },
        file_url: fileData?.fileUrl,
        file_name: fileData?.fileName,
        file_type: fileData?.fileType,
        file_size: fileData?.fileSize,
      };
      setMessages((prev) => [...prev, optimistic]);
      setText("");
      setFile(null);
      textareaRef.current?.focus();

      await sendMessage(channel.id, trimmed, fileData);
    } catch (e) {
      console.error(e);
      // Remove optimistic on failure could be tricky with files, we just alert
      alert("Failed to send message/attachment");
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (selected.size > 10 * 1024 * 1024) { // 10MB limit
      alert("File is too large. Max size is 10MB");
      return;
    }
    setFile(selected);
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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
                      {msg.file_url && (
                        <div className={cn("mb-2", (msg.content && msg.content.trim()) ? "mb-2" : "mb-0")}>
                          {msg.file_type?.startsWith('image/') ? (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                              <img src={msg.file_url} alt={msg.file_name || "Attachment"} className="max-w-[200px] max-h-[200px] object-cover rounded-md" />
                            </a>
                          ) : (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-2 p-2 rounded-md border", isMine ? "bg-primary-foreground/10 border-primary-foreground/20 text-white" : "bg-gray-50 text-gray-900")}>
                               <FileText className="h-5 w-5 shrink-0" />
                               <div className="flex flex-col overflow-hidden">
                                 <span className="truncate text-sm font-medium">{msg.file_name}</span>
                                 <span className="text-xs opacity-70">{msg.file_size ? formatBytes(msg.file_size) : 'Unknown size'}</span>
                               </div>
                            </a>
                          )}
                        </div>
                      )}
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
        {file && (
          <div className="flex items-center gap-2 mb-2 p-2 relative rounded-md bg-gray-50 border w-max">
             <FileText className="h-4 w-4 text-muted-foreground" />
             <span className="text-xs max-w-[200px] truncate text-gray-800">{file.name}</span>
             <button onClick={() => setFile(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-600">
                <X className="h-3 w-3" />
             </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            className="shrink-0 h-10 w-10 text-muted-foreground mr-1"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
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
            disabled={(!text.trim() && !file) || sending || uploading}
            className="shrink-0 h-10 w-10 ml-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 ml-14">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
