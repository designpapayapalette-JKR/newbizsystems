import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { crmFeatures } from "@/constants/landingData";

export function CrmFeaturesSection() {
  return (
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
            href="/CRM/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-md shadow-blue-100"
          >
            Start using NewBiz CRM free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-sm text-gray-400 mt-2">Free plan available · No credit card · Up in 15 min</p>
        </div>
      </div>
    </section>
  );
}
