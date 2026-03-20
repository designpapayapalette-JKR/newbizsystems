import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | ERP Tips, GST Guides & Startup Resources for Indian SMEs",
  description: "Expert articles on ERP software, GST compliance, HR payroll, CRM for Indian small businesses and startups. Practical guides to help you run your business better.",
  keywords: ["ERP blog India", "GST guide small business", "HR payroll India guide", "CRM tips India", "startup software guide India"],
};

const posts = [
  {
    slug: "best-erp-software-indian-smes-2025",
    title: "Best ERP Software for Indian SMEs in 2025 — Complete Guide",
    excerpt: "Choosing the right ERP for your Indian small business can save you lakhs every year. We compare the top platforms and show you what to look for.",
    date: "March 18, 2025",
    readTime: "8 min read",
    tag: "ERP",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    slug: "gst-invoicing-small-business-india",
    title: "How to Create GST-Compliant Invoices Without an Accountant",
    excerpt: "A step-by-step guide to generating legally compliant GST invoices for your business — including GSTIN, HSN codes, and CGST/SGST split.",
    date: "March 15, 2025",
    readTime: "6 min read",
    tag: "GST & Finance",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    slug: "pf-esi-payroll-guide-india",
    title: "PF and ESI for Small Business Owners in India — Complete 2025 Guide",
    excerpt: "Everything you need to know about Provident Fund (PF) and Employee State Insurance (ESI) deductions — when they apply, how to calculate, and how to file.",
    date: "March 12, 2025",
    readTime: "9 min read",
    tag: "HR & Payroll",
    tagColor: "bg-cyan-100 text-cyan-700",
  },
  {
    slug: "why-indian-startups-need-erp-not-crm",
    title: "Why Indian Startups Need an ERP System (Not Just a CRM)",
    excerpt: "Most founders think they just need a CRM. But as your team and operations grow, a CRM alone will show its cracks. Here's why an integrated ERP changes everything.",
    date: "March 9, 2025",
    readTime: "5 min read",
    tag: "Strategy",
    tagColor: "bg-purple-100 text-purple-700",
  },
  {
    slug: "free-hr-software-small-business-india",
    title: "Free HR Software for Small Businesses in India — Manage Attendance & Payroll",
    excerpt: "Running HR on WhatsApp and Excel? Here's how modern free HR tools can automate attendance, leaves, and monthly payroll — even for 5-person teams.",
    date: "March 6, 2025",
    readTime: "7 min read",
    tag: "HR & Payroll",
    tagColor: "bg-cyan-100 text-cyan-700",
  },
];

export default function BlogListingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-950 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Resources</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">NewBiz Blog</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Practical guides on ERP, GST, HR payroll, and CRM — written specifically for Indian small businesses and startups.
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        {posts.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white border border-gray-100 hover:border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>{post.tag}</span>
              <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">{post.title}</h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{post.excerpt}</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold gap-1">
              Read article <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </div>
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-slate-950 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to simplify your business?</h2>
        <p className="text-slate-400 mb-6">Try NewBiz ERP free — no credit card, no commitment.</p>
        <a href="/ERP/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors">
          Get Started Free →
        </a>
      </div>
    </div>
  );
}
