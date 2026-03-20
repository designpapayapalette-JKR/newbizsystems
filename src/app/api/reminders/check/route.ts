import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // Protect cron endpoint
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 15 * 60 * 1000); // +15 minutes

  // Find due reminders not yet notified
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, lead:leads(id, name)")
    .lte("due_at", windowEnd.toISOString())
    .eq("is_completed", false)
    .is("notified_at", null)
    .limit(50);

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let sent = 0;

  for (const reminder of reminders) {
    // Get push subscriptions for this user
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", reminder.user_id);

    if (subs && subs.length > 0) {
      // Dynamic import to avoid build issues when web-push is not available
      try {
        const webPush = await import("web-push");
        webPush.setVapidDetails(
          `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY!
        );

        const payload = JSON.stringify({
          title: "Reminder: " + reminder.title,
          body: reminder.description ?? (reminder.lead ? `Lead: ${(reminder.lead as any).name}` : ""),
          url: reminder.lead_id ? `/CRM/leads/${reminder.lead_id}` : "/CRM/reminders",
        });

        for (const sub of subs) {
          try {
            await webPush.sendNotification({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            }, payload);
          } catch (e) {
            // Subscription may be expired — remove it
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
        sent++;
      } catch {
        // web-push not available or VAPID keys not set — skip
      }
    }

    // Mark as notified regardless
    await supabase.from("reminders").update({ notified_at: now.toISOString() }).eq("id", reminder.id);
  }

  return NextResponse.json({ processed: reminders.length, notificationsSent: sent });
}
