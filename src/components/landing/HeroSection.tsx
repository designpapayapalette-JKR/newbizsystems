import Link from "next/link";
import { ArrowRight, CheckCircle2, Headphones, IndianRupee, Shield, FlaskConical, Package, Layers } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 pt-20 pb-28 sm:pt-28 sm:pb-36">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <FlaskConical className="h-3.5 w-3.5" />
          Beta — <span className="text-white font-bold">FREE for everyone</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
          One platform to run<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">your entire business</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
          NewBiz is a modern <strong className="text-white">ERP built for Indian SMEs & Startups</strong>. CRM, HR & Payroll, GST Accounting, Payments, Campaigns, and more — all in one place, all talking to each other.
        </p>

        {/* Module pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 text-xs font-medium">
          {["CRM & Sales", "HR & Payroll", "GST Invoicing", "Payments", "Helpdesk", "Reports"].map(m => (
            <span key={m} className="bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full">{m}</span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/ERP/signup"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/40"
          >
            Start for Free <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-base font-medium px-7 py-3.5 rounded-xl transition-colors"
          >
            Explore all modules
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
          {[
            { icon: CheckCircle2, text: "GST-ready from day one" },
            { icon: IndianRupee, text: "Free during beta" },
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
  );
}
