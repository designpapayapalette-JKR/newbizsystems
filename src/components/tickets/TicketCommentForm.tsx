"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addTicketComment } from "@/actions/tickets";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { TicketMacro } from "@/actions/macros";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Zap } from "lucide-react";

interface TicketCommentFormProps {
  ticketId: string;
  macros: TicketMacro[];
}

export function TicketCommentForm({ ticketId, macros }: TicketCommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await addTicketComment(ticketId, body.trim(), isInternal);
      toast.success(isInternal ? "Internal note added" : "Reply sent");
      setBody("");
      setIsInternal(false);
      router.refresh();
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {macros.length > 0 && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Zap className="h-3 w-3 text-amber-500" /> Apply Macro
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {macros.map((macro) => (
                <DropdownMenuItem
                  key={macro.id}
                  onClick={() => setBody((prev) => (prev ? prev + "\n\n" : "") + macro.content_template)}
                >
                  {macro.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <Textarea
        placeholder={isInternal ? "Write an internal note (not visible to customer)..." : "Write a reply..."}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className={isInternal ? "bg-amber-50 border-amber-200" : ""}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="internal"
            checked={isInternal}
            onCheckedChange={(v) => setIsInternal(v === true)}
          />
          <Label htmlFor="internal" className="text-sm cursor-pointer">
            Internal note
          </Label>
        </div>
        <Button type="submit" size="sm" disabled={loading || !body.trim()}>
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isInternal ? "Add Note" : "Send Reply"}
        </Button>
      </div>
    </form>
  );
}
