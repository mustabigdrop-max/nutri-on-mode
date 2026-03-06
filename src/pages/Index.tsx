import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import AudienceSection from "@/components/landing/AudienceSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <AudienceSection />
      <PricingSection />
      <CTASection />
    </div>
  );
};

export default Index;
