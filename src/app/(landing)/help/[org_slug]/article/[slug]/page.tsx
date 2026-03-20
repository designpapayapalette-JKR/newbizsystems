import { getPublicKbBySlug } from "@/actions/kb";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HelpCenterArticlePage({ 
  params 
}: { 
  params: Promise<{ org_slug: string; slug: string }> 
}) {
  const { org_slug, slug } = await params;
  const { articles, orgName } = await getPublicKbBySlug(org_slug).catch(() => ({ articles: [], orgName: null }));

  const article = articles.find((a: any) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] selection:bg-indigo-100 selection:text-indigo-900 tracking-[0.01em]">
      {/* Header */}
      <header className="bg-white border-b py-4 px-4 md:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href={`/help/${org_slug}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{orgName?.charAt(0) || "H"}</span>
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 hidden sm:block">
              {orgName} Help Center
            </h1>
          </Link>
          <div className="text-sm">
            <Link href={`/help/${org_slug}`} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Safety
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <article className="bg-white rounded-2xl shadow-sm border p-6 md:p-12">
          {/* Breadcrumb / Category */}
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm mb-6 uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            {article.category}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-12 pb-8 border-b">
            <div>
              <p>Last updated on {formatDate(article.updated_at)}</p>
            </div>
          </div>

          <div className="prose prose-indigo prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
            {article.content}
          </div>
        </article>

        {/* Feedback Section */}
        <div className="mt-12 text-center text-gray-500">
          <p>Did this article help you?</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button className="px-6 py-2 rounded-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors bg-white shadow-sm font-medium">
              👍 Yes
            </button>
            <button className="px-6 py-2 rounded-full border border-gray-200 hover:border-red-600 hover:text-red-600 transition-colors bg-white shadow-sm font-medium">
              👎 No
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t mt-16 bg-white">
        Powered by CRM SaaS
      </footer>
    </div>
  );
}
