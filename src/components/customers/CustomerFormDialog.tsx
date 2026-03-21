"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomerForm } from "./CustomerForm";

interface CustomerFormDialogProps {
  customer: any;
  trigger: React.ReactNode;
}

export function CustomerFormDialog({ customer, trigger }: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
        <CustomerForm customer={customer} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
