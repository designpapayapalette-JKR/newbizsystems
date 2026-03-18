"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateLead } from "@/actions/leads";
import { toast } from "sonner";
import { Trophy, XCircle, Loader2 } from "lucide-react";

const WIN_REASONS = ["Best price","Best product/features","Strong relationship","Good support","Quick response","Competitor weakness"];
const LOSS_REASONS = ["Price too high","Chose competitor","No budget","No decision made","Poor fit","Timing not right","Lost contact"];

interface WinLossDialogProps {
  leadId: string;
  type: "won" | "lost";
  open: boolean;
  onClose: () => void;
}

export function WinLossDialog({ leadId, type, open, onClose }: WinLossDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await updateLead(leadId, type === "won" ? { win_reason: reason || notes } : { loss_reason: reason || notes });
      toast.success(type === "won" ? "🎉 Deal marked as Won!" : "Deal marked as Lost");
      onClose();
      router.refresh();
    } catch { toast.error("Failed to save"); }
    finally { setLoading(false); }
  }

  const reasons = type === "won" ? WIN_REASONS : LOSS_REASONS;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "won" ? <Trophy className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-500" />}
            {type === "won" ? "Mark as Won" : "Mark as Lost"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason..." /></SelectTrigger>
              <SelectContent>
                {reasons.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Additional Notes (optional)</Label>
            <Textarea placeholder="Any additional context..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className={type === "won" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}>
              {loading && <Loader2 className="animate-spin h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
