import LandingNav from "@/components/landing/LandingNav";
import LandingScrollProgress from "@/components/landing/LandingScrollProgress";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingAudio from "@/components/landing/LandingAudio";
import LandingHero from "@/components/landing/LandingHero";
import LandingTicker from "@/components/landing/LandingTicker";
import LandingManifesto from "@/components/landing/LandingManifesto";
import LandingProtocols from "@/components/landing/LandingProtocols";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingStats from "@/components/landing/LandingStats";
import LandingCoach from "@/components/landing/LandingCoach";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingInteractiveQuiz from "@/components/landing/LandingInteractiveQuiz";
import LandingPlans from "@/components/landing/LandingPlans";
import LandingGuarantee from "@/components/landing/LandingGuarantee";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => (
  <div className="min-h-screen bg-[#03030a] text-[#f0edf8] font-landing overflow-x-hidden">
    <LandingScrollProgress />
    <LandingAudio />
    <LandingBackground />
    <div className="relative z-[2]">
      <LandingNav />
      <LandingHero />
      <LandingTicker />
      <LandingManifesto />
      <LandingProtocols />
      <LandingFeatures />
      <LandingStats />
      <LandingCoach />
      <LandingTestimonials />
      <LandingInteractiveQuiz />
      <LandingPlans />
      <LandingGuarantee />
      <LandingCTA />
      <LandingFooter />
    </div>
  </div>
);

export default Index;
