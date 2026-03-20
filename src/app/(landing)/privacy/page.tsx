import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NewBiz CRM",
  description: "Learn how NewBiz CRM by Papaya Palette collects and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 border-b pb-4">Privacy Policy</h1>
          <p className="mt-4 text-sm text-gray-500 italic">Last Updated: March 20, 2026</p>
        </div>

        <section className="prose prose-blue max-w-none text-gray-700 space-y-6">
          <p>
            At NewBiz Systems ("we," "us," or "our"), a brand owned and operated by <strong>Papaya Palette</strong>, 
            we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you visit our website and use our CRM services.
          </p>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you register for an account, 
              create or modify your profile, or communicate with us. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and company details.</li>
              <li><strong>Business Data:</strong> Lead information, customer details, and communication logs you upload to the CRM.</li>
              <li><strong>Payment Data:</strong> Billing information and transaction history (processed securely via third-party payment gateways).</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
            <p>We use the collected information for various purposes, including to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information (invoices, receipts).</li>
              <li>Send technical notices, updates, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. This includes table-level 
              Row Level Security (RLS) in our database, encryption of data in transit (SSL/TLS), and secure 
              cloud infrastructure provided by Supabase and AWS.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">4. Third-Party Services</h2>
            <p>
              We may use third-party service providers to monitor and analyze the use of our service, 
              or to process payments. These third parties have access to your personal information 
              only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. Your Rights</h2>
            <p>
              Depending on your location, you may have rights regarding your personal data, 
              including the right to access, correct, or delete the information we hold about you.
            </p>
          </div>

          <div className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
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
