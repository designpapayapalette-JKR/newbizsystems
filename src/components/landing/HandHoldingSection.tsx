import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export function HandHoldingSection() {
  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">We set it up with you — not just for you.</h2>
        <p className="text-blue-100 mb-7 max-w-xl mx-auto">
          Every NewBiz customer gets personal onboarding. We import your data, configure your workflow, train your team, and check in to make sure things are working.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/CRM/signup"
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
  );
}
