import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
      <article className="prose prose-slate lg:prose-lg mx-auto">
        <p>In 2025, the landscape for Indian Small and Medium Enterprises (SMEs) has shifted dramatically. With increasing digitalization and the push for GST compliance, manual record-keeping is no longer sustainable. Choosing the right Enterprise Resource Planning (ERP) software is now a strategic necessity rather than a luxury.</p>
        
        <h2>Why Indian SMEs Need a Dedicated ERP</h2>
        <p>Most global ERP solutions are built for large Western enterprises, making them overly complex and expensive for Indian businesses. An SME in India needs a system that handles:</p>
        <ul>
          <li><strong>GST Compliance:</strong> Real-time CGST, SGST, and IGST calculations.</li>
          <li><strong>HR & Payroll:</strong> Automated PF, ESI, and Professional Tax deductions.</li>
          <li><strong>Local Payments:</strong> Seamless integration with UPI and gateways like PhonePe.</li>
        </ul>

        <h2>Top Features to Look For</h2>
        <ol>
          <li><strong>Unified Dashboard:</strong> One place to see sales, HR, and finance.</li>
          <li><strong>Mobile Accessibility:</strong> Many Indian business owners manage operations on the go.</li>
          <li><strong>Scalability:</strong> The software should grow as your team grows.</li>
        </ol>

        <p>NewBiz ERP is specifically designed to meet these needs, offering a free beta version that includes a robust CRM, HR module, and GST-ready invoicing.</p>
      </article>
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
      <article className="prose prose-slate lg:prose-lg mx-auto">
        <p>Generating a GST invoice can be intimidating for new business owners. However, with the right tools, you can automate this process and stay compliant without hiring a full-time accountant for daily billing.</p>
        
        <h2>Essential Components of a GST Invoice</h2>
        <p>Under the CGST Act, every GST-compliant invoice must contain:</p>
        <ul>
          <li><strong>GSTIN of Supplier & Recipient:</strong> Your unique Goods and Services Tax Identification Number.</li>
          <li><strong>HSN/SAC Codes:</strong> Classification codes for goods and services.</li>
          <li><strong>Tax Split:</strong> Clear breakdown of Central Tax (CGST), State Tax (SGST), or Integrated Tax (IGST).</li>
        </ul>

        <h2>Common Mistakes to Avoid</h2>
        <p>Many businesses fail to update their invoice sequences or provide incorrect HSN codes, leading to trouble during audits. Using a system like NewBiz ERP ensures that these numbers are tracked automatically.</p>
      </article>
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
      <article className="prose prose-slate lg:prose-lg mx-auto">
        <p>Compliance is often the biggest headache for small teams. As you hire your first 10-20 employees, understanding PF (Provident Fund) and ESI (Employee State Insurance) becomes critical.</p>
        
        <h2>When Does PF & ESI Apply?</h2>
        <p>Generally, PF is mandatory for establishments with 20 or more employees, while ESI applies to those with 10 or more (in certain states). However, voluntary registration is common to provide better benefits to employees.</p>

        <h2>Calculations Made Simple</h2>
        <p>PF typically involves a 12% contribution from both employee and employer. ESI rates are much lower but require precise monthly tracking. Modern HR modules, like the one in NewBiz ERP, handle these calculations automatically during payroll runs.</p>
      </article>
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
      <article className="prose prose-slate lg:prose-lg mx-auto">
        <p>In the early stages, a CRM is great for tracking sales. But once you have a team, customers, and rising expenses, you need more than just one-way data. You need an "Enterprise" view of your business.</p>
        
        <h2>The Integration Advantage</h2>
        <p>When your CRM talks to your HR module and your Finance module, magic happens. You can see the ROI of each employee, track commission directly from paid invoices, and manage cash flow in real-time.</p>
        
        <p>NewBiz ERP provides this level of integration for free during its beta period, giving startups the power of corporate tools without the corporate price tag.</p>
      </article>
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
      <article className="prose prose-slate lg:prose-lg mx-auto">
        <p>Managing attendance on registers and calculating payroll on Excel is a recipe for errors. For a small business, time is money, and even an hour saved every day can lead to massive productivity gains.</p>
        
        <h2>Automating Attendance</h2>
        <p>With a digital attendance tracker, employees can be marked as present, out on leave, or on half-day with one click. This data flows directly into the payroll system at the end of the month.</p>

        <h2>NewBiz HR: The SME Solution</h2>
        <p>Our HR module, now part of the NewBiz ERP suite, offers a clean interface for attendance and leave management, specifically tailored for Indian compliance standards.</p>
      </article>
    ),
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogData[params.slug];
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogData[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>{post.tag}</span>
          <span className="text-sm text-gray-500">{post.date} · {post.readTime}</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="w-full h-px bg-gray-100 mb-12" />

        <div className="blog-content">
          {post.content}
        </div>
      </div>
    </div>
  );
}
