import { whyUs } from "@/constants/landingData";

export function WhyUsSection() {
  return (
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
  );
}
