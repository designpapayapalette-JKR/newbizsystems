"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Headphones, IndianRupee, Shield, Zap, TrendingUp, Users, FileText, Briefcase } from "lucide-react";

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatCard({ value, label, prefix = "", suffix = "" }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
        {prefix}{count.toLocaleString("en-IN")}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

const modules = [
  {
    icon: Users,
    name: "CRM & Sales",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    items: ["Lead Pipeline", "Follow-up Reminders", "WhatsApp & Calling"],
  },
  {
    icon: Briefcase,
    name: "HR & Payroll",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    items: ["Attendance Tracking", "Leave Approvals", "PF/ESI Payroll"],
  },
  {
    icon: FileText,
    name: "Finance",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    items: ["GST Invoicing", "PhonePe Payments", "P&L Reports"],
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-16 pb-0">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-600/30 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-blue-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-1/4 w-48 h-48 bg-purple-700/20 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 -ml-3.5" />
          Beta is live — <span className="text-white font-bold ml-1">FREE for everyone</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
          Stop juggling<br />
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              6 different apps.
            </span>
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed font-light">
          One ERP to replace your scattered WhatsApp notes, Excel sheets, and overpriced SaaS tools.
          Built ground-up for <strong className="text-white font-semibold">Indian SMEs & Startups.</strong>
        </p>

        {/* Pain → solution */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-10">
          <span className="line-through">₹50,000/yr on software</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400 font-semibold">₹0 while in Beta</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/ERP/signup"
            className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-blue-900/60 hover:shadow-blue-700/60 hover:-translate-y-0.5"
          >
            Start for Free — No Card Needed
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-base font-medium px-8 py-4 rounded-xl transition-colors backdrop-blur"
          >
            See all modules
          </a>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-400 mb-20">
          {[
            { icon: CheckCircle2, text: "GST-ready out of the box" },
            { icon: IndianRupee, text: "Free during beta" },
            { icon: Headphones, text: "Human support included" },
            { icon: Shield, text: "No lock-in, ever" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-blue-400 shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* Module cards floating preview */}
        <div className="relative">
          {/* Fade gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.name} className={`rounded-2xl border backdrop-blur-sm p-5 ${mod.bg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-white/5`}>
                      <Icon className={`h-5 w-5 ${mod.color}`} />
                    </div>
                    <span className="font-semibold text-white text-sm">{mod.name}</span>
                  </div>
                  <ul className="space-y-2">
                    {mod.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${
                      mod.color.includes("blue") ? "from-blue-500 to-indigo-500" :
                      mod.color.includes("cyan") ? "from-cyan-500 to-blue-500" :
                      "from-emerald-500 to-teal-500"
                    } w-3/4 opacity-60`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <StatCard value={500} suffix="+" label="Businesses onboarded" />
          <StatCard value={12000} suffix="+" label="Leads tracked" />
          <StatCard value={98} suffix="%" label="Satisfaction rate" />
          <StatCard value={15} label="Mins to get started" />
        </div>
      </div>
    </section>
  );
}
