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

export interface TicketMacro {
  id: string;
  organization_id: string;
  title: string;
  content_template: string;
  created_at: string;
}

export async function getMacros() {
  const { supabase, orgId } = await getOrgAndUser();
  const { data, error } = await supabase
    .from("ticket_macros")
    .select("*")
    .eq("organization_id", orgId)
    .order("title");

  if (error) {
    if (error.code === '42P01') {
      // relation "public.ticket_macros" does not exist (migration not applied yet)
      return [];
    }
    throw error;
  }
  return data as TicketMacro[];
}

export async function createMacro(title: string, content_template: string) {
  const { supabase, orgId } = await getOrgAndUser();
  const { data, error } = await supabase
    .from("ticket_macros")
    .insert({
      organization_id: orgId,
      title,
      content_template,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/CRM/tickets/[id]", "page"); 
  return data as TicketMacro;
}
