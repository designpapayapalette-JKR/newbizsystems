import { getEmailTemplates } from "@/actions/templates";
import { TemplatesManager } from "@/components/settings/TemplatesManager";

export default async function TemplatesPage() {
  const templates = await getEmailTemplates();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage reusable email templates. Use{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">{"{{name}}"}</code>,{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">{"{{company}}"}</code>,{" "}
        <code className="bg-gray-100 px-1 rounded text-xs">{"{{deal_value}}"}</code> as dynamic variables.
      </p>
      <TemplatesManager templates={templates as any[]} />
    </div>
  );
}
