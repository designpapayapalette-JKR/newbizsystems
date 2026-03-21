"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { convertToCustomer } from "@/actions/leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ConvertToCustomerButton({ leadId, leadName, isAlreadyCustomer }: { leadId: string; leadName: string; isAlreadyCustomer?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConvert() {
    if (!confirm(`Are you sure you want to convert "${leadName}" to an official Customer?`)) return;
    
    setLoading(true);
    try {
      await convertToCustomer(leadId);
      toast.success(`${leadName} has been converted to a Customer.`);
      router.push("/ERP/customers");
    } catch (err: any) {
      toast.error(err.message || "Failed to convert lead");
    } finally {
      setLoading(false);
    }
  }

  if (isAlreadyCustomer) return null;

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
      onClick={handleConvert}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Convert to Customer
    </Button>
  );
}
