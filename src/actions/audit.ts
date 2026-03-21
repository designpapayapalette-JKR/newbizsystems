"use server";
import { createClient } from "@/lib/supabase/server";

export async function logAudit(orgId: string, action: string, tableName: string, recordId?: string, oldData?: unknown, newData?: unknown) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      user_id: user?.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData as Record<string, unknown>,
      new_data: newData as Record<string, unknown>,
    });
  } catch {}
}

export async function getAuditLogs(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).maybeSingle();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("organization_id", profile?.current_org_id || "")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!logs?.length) return [];

  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return logs.map((l) => ({ ...l, user_profile: l.user_id ? (profileMap[l.user_id] ?? null) : null }));
}
