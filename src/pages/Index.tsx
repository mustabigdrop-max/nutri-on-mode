import LandingNav from "@/components/landing/LandingNav";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingAudio from "@/components/landing/LandingAudio";
import LandingHero from "@/components/landing/LandingHero";
import LandingTicker from "@/components/landing/LandingTicker";
import LandingInteractiveQuiz from "@/components/landing/LandingInteractiveQuiz";
import LandingVSComparison from "@/components/landing/LandingVSComparison";
import LandingManifesto from "@/components/landing/LandingManifesto";
import LandingProtocols from "@/components/landing/LandingProtocols";
import LandingDayTimeline from "@/components/landing/LandingDayTimeline";
import LandingKcalEngine from "@/components/landing/LandingKcalEngine";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingStats from "@/components/landing/LandingStats";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingCoach from "@/components/landing/LandingCoach";
import LandingPlans from "@/components/landing/LandingPlans";
import LandingGuarantee from "@/components/landing/LandingGuarantee";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#03030a] text-[#f0edf8] font-landing overflow-x-hidden">
      <LandingBackground />
      <LandingAudio />
      <div className="relative z-[2]">
        <LandingNav />
        <LandingHero />
        <LandingTicker />
        <LandingInteractiveQuiz />
        <LandingVSComparison />
        <LandingManifesto />
        <LandingProtocols />
        <LandingDayTimeline />
        <LandingKcalEngine />
        <LandingFeatures />
        <LandingStats />
        <LandingTestimonials />
        <LandingCoach />
        <LandingPlans />
        <LandingGuarantee />
        <LandingCTA />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
