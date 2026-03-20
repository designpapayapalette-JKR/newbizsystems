"use client";
import { useState } from "react";
import { resetUserPassword } from "@/actions/admin_users";
import { formatDateTime } from "@/lib/utils";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminUsersTable({ users }: { users: any[] }) {
  const [resettingId, setResettingId] = useState<string | null>(null);

  async function handleResetPassword(userId: string) {
    const newPassword = prompt("Enter new password for this user:");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setResettingId(userId);
      await resetUserPassword(userId, newPassword);
      toast.success("Password updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password");
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 whitespace-nowrap">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Created At</th>
              <th className="px-5 py-3 font-medium">Last Sign In</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium whitespace-nowrap">
                  {user.profile?.full_name || "Unknown"}
                  {user.profile?.is_super_admin && (
                    <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-block">
                      Super Admin
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">{user.email}</td>
                <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(user.created_at)}</td>
                <td className="px-5 py-3 whitespace-nowrap">{user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : "Never"}</td>
                <td className="px-5 py-3 text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleResetPassword(user.id)}
                    disabled={resettingId === user.id}
                    className="gap-2"
                  >
                    <Key className="h-3.5 w-3.5" />
                    Reset Password
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
