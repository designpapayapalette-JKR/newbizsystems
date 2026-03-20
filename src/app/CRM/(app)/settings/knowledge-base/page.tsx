import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getKbArticles } from "@/actions/kb";
import { KbArticleForm } from "@/components/kb/KbArticleForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Globe, Link as LinkIcon, Edit } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

export default async function KnowledgeBaseSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase.from("profiles").select("current_org_id").eq("id", user.id).single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  // Get org slug for the public link
  const { data: org } = await supabase.from("organizations").select("slug").eq("id", profile.current_org_id).single();

  const articles = await getKbArticles().catch(() => []);

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <TopBar 
        title="Knowledge Base" 
        subtitle="Manage Help Center articles for your customers"
        actions={
          <div className="flex items-center gap-2">
            {org?.slug && (
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href={`/help/${org.slug}`} target="_blank">
                  <Globe className="h-4 w-4 mr-1.5" />
                  View Help Center
                </Link>
              </Button>
            )}
            <KbArticleForm />
          </div>
        }
      />

      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed rounded-xl">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No articles yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
              Create your first article to start building your public Help Center.
            </p>
            <KbArticleForm />
          </div>
        ) : (
          <div className="grid gap-3">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:border-border/80 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base text-foreground leading-none">{article.title}</h3>
                      {article.is_published ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                      <span className="bg-muted px-2 py-0.5 rounded-md text-xs font-medium text-foreground/70">{article.category}</span>
                      <span className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        {article.slug}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <KbArticleForm 
                      article={article} 
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      } 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
