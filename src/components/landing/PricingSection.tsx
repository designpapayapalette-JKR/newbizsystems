import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { plans } from "@/constants/landingData";

export function PricingSection() {
  return (
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
  );
}
