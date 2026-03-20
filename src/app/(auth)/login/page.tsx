"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="h-11 bg-white border-gray-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-gray-700">Password</Label>
          <Link href="/forgot-password" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="h-11 bg-white border-gray-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
        />
      </div>
      <Button type="submit" className="w-full h-11 text-base font-medium mt-2 bg-zinc-900 hover:bg-zinc-800 text-white transition-colors" disabled={loading}>
        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
        Sign in
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-zinc-900 transition-colors w-fit mb-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="flex flex-col items-center gap-2 text-center text-gray-900">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
      </div>
      <div className="mt-2">
        <Suspense fallback={<div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-zinc-900 font-medium hover:underline focus:outline-none transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
