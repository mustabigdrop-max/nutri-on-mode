import LandingNav from "@/components/landing/LandingNav";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingHero from "@/components/landing/LandingHero";
import LandingTicker from "@/components/landing/LandingTicker";
import LandingVideoVSL from "@/components/landing/LandingVideoVSL";
import LandingVSComparison from "@/components/landing/LandingVSComparison";
import LandingManifesto from "@/components/landing/LandingManifesto";
import LandingProtocols from "@/components/landing/LandingProtocols";
import LandingDayTimeline from "@/components/landing/LandingDayTimeline";
import LandingAppDemo from "@/components/landing/LandingAppDemo";
import LandingKcalEngine from "@/components/landing/LandingKcalEngine";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingStats from "@/components/landing/LandingStats";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingCoach from "@/components/landing/LandingCoach";
import LandingPlans from "@/components/landing/LandingPlans";
import LandingGuarantee from "@/components/landing/LandingGuarantee";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingAudio from "@/components/landing/LandingAudio";
import LandingInteractiveQuiz from "@/components/landing/LandingInteractiveQuiz";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#03030a] text-[#f0edf8] font-landing overflow-x-hidden">
      {/* Ambient sound toggle — opt-in, bottom-right */}
      <LandingAudio />

      <LandingBackground />
      <div className="relative z-[2]">
        <LandingNav />
        <LandingHero />
        <LandingTicker />

        {/* VSL — video demo positioned immediately after hook */}
        <LandingVideoVSL />

        {/* Protocol quiz — interactive engagement */}
        <LandingInteractiveQuiz />

        <LandingVSComparison />
        <LandingManifesto />
        <LandingProtocols />
        <LandingDayTimeline />
        <LandingAppDemo />

        {/* Interactive kcal calculator — personalised result before plans */}
        <LandingKcalEngine />

        <LandingFeatures />
        <LandingStats />
        {/* Social proof before pushing to plans */}
        <LandingTestimonials />
        <LandingCoach />
        <LandingPlans />
        {/* Risk reversal */}
        <LandingGuarantee />
        <LandingCTA />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
