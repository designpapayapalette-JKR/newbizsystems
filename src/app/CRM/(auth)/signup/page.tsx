"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/CRM/verify-email");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-zinc-900 transition-colors w-fit mb-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="flex flex-col items-center gap-2 text-center text-gray-900">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Grow your business effortlessly today.</p>
      </div>
      <div className="mt-2">
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Full Name</Label>
            <Input
              id="name"
              placeholder="Your Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 bg-white border-gray-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-white border-gray-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-medium mt-2 bg-zinc-900 hover:bg-zinc-800 text-white transition-colors" disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Get Started
          </Button>
        </form>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/CRM/login" className="text-zinc-900 font-medium hover:underline focus:outline-none transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
