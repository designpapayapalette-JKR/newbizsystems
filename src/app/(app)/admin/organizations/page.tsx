import { getAllOrgsWithSubscriptions, getAllPlans } from "@/actions/subscriptions";
import { AdminOrgsTable } from "@/components/admin/AdminOrgsTable";

export default async function AdminOrganizationsPage() {
  const [orgs, plans] = await Promise.all([
    getAllOrgsWithSubscriptions(),
    getAllPlans(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage subscriptions for all organizations on the platform.</p>
      </div>
      <AdminOrgsTable orgs={orgs as any} plans={plans} />
    </div>
  );
}
