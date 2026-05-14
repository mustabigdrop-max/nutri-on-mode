import LandingNav from "@/components/landing/LandingNav";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingAudio from "@/components/landing/LandingAudio";
import LandingHero from "@/components/landing/LandingHero";
import LandingVideoVSL from "@/components/landing/LandingVideoVSL";
import LandingTicker from "@/components/landing/LandingTicker";
import LandingActivityFeed from "@/components/landing/LandingActivityFeed";
import LandingSystemPreview from "@/components/landing/LandingSystemPreview";
import LandingTeamSection from "@/components/landing/LandingTeamSection";
import LandingInteractiveQuiz from "@/components/landing/LandingInteractiveQuiz";
import LandingTransformTimeline from "@/components/landing/LandingTransformTimeline";
import LandingVSComparison from "@/components/landing/LandingVSComparison";
import LandingPitch from "@/components/landing/LandingPitch";
import LandingManifesto from "@/components/landing/LandingManifesto";
import LandingProtocols from "@/components/landing/LandingProtocols";
import LandingDayTimeline from "@/components/landing/LandingDayTimeline";
import LandingAppDemo from "@/components/landing/LandingAppDemo";
import LandingKcalEngine from "@/components/landing/LandingKcalEngine";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingLiveSystem from "@/components/landing/LandingLiveSystem";
import LandingStats from "@/components/landing/LandingStats";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingCoach from "@/components/landing/LandingCoach";
import LandingPlans from "@/components/landing/LandingPlans";
import LandingGuarantee from "@/components/landing/LandingGuarantee";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => (
  <div className="min-h-screen bg-[#03030a] text-[#f0edf8] font-landing overflow-x-hidden">
    <LandingAudio />
    <LandingBackground />
    <div className="relative z-[2]">
      <LandingNav />
      <LandingHero />
      <LandingTicker />
      <LandingActivityFeed />
      <LandingTeamSection />
      <LandingVideoVSL />
      <LandingInteractiveQuiz />
      <LandingTransformTimeline />
      <LandingVSComparison />
      <LandingSystemPreview />
      <LandingPitch />
      <LandingManifesto />
      <LandingProtocols />
      <LandingDayTimeline />
      <LandingAppDemo />
      <LandingKcalEngine />
      <LandingFeatures />
      <LandingLiveSystem />
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

export default Index;
