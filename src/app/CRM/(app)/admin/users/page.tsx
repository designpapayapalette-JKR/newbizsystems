import { getAllPlatformUsers } from "@/actions/admin_users";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const users = await getAllPlatformUsers();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all platform users and reset passwords.</p>
      </div>
      <AdminUsersTable users={users} />
    </div>
  );
}
