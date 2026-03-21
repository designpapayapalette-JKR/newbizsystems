"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone: phone || null }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setLoading(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/ERP/login";
  }

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold">Profile</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fullName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled className="opacity-60" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
