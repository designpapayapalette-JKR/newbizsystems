import { Sparkles } from "lucide-react";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";

export function EarlyAccessSection() {
  return (
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
  );
}
