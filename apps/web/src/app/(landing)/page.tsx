import { CtaSection } from "@/components/landing/cta-section";
import { DocsSection } from "@/components/landing/docs-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { StatsSection } from "@/components/landing/stats-section";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <DocsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
