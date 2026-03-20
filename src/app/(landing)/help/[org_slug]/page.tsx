import { getPublicKbBySlug } from "@/actions/kb";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function HelpCenterPage({ 
  params 
}: { 
  params: Promise<{ org_slug: string }> 
}) {
  const { org_slug } = await params;
  const { articles, orgName } = await getPublicKbBySlug(org_slug).catch(() => ({ articles: [], orgName: null }));

  if (!orgName && articles.length === 0) {
    notFound();
  }

  // Group articles by category
  const categories = Array.from(new Set(articles.map((a: any) => a.category)));
  const sortedCategories = categories.sort();

  return (
    <div className="min-h-screen bg-[#FAFBFD] selection:bg-indigo-100 selection:text-indigo-900 tracking-[0.01em]">
      {/* Header */}
      <header className="bg-white border-b py-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">{orgName?.charAt(0) || "H"}</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {orgName} Help Center
          </h1>
        </div>
      </header>

      {/* Hero Search */}
      <div className="bg-indigo-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How can we help you?</h2>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, and FAQs..."
              className="w-full h-14 pl-12 pr-4 rounded-xl text-gray-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 placeholder:text-gray-400 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No articles available</h3>
            <p className="text-gray-500 mt-1">This organization hasn't published any help articles yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCategories.map((category) => {
              const categoryArticles = articles.filter((a: any) => a.category === category);
              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 border-b pb-2">{category}</h3>
                  <ul className="space-y-3">
                    {categoryArticles.map((article: any) => (
                      <li key={article.id}>
                        <Link 
                          href={`/help/${org_slug}/article/${article.slug}`}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-start gap-2"
                        >
                          <BookOpen className="h-4 w-4 shrink-0 mt-1 opacity-70" />
                          <span>{article.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t mt-16 bg-white">
        Powered by CRM SaaS
      </footer>
    </div>
  );
}
