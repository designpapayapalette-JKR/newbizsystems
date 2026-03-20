"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/CRM/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Check your email</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          We sent a password reset link to <strong className="font-medium text-gray-900">{email}</strong>
        </p>
        <div className="pt-4">
          <Link href="/CRM/login" className="inline-flex items-center text-sm font-medium text-zinc-900 hover:text-zinc-700 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 bg-zinc-100 rounded-xl flex flex-col justify-center items-center mb-2">
          <div className="w-5 h-5 border-2 border-zinc-900 rounded-sm border-t-0 border-b-zinc-400 rotate-45 transform" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">No worries, we&apos;ll send you reset instructions.</p>
      </div>

      <div className="mt-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

      <div className="mt-4 text-center">
        <Link href="/CRM/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
