import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BlogPost {
  title: string;
  date: string;
  readTime: string;
  tag: string;
  tagColor: string;
  content: React.ReactNode;
  description: string;
}

const blogData: Record<string, BlogPost> = {
  "best-erp-software-indian-smes-2025": {
    title: "Best ERP Software for Indian SMEs in 2025 — Complete Guide",
    date: "March 18, 2025",
    readTime: "8 min read",
    tag: "ERP",
    tagColor: "bg-blue-100 text-blue-700",
    description: "Choosing the right ERP for your Indian small business can save you lakhs every year. We compare the top platforms and show you what to look for.",
    content: (
      <div className="prose prose-slate prose-blue lg:prose-lg max-w-none">
        <p>In 2025, the landscape for Indian Small and Medium Enterprises (SMEs) has shifted dramatically. With increasing digitalization and the push for GST compliance, manual record-keeping is no longer sustainable. Choosing the right Enterprise Resource Planning (ERP) software is now a strategic necessity rather than a luxury.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Why Indian SMEs Need a Dedicated ERP</h2>
        <p>Most global ERP solutions are built for large Western enterprises, making them overly complex and expensive for Indian businesses. An SME in India needs a system that handles:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>GST Compliance:</strong> Real-time CGST, SGST, and IGST calculations.</li>
          <li><strong>HR & Payroll:</strong> Automated PF, ESI, and Professional Tax deductions.</li>
          <li><strong>Local Payments:</strong> Seamless integration with UPI and gateways like PhonePe.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Top Features to Look For</h2>
        <ol className="list-decimal pl-6 space-y-2 mb-6">
          <li><strong>Unified Dashboard:</strong> One place to see sales, HR, and finance.</li>
          <li><strong>Mobile Accessibility:</strong> Many Indian business owners manage operations on the go.</li>
          <li><strong>Scalability:</strong> The software should grow as your team grows.</li>
        </ol>

        <p>NewBiz ERP is specifically designed to meet these needs, offering a free beta version that includes a robust CRM, HR module, and GST-ready invoicing.</p>
      </div>
    ),
  },
  "gst-invoicing-small-business-india": {
    title: "How to Create GST-Compliant Invoices Without an Accountant",
    date: "March 15, 2025",
    readTime: "6 min read",
    tag: "GST & Finance",
    tagColor: "bg-emerald-100 text-emerald-700",
    description: "A step-by-step guide to generating legally compliant GST invoices for your business — including GSTIN, HSN codes, and CGST/SGST split.",
    content: (
      <div className="prose prose-slate prose-blue lg:prose-lg max-w-none">
        <p>Generating a GST invoice can be intimidating for new business owners. However, with the right tools, you can automate this process and stay compliant without hiring a full-time accountant for daily billing.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Essential Components of a GST Invoice</h2>
        <p>Under the CGST Act, every GST-compliant invoice must contain:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>GSTIN of Supplier & Recipient:</strong> Your unique Goods and Services Tax Identification Number.</li>
          <li><strong>HSN/SAC Codes:</strong> Classification codes for goods and services.</li>
          <li><strong>Tax Split:</strong> Clear breakdown of Central Tax (CGST), State Tax (SGST), or Integrated Tax (IGST).</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Common Mistakes to Avoid</h2>
        <p>Many businesses fail to update their invoice sequences or provide incorrect HSN codes, leading to trouble during audits. Using a system like NewBiz ERP ensures that these numbers are tracked automatically.</p>
      </div>
    ),
  },
  "pf-esi-payroll-guide-india": {
    title: "PF and ESI for Small Business Owners in India — Complete 2025 Guide",
    date: "March 12, 2025",
    readTime: "9 min read",
    tag: "HR & Payroll",
    tagColor: "bg-cyan-100 text-cyan-700",
    description: "Everything you need to know about Provident Fund (PF) and Employee State Insurance (ESI) deductions — when they apply, how to calculate, and how to file.",
    content: (
      <div className="prose prose-slate prose-blue lg:prose-lg max-w-none">
        <p>Compliance is often the biggest headache for small teams. As you hire your first 10-20 employees, understanding PF (Provident Fund) and ESI (Employee State Insurance) becomes critical.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">When Does PF & ESI Apply?</h2>
        <p>Generally, PF is mandatory for establishments with 20 or more employees, while ESI applies to those with 10 or more (in certain states). However, voluntary registration is common to provide better benefits to employees.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Calculations Made Simple</h2>
        <p>PF typically involves a 12% contribution from both employee and employer. ESI rates are much lower but require precise monthly tracking. Modern HR modules, like the one in NewBiz ERP, handle these calculations automatically during payroll runs.</p>
      </div>
    ),
  },
  "why-indian-startups-need-erp-not-crm": {
    title: "Why Indian Startups Need an ERP System (Not Just a CRM)",
    date: "March 9, 2025",
    readTime: "5 min read",
    tag: "Strategy",
    tagColor: "bg-purple-100 text-purple-700",
    description: "Most founders think they just need a CRM. But as your team and operations grow, a CRM alone will show its cracks. Here's why an integrated ERP changes everything.",
    content: (
      <div className="prose prose-slate prose-blue lg:prose-lg max-w-none">
        <p>In the early stages, a CRM is great for tracking sales. But once you have a team, customers, and rising expenses, you need more than just one-way data. You need an "Enterprise" view of your business.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">The Integration Advantage</h2>
        <p>When your CRM talks to your HR module and your Finance module, magic happens. You can see the ROI of each employee, track commission directly from paid invoices, and manage cash flow in real-time.</p>
        
        <p>NewBiz ERP provides this level of integration for free during its beta period, giving startups the power of corporate tools without the corporate price tag.</p>
      </div>
    ),
  },
  "free-hr-software-small-business-india": {
    title: "Free HR Software for Small Businesses in India — Manage Attendance & Payroll",
    date: "March 6, 2025",
    readTime: "7 min read",
    tag: "HR & Payroll",
    tagColor: "bg-cyan-100 text-cyan-700",
    description: "Running HR on WhatsApp and Excel? Here's how modern free HR tools can automate attendance, leaves, and monthly payroll — even for 5-person teams.",
    content: (
      <div className="prose prose-slate prose-blue lg:prose-lg max-w-none">
        <p>Managing attendance on registers and calculating payroll on Excel is a recipe for errors. For a small business, time is money, and even an hour saved every day can lead to massive productivity gains.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Automating Attendance</h2>
        <p>With a digital attendance tracker, employees can be marked as present, out on leave, or on half-day with one click. This data flows directly into the payroll system at the end of the month.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">NewBiz HR: The SME Solution</h2>
        <p>Our HR module, now part of the NewBiz ERP suite, offers a clean interface for attendance and leave management, specifically tailored for Indian compliance standards.</p>
      </div>
    ),
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogData[slug];
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogData[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to all articles
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>{post.tag}</span>
          <span className="text-sm text-gray-500">{post.date} · {post.readTime}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 mb-10 leading-[1.15]">
          {post.title}
        </h1>

        <div className="w-full h-px bg-slate-100 mb-12" />

        <div className="blog-content">
          {post.content}
        </div>

        {/* Post-content CTA */}
        <div className="mt-20 p-8 rounded-3xl bg-slate-950 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to transform your business?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">Join 500+ Indian SMEs using NewBiz ERP to manage CRM, HR, and Billing in one unified platform.</p>
          <Link href="/ERP/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-900/40">
            Start Your Free Trial →
          </Link>
        </div>
      </div>
    </div>
  );
}
