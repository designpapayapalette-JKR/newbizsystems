import Link from "next/link";
import {
  Users, Bell, CreditCard, FileText, MessageCircle, Phone,
  CheckCircle2, BarChart2, Zap, Shield, Star, ArrowRight,
  Headphones, Package, Globe, Sparkles, TrendingUp,
  Clock, IndianRupee, BookOpen, Megaphone, Wallet, Store,
  FlaskConical, ChevronRight, Mail, Building2,
} from "lucide-react";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";

// ─── Products catalogue ────────────────────────────────────────────────────────

const products = [
  {
    name: "NewBiz CRM",
    tagline: "Sales & lead management for small teams",
    desc: "A complete CRM with Kanban pipeline, GST invoicing, PhonePe payments, reminders, helpdesk, and team collaboration — built specifically for Indian SMEs.",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-50 text-blue-600",
    status: "beta" as const,
    href: "/signup",
    cta: "Try Free — Beta Access",
    features: ["Lead pipeline", "GST invoicing", "PhonePe payments", "Team roles", "Push reminders"],
  },
  {
    name: "NewBiz Books",
    tagline: "Simple accounting for non-accountants",
    desc: "Track income, expenses, GST returns, and generate P&L — without needing a CA for day-to-day bookkeeping.",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50 text-emerald-600",
    status: "soon" as const,
    href: "#notify",
    cta: "Notify Me",
    features: ["Income & expense tracking", "GST returns", "P&L reports", "Bank reconciliation"],
  },
  {
    name: "NewBiz Campaigns",
    tagline: "WhatsApp & email marketing made simple",
    desc: "Send bulk WhatsApp messages, email campaigns, and follow-up sequences to your customer list — with real open & click tracking.",
    icon: Megaphone,
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-50 text-rose-600",
    status: "soon" as const,
    href: "#notify",
    cta: "Notify Me",
    features: ["Bulk WhatsApp", "Email campaigns", "Open & click tracking", "Drip sequences"],
  },
  {
    name: "NewBiz Pay",
    tagline: "Unified payments & collections dashboard",
    desc: "Accept UPI, cards, and net banking; send payment links; auto-reconcile with your invoices; and get a real-time collections dashboard.",
    icon: Wallet,
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-50 text-amber-600",
    status: "soon" as const,
    href: "#notify",
    cta: "Notify Me",
    features: ["UPI & card payments", "Payment links", "Auto-reconciliation", "Collections report"],
  },
  {
    name: "NewBiz Store",
    tagline: "Sell online with zero coding",
    desc: "A lightweight online store builder — add your products, set prices, share your store link, and start selling in under an hour.",
    icon: Store,
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-50 text-violet-600",
    status: "soon" as const,
    href: "#notify",
    cta: "Notify Me",
    features: ["Product catalogue", "Order management", "WhatsApp checkout", "Delivery tracking"],
  },
  {
    name: "NewBiz HR",
    tagline: "Attendance, payroll & leave for small teams",
    desc: "Manage employee attendance via mobile, run monthly payroll with PF/ESI deductions, and handle leave requests — all without HR software complexity.",
    icon: Building2,
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-50 text-cyan-600",
    status: "soon" as const,
    href: "#notify",
    cta: "Notify Me",
    features: ["Attendance & leave", "Payroll + PF/ESI", "Salary slips", "Employee portal"],
  },
];

// ─── CRM features ──────────────────────────────────────────────────────────────

