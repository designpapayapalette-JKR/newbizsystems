"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LeadForm } from "./LeadForm";
import { Plus } from "lucide-react";
import type { PipelineStage, Lead } from "@/types";

interface LeadFormDialogProps {
  stages: PipelineStage[];
  lead?: Lead;
  trigger?: React.ReactNode;
}

export function LeadFormDialog({ stages, lead, trigger }: LeadFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        <LeadForm stages={stages} lead={lead} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
