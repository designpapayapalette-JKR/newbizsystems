import { getWebhooks } from "@/actions/webhooks";
import { WebhooksManager } from "@/components/settings/WebhooksManager";

export default async function WebhooksPage() {
  const webhooks = await getWebhooks();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Webhooks</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Send real-time HTTP POST notifications to external services when events occur in your CRM.
      </p>
      <WebhooksManager webhooks={webhooks as any[]} />
    </div>
  );
}
