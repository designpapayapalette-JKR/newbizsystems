"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCustomer } from "@/actions/customers";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function CustomerDeleteButton({ customerId, trigger }: { customerId: string; trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteCustomer(customerId);
      toast.success("Customer archived");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to archive customer");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="destructive">
            <Trash2 className="h-4 w-4" />
            Archive
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive Customer</DialogTitle>
          <DialogDescription>
            This will mark the customer as archived. They will still remain in your records but will be filtered by default.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Archive Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
