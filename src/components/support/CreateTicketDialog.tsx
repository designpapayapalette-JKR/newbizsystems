"use client";
import { useState } from "react";
import { createPlatformTicket } from "@/actions/platform_tickets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export function CreateTicketDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("support");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setLoading(true);
    try {
      await createPlatformTicket({ type, subject, description });
      toast.success("Ticket created successfully");
      setOpen(false);
      setSubject("");
      setDescription("");
      setType("support");
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <LifeBuoy className="h-4 w-4" />
          Open Support Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Contact Platform Support</DialogTitle>
            <DialogDescription>
              Report a bug or ask for help from the core team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">General Support</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                id="subject" 
                placeholder="Briefly describe the issue" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                id="description" 
                placeholder="Provide as much detail as possible..." 
                className="min-h-[100px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
             <Button type="submit" disabled={loading || !subject.trim() || !description.trim()}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
