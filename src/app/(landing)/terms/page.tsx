import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NewBiz CRM",
  description: "Terms and conditions for using the NewBiz CRM platform by Papaya Palette.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-gray-700">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 border-b pb-4">Terms of Service</h1>
          <p className="mt-4 text-sm text-gray-500 italic">Effective Date: March 20, 2026</p>
        </div>

        <section className="prose prose-blue max-w-none space-y-6">
          <p>
            Welcome to NewBiz CRM. These Terms of Service ("Terms") govern your access to and use of 
            the NewBiz CRM platform, website, and services provided by <strong>Papaya Palette</strong> ("we," "us," or "our"). 
            By using our services, you agree to be bound by these Terms.
          </p>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. Account Registration</h2>
            <p>
              To access certain features of the service, you must register for an account. You agree to 
              provide accurate, current, and complete information during the registration process. 
              You are responsible for safeguarding your password and for any activities or actions 
              under your account.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. Use of Service</h2>
            <p>
              You agree to use NewBiz CRM only for lawful purposes in accordance with these Terms. 
              You are prohibited from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Using the service for any illegal or unauthorized purpose.</li>
              <li>Attempting to interfere with the proper working of the service.</li>
              <li>Uploading any material that is harmful, offensive, or violates third-party rights.</li>
              <li>Using our CRM to send unauthorized marketing or spam.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are and will remain 
              the exclusive property of <strong>Papaya Palette</strong>. Our trademarks and brand 
              identity may not be used in connection with any product or service without our prior written consent.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">4. Payment and Billing</h2>
            <p>
              Certain services are offered for a fee. You agree to provide a valid payment method 
              and authorize us to charge the applicable fees via our third-party payment processors. 
              All fees are exclusive of applicable taxes unless stated otherwise.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. Limitation of Liability</h2>
            <p>
              In no event shall Papaya Palette, nor its directors, employees, or partners, be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including 
              without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your access to or use of or inability to access or use the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">6. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of <strong>India</strong>, 
              without regard to its conflict of law provisions. Any dispute arising from these Terms 
              shall be subject to the exclusive jurisdiction of the courts in <strong>Noida, Uttar Pradesh</strong>.
            </p>
          </div>

          <div className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900">7. Contact Information</h2>
            <p>For any questions regarding these Terms, please contact us at:</p>
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
