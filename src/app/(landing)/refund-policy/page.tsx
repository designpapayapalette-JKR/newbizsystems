import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | NewBiz CRM",
  description: "Our policy regarding cancellations and refunds for NewBiz CRM by Papaya Palette.",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-gray-700">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 border-b pb-4">Refund Policy</h1>
          <p className="mt-4 text-sm text-gray-500 italic">Last Updated: March 20, 2026</p>
        </div>

        <section className="prose prose-blue max-w-none space-y-6">
          <p>
            Thank you for choosing NewBiz CRM, a product by <strong>Papaya Palette</strong>. 
            We strive to provide the best possible experience for our users. Please read our refund policy carefully.
          </p>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. No Refund Policy</h2>
            <p className="text-lg font-medium text-gray-900">
              NewBiz CRM follows a strict <strong>No Refund Policy</strong>.
            </p>
            <p>
              Once a subscription is purchased or a payment is made for our services, 
              <strong> we do not provide any refund in any case</strong>. This includes, 
              but is not limited to, partial use of the service, cancellation of the account before 
              the end of a billing cycle, or dissatisfaction with the platform.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. Free Trial & Evaluation</h2>
            <p>
              To ensure that NewBiz CRM meet your business needs, we offer a free tier and demo 
              capabilities. We strongly encourage all users to evaluate the platform and its features 
              thoroughly before making a purchase.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. Cancellation</h2>
            <p>
              You may cancel your subscription at any time through your account settings. 
              Upon cancellation, your access will continue until the end of your current 
              paid billing period, and no further charges will be made. However, no refunds 
              will be issued for the remaining period of the current billing cycle.
            </p>
          </div>

          <div className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900">4. Contact Information</h2>
            <p>For any questions regarding our Refund Policy, please contact us at:</p>
            <div className="bg-gray-50 p-6 rounded-xl space-y-2 text-sm">
              <p className="font-bold">Papaya Palette</p>
              <p>H-213, Sector 63 Rd, Electronic City</p>
              <p>H Block, Sector 63, Noida, UP 201309</p>
              <p>Phone: +91 82879 73084</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
