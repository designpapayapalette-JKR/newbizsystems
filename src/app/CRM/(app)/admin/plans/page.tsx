import { getAllPlans } from "@/actions/subscriptions";
import { AdminPlansManager } from "@/components/admin/AdminPlansManager";

export default async function AdminPlansPage() {
  const plans = await getAllPlans();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and manage plans available to organizations.</p>
      </div>
      <AdminPlansManager plans={plans} />
    </div>
  );
}
