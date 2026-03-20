"use server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_leads: number | null;
  max_members: number | null;
  max_invoices: number | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface OrgSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  billing_cycle: "monthly" | "yearly";
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  plan?: SubscriptionPlan;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
  if (!profile?.is_super_admin) throw new Error("Super admin access required");
  return user;
}

// ── Public reads ───────────────────────────────────────────────────────────────

export async function getPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, features: p.features ?? [] }));
}

export async function getOrgSubscription(orgId: string): Promise<OrgSubscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("org_subscriptions")
    .select("*, plan:subscription_plans(*)")
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!data) return null;
  return { ...data, plan: data.plan ? { ...data.plan, features: data.plan.features ?? [] } : undefined };
}

export async function getOrgUsage(orgId: string) {
  const supabase = await createClient();
  const [leadsRes, membersRes, invoicesRes] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("is_archived", false),
    supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
  ]);
  return {
    leads: leadsRes.count ?? 0,
    members: membersRes.count ?? 0,
    invoices: invoicesRes.count ?? 0,
  };
}

// ── Super admin reads ──────────────────────────────────────────────────────────

export async function getAllOrgsWithSubscriptions() {
  await requireSuperAdmin();
  const admin = await createServiceClient();

  const { data, error } = await admin
    .from("organizations")
    .select(`
      id, name, slug, created_at, plan,
      subscription:org_subscriptions(*, plan:subscription_plans(*)),
      member_count:organization_members(count)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  const { data, error } = await admin.from("subscription_plans").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, features: p.features ?? [] }));
}

// ── Super admin mutations ──────────────────────────────────────────────────────

export async function assignSubscription(orgId: string, planId: string, opts: {
  billing_cycle?: "monthly" | "yearly";
  expires_at?: string | null;
  status?: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  notes?: string | null;
}) {
  const user = await requireSuperAdmin();
  const admin = await createServiceClient();

  const { error } = await admin.from("org_subscriptions").upsert({
    organization_id: orgId,
    plan_id: planId,
    billing_cycle: opts.billing_cycle ?? "monthly",
    status: opts.status ?? "active",
    expires_at: opts.expires_at ?? null,
    notes: opts.notes ?? null,
    created_by: user.id,
    started_at: new Date().toISOString(),
    cancelled_at: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "organization_id" });

  if (error) throw error;
  revalidatePath("/ERP/admin");
  revalidatePath("/ERP/settings/billing");
}

export async function updateSubscriptionStatus(orgId: string, status: "trialing" | "active" | "past_due" | "cancelled" | "expired", notes?: string) {
  await requireSuperAdmin();
  const admin = await createServiceClient();

  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (notes !== undefined) update.notes = notes;
  if (status === "cancelled") update.cancelled_at = new Date().toISOString();

  const { error } = await admin.from("org_subscriptions").update(update).eq("organization_id", orgId);
  if (error) throw error;
  revalidatePath("/ERP/admin");
  revalidatePath("/ERP/settings/billing");
}

export async function createPlan(data: Omit<SubscriptionPlan, "id">) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  const { error } = await admin.from("subscription_plans").insert({ ...data });
  if (error) throw error;
  revalidatePath("/ERP/admin");
}

export async function updatePlan(id: string, data: Partial<Omit<SubscriptionPlan, "id">>) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  const { error } = await admin.from("subscription_plans").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/admin");
  revalidatePath("/ERP/settings/billing");
}

export async function deletePlan(id: string) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  // Soft delete — mark inactive
  const { error } = await admin.from("subscription_plans").update({ is_active: false }).eq("id", id);
  if (error) throw error;
  revalidatePath("/ERP/admin");
}

export async function setSuperAdmin(userId: string, value: boolean) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  const { error } = await admin.from("profiles").update({ is_super_admin: value }).eq("id", userId);
  if (error) throw error;
  revalidatePath("/ERP/admin");
}
