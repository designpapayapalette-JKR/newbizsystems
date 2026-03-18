"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { acceptInvite } from "@/actions/team";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Users, Mail, CheckCircle2, AlertCircle } from "lucide-react";

type Step = "check" | "auth" | "join" | "verify-email" | "error";
type Tab = "signin" | "signup";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [step, setStep] = useState<Step>("check");
  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // On mount: check if already logged in (e.g. returning from email verification)
  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStep("join");
        await runAcceptInvite();
      } else {
        setStep("auth");
      }
    }
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAcceptInvite() {
    try {
      await acceptInvite(token);
      toast.success("Welcome to the team! 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message ?? "Failed to accept invite";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setStep("join");
    await runAcceptInvite();
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const appUrl = window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: fullName },
        // After email verification click, redirect back here — auto-accept fires
        emailRedirectTo: `${appUrl}/api/auth/callback?redirectTo=/invite/${token}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // If Supabase email confirmation is disabled, user is signed in immediately
    if (data.session) {
      setStep("join");
      await runAcceptInvite();
      setLoading(false);
      return;
    }

    // Email confirmation required — show "check your email" screen
    setStep("verify-email");
    setLoading(false);
  }

  // ─── Loading / Joining ────────────────────────────────────────────────────
  if (step === "check" || step === "join") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {step === "join" ? "Accepting invite…" : "Loading…"}
        </p>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Invite issue</h2>
              <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => { setStep("auth"); setErrorMsg(""); }}>
                Try Again
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Email verification pending ───────────────────────────────────────────
  if (step === "verify-email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Check your email</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a verification link to <strong>{signupEmail}</strong>.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground text-left space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Open the email and click the verification link</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>You&apos;ll be signed in and added to the team automatically</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>No extra steps needed after clicking the link</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check spam, or{" "}
              <button className="text-primary underline" onClick={() => setStep("auth")}>
                try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Auth (sign in / sign up) ─────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">You&apos;ve been invited to BizCRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in or create an account to join your team</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border bg-white p-1 mb-4">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Sign In */}
        {tab === "signin" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sign in to accept</CardTitle>
              <CardDescription>Use your existing BizCRM account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required placeholder="••••••••" autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  Sign In & Accept Invite
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sign Up */}
        {tab === "signup" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create your account</CardTitle>
              <CardDescription>
                New to BizCRM? Create an account to join your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    required placeholder="Ravi Kumar" autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                    required placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                    required placeholder="Min. 6 characters" autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    required placeholder="••••••••" autoComplete="new-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  Create Account & Join Team
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
