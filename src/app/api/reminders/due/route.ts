import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Returns reminders that are due within the next 2 minutes (for in-tab alerts)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ reminders: [] });

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 2 * 60 * 1000); // +2 minutes

  const { data: reminders } = await supabase
    .from("reminders")
    .select("id, title, description, lead_id, due_at")
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .lte("due_at", windowEnd.toISOString())
    .gte("due_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString()) // not older than 1 hour
    .order("due_at");

  return NextResponse.json({ reminders: reminders ?? [] });
}
