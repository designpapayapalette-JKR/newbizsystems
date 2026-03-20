"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Set new password</h1>
        <p className="text-sm text-muted-foreground">Your new password must be different.</p>
      </div>
      <div className="mt-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Min. 6 characters" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6} 
              className="h-11 bg-white border-gray-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-gray-700">Confirm Password</Label>
            <Input 
              id="confirm" 
              type="password" 
              placeholder="Repeat password" 
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)} 
              required 
              className="h-11 bg-white border-gray-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-medium mt-2 bg-zinc-900 hover:bg-zinc-800 text-white transition-colors" disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}
