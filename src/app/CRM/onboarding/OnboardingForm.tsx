"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function OnboardingForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    setLoading(true);
    try {
      await createOrganization(orgName.trim());
      toast.success("Organization created! Welcome to NewBiz CRM.");
      router.push("/CRM/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create organization");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-900 rounded-2xl mb-5 shadow-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Set up your workspace</h1>
            <p className="text-sm text-zinc-500 mt-2">What&apos;s the name of your company or team?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-zinc-700 font-medium">Organization Name</Label>
              <Input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                placeholder="e.g. Acme Corp"
                autoFocus
                className="h-12 bg-zinc-50/50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 text-lg px-4 transition-colors"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-medium bg-zinc-900 hover:bg-zinc-800 text-white transition-colors" disabled={loading || !orgName.trim()}>
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Continue"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>
        <div className="bg-zinc-50 px-8 py-4 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-500">You can always change these settings later.</p>
        </div>
      </div>
    </div>
  );
}
