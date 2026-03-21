"use server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).maybeSingle();
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
  revalidatePath("/ERP/admin/users");
}

export async function createPlatformUser(data: { email: string; password?: string; full_name: string; is_super_admin: boolean }) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  
  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password || Math.random().toString(36).slice(-8) + "Aa1!",
    email_confirm: true,
  });
  
  if (authError) throw authError;
  const newUserId = authData.user.id;
  
  // Create profile
  const { error: profileError } = await admin.from("profiles").insert({
    id: newUserId,
    full_name: data.full_name,
    is_super_admin: data.is_super_admin,
  });
  
  if (profileError) {
    // Rollback auth user creation if profile insert fails
    await admin.auth.admin.deleteUser(newUserId);
    throw profileError;
  }
  
  revalidatePath("/ERP/admin/users");
  return newUserId;
}

export async function updatePlatformUser(userId: string, data: { full_name?: string; is_super_admin?: boolean }) {
  await requireSuperAdmin();
  const admin = await createServiceClient();
  
  const { error } = await admin.from("profiles").update({
    ...(data.full_name !== undefined && { full_name: data.full_name }),
    ...(data.is_super_admin !== undefined && { is_super_admin: data.is_super_admin }),
  }).eq("id", userId);
  
  if (error) throw error;
  revalidatePath("/ERP/admin/users");
}

export async function deletePlatformUser(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  if (user.id === userId) throw new Error("You cannot delete your own account");

  await requireSuperAdmin();
  const admin = await createServiceClient();
  
  // Optional: Delete profile first if cascade isn't set up perfectly
  await admin.from("profiles").delete().eq("id", userId);
  
  // Delete from auth.users
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
  
  revalidatePath("/ERP/admin/users");
}
