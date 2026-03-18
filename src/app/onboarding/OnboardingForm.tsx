"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";
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
      toast.success("Organization created! Welcome to BizCRM.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create organization");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your organization</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up your BizCRM workspace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization details</CardTitle>
            <CardDescription>You can update these settings later in the org settings page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  placeholder="Acme Corp"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !orgName.trim()}>
                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
