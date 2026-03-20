import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";

export const metadata: Metadata = {
  title: "Best CRM for Indian SMEs | Lead Management Software",
  description: "NewBiz Systems offers affordable, practical digital tools and CRM software designed specifically for Indian small businesses. Track leads and close deals faster.",
};

import { ProductsSection } from "@/components/landing/ProductsSection";
import { CrmFeaturesSection } from "@/components/landing/CrmFeaturesSection";
import { CommunicationSection } from "@/components/landing/CommunicationSection";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { EarlyAccessSection } from "@/components/landing/EarlyAccessSection";
import { HandHoldingSection } from "@/components/landing/HandHoldingSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProductsSection />
      <CrmFeaturesSection />
      <CommunicationSection />
      <WhyUsSection />
      <PricingSection />
      <TestimonialsSection />
      <EarlyAccessSection />
      <HandHoldingSection />
    </>
  );
}
