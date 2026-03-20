"use client";
import { useState, useTransition } from "react";
import { resetUserPassword, createPlatformUser, updatePlatformUser, deletePlatformUser } from "@/actions/admin_users";
import { formatDateTime } from "@/lib/utils";
import { Key, Plus, Pencil, Trash2, Search, UserCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export function AdminUsersTable({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create User State
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleResetPassword(userId: string) {
    const newPass = prompt("Enter new password for this user:");
    if (!newPass) return;
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setResettingId(userId);
      await resetUserPassword(userId, newPass);
      toast.success("Password updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password");
    } finally {
      setResettingId(null);
    }
  }

  function handleCreate() {
    if (!newEmail || !newName) {
      toast.error("Email and Name are required");
      return;
    }
    startTransition(async () => {
      try {
        await createPlatformUser({
          email: newEmail,
          password: newPassword || undefined,
          full_name: newName,
          is_super_admin: newIsAdmin,
        });
        toast.success("User created successfully");
        setIsNewOpen(false);
        setNewEmail("");
        setNewPassword("");
        setNewName("");
        setNewIsAdmin(false);
      } catch (e: any) {
        toast.error(e.message || "Failed to create user");
      }
    });
  }

  function openEdit(user: any) {
    setEditingUser(user);
    setEditName(user.profile?.full_name || "");
    setEditIsAdmin(!!user.profile?.is_super_admin);
  }

  function handleUpdate() {
    if (!editingUser) return;
    startTransition(async () => {
      try {
        await updatePlatformUser(editingUser.id, {
          full_name: editName,
          is_super_admin: editIsAdmin,
        });
        toast.success("User updated successfully");
        setEditingUser(null);
      } catch (e: any) {
        toast.error(e.message || "Failed to update user");
      }
    });
  }

  function handleDelete(user: any) {
    if (!confirm(`Are you sure you want to completely DELETE ${user.email} from the platform? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deletePlatformUser(user.id);
        toast.success("User deleted successfully");
      } catch (e: any) {
        toast.error(e.message || "Failed to delete user");
      }
    });
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New User
        </Button>
      </div>

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
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{user.profile?.full_name || "Unknown"}</p>
                        {user.profile?.is_super_admin && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded w-max font-bold">
                            <ShieldAlert className="h-3 w-3" />
                            SUPER ADMIN
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 font-medium">{user.email}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-gray-500">{formatDateTime(user.created_at)}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-gray-500">{user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : "Never"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        title="Edit User"
                        onClick={() => openEdit(user)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-amber-600"
                        title="Reset Password"
                        onClick={() => handleResetPassword(user.id)}
                        disabled={resettingId === user.id || isPending}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete User"
                        onClick={() => handleDelete(user)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No users found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Platform User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name *</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address *</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password <span className="text-muted-foreground font-normal">(Leave blank to auto-generate)</span></label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t mt-4">
              <input
                type="checkbox"
                id="is_admin_new"
                checked={newIsAdmin}
                onChange={(e) => setNewIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="is_admin_new" className="text-sm font-medium text-gray-900 flex items-center gap-1 cursor-pointer">
                <ShieldAlert className="h-4 w-4 text-purple-600" />
                Grant Super Admin Privileges
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isPending || !newEmail || !newName}>
              {isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingUser} onOpenChange={(val) => !val && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-500">Email Address (Cannot be changed here)</label>
              <Input value={editingUser?.email || ""} disabled className="bg-gray-50" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t mt-4">
              <input
                type="checkbox"
                id="is_admin_edit"
                checked={editIsAdmin}
                onChange={(e) => setEditIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="is_admin_edit" className="text-sm font-medium text-gray-900 flex items-center gap-1 cursor-pointer">
                <ShieldAlert className="h-4 w-4 text-purple-600" />
                Grant Super Admin Privileges
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isPending || !editName}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
