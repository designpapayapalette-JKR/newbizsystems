import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
          Special Beta Access
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          100% Free During Beta Testing
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
          We are currently in active beta. All our tools — including NewBiz CRM, GST invoicing, pipeline management, and payments — are <strong className="text-blue-600 font-bold">completely free for everyone</strong> to use right now.
        </p>

        <Link
          href="/CRM/signup"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
        >
          Create Your Free Account
        </Link>
        <p className="text-sm text-gray-500 mt-6 max-w-xl mx-auto">
          No credit card required. Paid plans will be introduced after the beta phase concludes, but early adopters will be rewarded with special pricing.
        </p>
      </div>
    </section>
  );
}
