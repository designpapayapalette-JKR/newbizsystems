"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getOrgAndUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) throw new Error("No org");
  return { supabase, user, orgId: profile.current_org_id };
}

export interface KbArticle {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function getKbArticles(category?: string) {
  const { supabase, orgId } = await getOrgAndUser();
  let query = supabase.from("kb_articles").select("*").eq("organization_id", orgId).order("updated_at", { ascending: false });
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    if (error.code === '42P01') return []; // table not created yet
    throw error;
  }
  return data as KbArticle[];
}

export async function getPublicKbArticles(orgId: string, category?: string) {
  const supabase = await createClient();
  let query = supabase.from("kb_articles").select("*").eq("organization_id", orgId).eq("is_published", true).order("updated_at", { ascending: false });
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return [];
  return data as KbArticle[];
}

export async function getPublicKbBySlug(slug: string, category?: string) {
  const supabase = await createClient();
  const { data: org } = await supabase.from("organizations").select("id, name").eq("slug", slug).single();
  if (!org) return { articles: [], orgName: "Help Center" };

  let query = supabase.from("kb_articles").select("*").eq("organization_id", org.id).eq("is_published", true).order("updated_at", { ascending: false });
  if (category) query = query.eq("category", category);

  const { data } = await query;
  return { articles: (data as KbArticle[]) ?? [], orgName: org.name };
}

export async function createKbArticle(data: { title: string; slug: string; content: string; category: string; is_published: boolean }) {
  const { supabase, orgId } = await getOrgAndUser();
  const { error } = await supabase.from("kb_articles").insert({
    organization_id: orgId,
    ...data,
  });

  if (error) throw error;
  revalidatePath("/CRM/settings/knowledge-base");
}

export async function updateKbArticle(id: string, data: Partial<KbArticle>) {
  const { supabase, orgId } = await getOrgAndUser();
  const { error } = await supabase.from("kb_articles").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id).eq("organization_id", orgId);
  if (error) throw error;
  revalidatePath("/CRM/settings/knowledge-base");
}

export async function deleteKbArticle(id: string) {
  const { supabase, orgId } = await getOrgAndUser();
  const { error } = await supabase.from("kb_articles").delete().eq("id", id).eq("organization_id", orgId);
  if (error) throw error;
  revalidatePath("/CRM/settings/knowledge-base");
}