const crmFeatures = [
  { icon: Users, title: "Lead Pipeline", desc: "Drag-drop Kanban board + list view. Never lose track of a deal.", color: "bg-blue-50 text-blue-600" },
  { icon: MessageCircle, title: "One-Tap Contact", desc: "WhatsApp, call, email or SMS any lead in one tap — mobile or desktop.", color: "bg-green-50 text-green-600" },
  { icon: Bell, title: "Smart Reminders", desc: "Push notifications with sound. Works even when the tab is in the background.", color: "bg-purple-50 text-purple-600" },
  { icon: FileText, title: "GST Invoicing", desc: "Professional invoices with GSTIN, HSN/SAC, tax split. Download as PDF instantly.", color: "bg-amber-50 text-amber-600" },
  { icon: CreditCard, title: "PhonePe Payments", desc: "Accept online payments, track dues, and mark paid in one click.", color: "bg-rose-50 text-rose-600" },
  { icon: BarChart2, title: "Reports & Insights", desc: "Pipeline value, conversion rates, revenue trends — real-time.", color: "bg-indigo-50 text-indigo-600" },
  { icon: Headphones, title: "Support Helpdesk", desc: "Manage customer tickets, set SLAs, and respond — no extra tool.", color: "bg-teal-50 text-teal-600" },
  { icon: Package, title: "Product Catalogue", desc: "Maintain your product/service list. Add to invoices in one click.", color: "bg-orange-50 text-orange-600" },
];

// ─── CRM plans ─────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Get started, no risk",
    borderColor: "border-gray-200",
    badge: null,
    highlight: false,
    features: ["50 leads", "1 member", "5 invoices/mo", "Basic pipeline", "Push reminders"],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    desc: "For growing businesses",
    borderColor: "border-blue-500",
    badge: "Most Popular",
    highlight: true,
    features: ["500 leads", "3 members", "50 invoices/mo", "Reminders & pipeline", "Email templates", "WhatsApp & calling"],
    cta: "Get Starter",
    href: "/signup",
  },
  {
    name: "Growth",
    price: "₹2,499",
    period: "/month",
    desc: "For scaling teams",
    borderColor: "border-purple-400",
    badge: null,
    highlight: false,
    features: ["2,000 leads", "10 members", "200 invoices/mo", "All Starter features", "Webhooks & API", "Audit log"],
    cta: "Start Growth",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "₹4,999",
    period: "/month",
    desc: "Unlimited everything",
    borderColor: "border-gray-700",
    badge: "Best Value",
    highlight: false,
    features: ["Unlimited leads", "Unlimited members", "Unlimited invoices", "All Growth features", "Priority support", "Custom branding"],
    cta: "Go Pro",
    href: "/signup",
  },
];

// ─── Why NewBiz ─────────────────────────────────────────────────────────────────

const whyUs = [
  { icon: IndianRupee, title: "Priced for Indian SMEs", desc: "Not ₹10,000/month tools built for US enterprises. Real pricing built around what Indian businesses can afford." },
  { icon: Zap, title: "Up and running in 15 min", desc: "Sign up, import leads from Excel, and start working. No IT team, no week-long setup." },
  { icon: Shield, title: "Your data stays yours", desc: "Hosted on secure infrastructure. GDPR & data protection built in. We never sell your data." },
  { icon: Headphones, title: "Hand-holding support", desc: "We don't just give you a login. Our team sets it up with you, trains your staff, and checks in regularly." },
  { icon: Globe, title: "Works on every device", desc: "Full-featured PWA. Works on your laptop in the office and your phone in the field — even on slow networks." },
  { icon: TrendingUp, title: "Grows with you", desc: "Start free on one product. Add more tools as you grow. Cancel any product, any time. No lock-in." },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Owner, RS Electricals",
    city: "Jaipur",
    product: "NewBiz CRM",
    quote: "Before BizCRM I was tracking leads in WhatsApp groups and a notebook. Now I close 40% more deals because nothing slips through.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Founder, Bloom Events",
    city: "Kochi",
    product: "NewBiz CRM",
    quote: "The GST invoicing alone saved us ₹5,000/month on the CA bill. Everything is in one place and the team loves it.",
    stars: 5,
  },
  {
    name: "Amit Desai",
    role: "Director, Desai Exports",
    city: "Surat",
    product: "NewBiz CRM",
    quote: "NewBiz actually helped us set up the whole thing. It wasn't just a tool sale — they walked us through every feature.",
    stars: 5,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function BetaBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      <FlaskConical className="h-2.5 w-2.5" /> Beta
    </span>
  );
}

function SoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      <Clock className="h-2.5 w-2.5" /> Coming Soon
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm leading-none block">NewBiz Systems</span>
              <span className="text-[10px] text-gray-400 leading-none">Digital tools for SMEs &amp; Startups</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#products" className="hover:text-gray-900 transition-colors">Products</a>
            <a href="#crm" className="hover:text-gray-900 transition-colors">NewBiz CRM</a>
            <a href="#why-us" className="hover:text-gray-900 transition-colors">Why NewBiz</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#notify" className="hover:text-gray-900 transition-colors">Early Access</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex text-sm text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Try CRM Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 pt-20 pb-28 sm:pt-28 sm:pb-36">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Beta pill */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <FlaskConical className="h-3.5 w-3.5" />
            Currently in Beta — Early access open now
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
            Digital tools built for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Indian SMEs &amp; Startups</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            NewBiz Systems is building a suite of affordable, easy-to-use digital tools — from CRM to accounting to payments — with real hand-holding support so your business actually benefits.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/40"
            >
              Try NewBiz CRM — Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-base font-medium px-7 py-3.5 rounded-xl transition-colors"
            >
              See all products
            </a>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            {[
              { icon: CheckCircle2, text: "First product live in Beta" },
              { icon: IndianRupee, text: "Minimal pricing for SMEs" },
              { icon: Headphones, text: "Hand-holding support" },
              { icon: Shield, text: "No lock-in contracts" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-blue-400" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="products" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">The NewBiz Suite</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">One platform, many tools</h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              We're building a suite of tools designed around how Indian small businesses actually work — starting with CRM and expanding product by product. Everything launches publicly one by one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = product.icon;
              const isBeta = product.status === "beta";
              return (
                <div
                  key={product.name}
                  className={`relative rounded-2xl border overflow-hidden flex flex-col transition-all ${
                    isBeta ? "border-blue-200 shadow-md shadow-blue-50 hover:shadow-lg" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Top gradient bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${product.color}`} />

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${product.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isBeta ? <BetaBadge /> : <SoonBadge />}
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-0.5">{product.name}</h3>
                    <p className={`text-sm font-medium mb-3 ${isBeta ? "text-blue-600" : "text-gray-400"}`}>{product.tagline}</p>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{product.desc}</p>

                    <ul className="space-y-1.5 mb-6">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isBeta ? "text-blue-500" : "text-gray-300"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={product.href}
                      className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                        isBeta
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-500 cursor-default"
                      }`}
                    >
                      {product.cta}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Roadmap note */}
          <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">More products launching through 2025–26</p>
              <p className="text-sm text-gray-500 mt-0.5">
                We're building each tool carefully, in stages. Sign up for early access and be among the first to use new products before public launch — at beta pricing.
              </p>
            </div>
            <a
              href="#notify"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
            >
              Get notified <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── CRM deep-dive ── */}
      <section id="crm" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <FlaskConical className="h-3 w-3" /> Live in Beta
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">NewBiz CRM — What&apos;s inside</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Our first product is already live and being used by SMEs. Here's everything it does out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {crmFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-md shadow-blue-100"
            >
              Start using NewBiz CRM free <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-sm text-gray-400 mt-2">Free plan available · No credit card · Up in 15 min</p>
          </div>
        </div>
      </section>

      {/* ── Communication callout ── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-3">On mobile, on desktop</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Reach every lead in one tap</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Call, WhatsApp, or email any lead directly from NewBiz CRM — no copy-pasting numbers, no switching apps.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                Try it free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MessageCircle, label: "WhatsApp", sub: "Send a DM in one tap" },
                { icon: Phone, label: "Direct Call", sub: "Tap to call from mobile" },
                { icon: Mail, label: "Email", sub: "Pre-filled from lead data" },
                { icon: Bell, label: "Reminders", sub: "Push alerts with sound" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-white border border-white/20">
                    <Icon className="h-6 w-6 mb-2 text-blue-200" />
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-blue-200 mt-0.5">{item.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why NewBiz ── */}
      <section id="why-us" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Why NewBiz Systems</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Not just software. A growth partner.</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              We're a small team that deeply understands Indian SME problems. Our tools are built to solve them — and our support team makes sure they do.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CRM Pricing ── */}
      <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              NewBiz CRM — Beta Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Start free. Upgrade when ready.</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Beta pricing is available now. Prices are locked in for early users — you keep the beta rate even after full launch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${plan.borderColor} ${
                  plan.highlight ? "bg-blue-600 shadow-2xl shadow-blue-200 scale-[1.03]" : "bg-white"
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    plan.highlight ? "bg-amber-400 text-amber-900" : "bg-gray-900 text-white"
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <p className={`font-bold text-lg mb-0.5 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</p>
                <p className={`text-xs mb-5 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>{plan.desc}</p>

                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-blue-200" : "text-green-500"}`} />
                      <span className={plan.highlight ? "text-blue-50" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center font-semibold py-2.5 rounded-xl text-sm transition-colors ${
                    plan.highlight
                      ? "bg-white text-blue-700 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            All plans include push notifications, WhatsApp &amp; calling, GST invoicing, and PhonePe payments. · Yearly billing saves up to 17%.
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Early adopter stories</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Businesses already seeing results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <StarRating count={t.stars} />
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{t.product}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role} · {t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Early access / notify ── */}
      <section id="notify" className="py-20 bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Be first when new products launch
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Get early access to every new tool</h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            We launch products one by one. Early access users get beta pricing locked in, personal onboarding, and direct line to our team to shape the product.
          </p>

          <EarlyAccessForm />
          <p className="text-slate-600 text-xs mt-3">No spam. Only product launch announcements.</p>
        </div>
      </section>

      {/* ── Hand-holding banner ── */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">We set it up with you — not just for you.</h2>
          <p className="text-blue-100 mb-7 max-w-xl mx-auto">
            Every NewBiz customer gets personal onboarding. We import your data, configure your workflow, train your team, and check in to make sure things are working.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/919999999999?text=Hi%2C+I+want+to+know+more+about+NewBiz+Systems"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white/70 text-white font-medium px-7 py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand col - wider */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-sm block leading-none">NewBiz Systems</span>
                  <span className="text-[10px] text-gray-400">Digital tools for SMEs &amp; Startups</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                We build affordable, practical digital tools for Indian small businesses and startups — with real human support at every step.
              </p>
            </div>

            {/* Products */}
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Products</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-1.5">
                  <Link href="/signup" className="hover:text-gray-900 transition-colors">NewBiz CRM</Link>
                  <BetaBadge />
                </li>
                <li className="text-gray-400">NewBiz Books <span className="text-[10px]">(soon)</span></li>
                <li className="text-gray-400">NewBiz Campaigns <span className="text-[10px]">(soon)</span></li>
                <li className="text-gray-400">NewBiz Pay <span className="text-[10px]">(soon)</span></li>
                <li className="text-gray-400">NewBiz Store <span className="text-[10px]">(soon)</span></li>
                <li className="text-gray-400">NewBiz HR <span className="text-[10px]">(soon)</span></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Company</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#why-us" className="hover:text-gray-900 transition-colors">Why NewBiz</a></li>
                <li><a href="#testimonials" className="hover:text-gray-900 transition-colors">Customer Stories</a></li>
                <li><a href="#notify" className="hover:text-gray-900 transition-colors">Early Access</a></li>
                <li><span className="text-gray-400">Blog (coming soon)</span></li>
                <li><span className="text-gray-400">Careers</span></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Support</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a
                    href="https://wa.me/919999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-green-500" /> WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@newbizsystems.in" className="hover:text-gray-900 transition-colors">
                    hello@newbizsystems.in
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Mon–Sat · 9am–7pm IST
                </li>
                <li><Link href="/login" className="hover:text-gray-900 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} NewBiz Systems. All rights reserved. · All products currently in Beta.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
