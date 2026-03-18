"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { logActivity } from "@/actions/activities";
import { toast } from "sonner";
import { Loader2, StickyNote } from "lucide-react";

export function QuickNoteForm({ leadId, orgId }: { leadId: string; orgId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setLoading(true);
    try {
      await logActivity({
        lead_id: leadId,
        organization_id: orgId,
        type: "note",
        title: "Note",
        body: note.trim(),
      });
      setNote("");
      toast.success("Note added");
      router.refresh();
    } catch { toast.error("Failed to add note"); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Add a quick note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="text-sm resize-none"
      />
      {note.trim() && (
        <Button type="submit" size="sm" disabled={loading} className="gap-1">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <StickyNote className="h-3.5 w-3.5" />}
          Save Note
        </Button>
      )}
    </form>
  );
}
