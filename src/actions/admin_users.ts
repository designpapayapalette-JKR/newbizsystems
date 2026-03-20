"use server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
  if (!profile?.is_super_admin) throw new Error("Super admin access required");
  return user;
}

export async function getAllPlatformUsers() {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  
  // Get all users from auth.users
  const { data: { users }, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  
  // Get profiles
  const { data: profiles } = await admin.from("profiles").select("*");
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  
  return users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    profile: profileMap[u.id] || null
  }));
}

export async function resetUserPassword(userId: string, newPassword: string) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  
  if (error) throw error;
  revalidatePath("/admin/users");
}
