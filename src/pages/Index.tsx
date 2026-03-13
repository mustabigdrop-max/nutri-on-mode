import { useState, useCallback } from "react";
import LandingNav from "@/components/landing/LandingNav";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingHero from "@/components/landing/LandingHero";
import LandingTicker from "@/components/landing/LandingTicker";
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
import LandingIntro from "@/components/landing/LandingIntro";
import LandingAudio from "@/components/landing/LandingAudio";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroDone = useCallback(() => setIntroComplete(true), []);

  return (
    <div className="min-h-screen bg-[#03030a] text-[#f0edf8] font-landing overflow-x-hidden">
      {/* Cinematic boot intro */}
      {!introComplete && <LandingIntro onDone={handleIntroDone} />}

      {/* Floating ambient sound toggle */}
      <LandingAudio />

      <LandingBackground />
      <div className="relative z-[2]">
        <LandingNav />
        <LandingHero />
        <LandingTicker />
        <LandingVSComparison />
        <LandingManifesto />
        <LandingProtocols />
        <LandingDayTimeline />
        <LandingAppDemo />
        <LandingKcalEngine />
        <LandingFeatures />
        <LandingStats />
        {/* Social proof — real case data before pushing to plans */}
        <LandingTestimonials />
        <LandingCoach />
        <LandingPlans />
        {/* Risk reversal — remove last objection before CTA */}
        <LandingGuarantee />
        <LandingCTA />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
