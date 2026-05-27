import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Microscope, Bot, BookOpen, Search, FileText, Leaf, Bug, Shield, Zap, Dumbbell, Apple, HeartPulse, Dna, Activity, Target, GraduationCap, Brain, Users, FlaskConical, Video, Sparkles, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApexChat from "@/components/lab/ApexChat";
import ProtocolLibrary from "@/components/lab/ProtocolLibrary";
import StudySearch from "@/components/lab/StudySearch";
import LabNotebook from "@/components/lab/LabNotebook";
import LabApexElite from "@/components/lab/LabApexElite";
import LabOnboarding from "@/components/lab/LabOnboarding";
import FitoterapicosLibrary from "@/components/lab/FitoterapicosLibrary";
import MicrobiotaLibrary from "@/components/lab/MicrobiotaLibrary";
import LabCoachMode from "@/components/lab/LabCoachMode";
import LabTrainingMaster from "@/components/lab/LabTrainingMaster";
import LabNutritionMaster from "@/components/lab/LabNutritionMaster";
import LabHealthMaster from "@/components/lab/LabHealthMaster";
import LabCardioMaster from "@/components/lab/LabCardioMaster";
import ExerciseSelector from "@/components/workout/ExerciseSelector";
import LabProTraining from "@/components/lab/LabProTraining";
import LabMCEAgent from "@/components/lab/LabMCEAgent";
import LabCoachPlanner from "@/components/lab/LabCoachPlanner";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const GREEN = "#00C896";

// Primary tabs — always visible
const PRIMARY_TABS = [
  { value: "mce",       label: "MCE",       icon: Brain,      color: GOLD },
  { value: "apex",      label: "APEX",      icon: Bot,        color: CYAN },
  { value: "protocols", label: "Protocolos",icon: BookOpen,   color: GOLD },
  { value: "coach",     label: "Coach",     icon: Shield,     color: CYAN },
  { value: "elite",     label: "Elite",     icon: Zap,        color: "#ff6644" },
];

// Secondary tabs — shown in "+ MAIS" menu
const SECONDARY_TABS = [
  { value: "training",    label: "Training",     icon: Dumbbell,      color: GOLD },
  { value: "nutrition",   label: "Nutrição",     icon: Apple,         color: GREEN },
  { value: "health",      label: "Saúde",        icon: HeartPulse,    color: CYAN },
  { value: "cardio",      label: "Cardio",       icon: Activity,      color: GOLD },
  { value: "fito",        label: "Fito",         icon: Leaf,          color: GREEN },
  { value: "microbiota",  label: "Microbiota",   icon: Bug,           color: CYAN },
  { value: "exercises",   label: "Exercícios",   icon: Target,        color: GOLD },
  { value: "protraining", label: "Pro Training", icon: GraduationCap, color: CYAN },
  { value: "coachplanner",label: "Coach Plan",   icon: Users,         color: GOLD },
  { value: "search",      label: "Estudos",      icon: Search,        color: CYAN },
  { value: "notebook",    label: "Caderno",      icon: FileText,      color: GOLD },
];

// External navigation tabs
const EXTERNAL_TABS = [
  { path: "/peptide-vault", label: "Peptídeos", icon: Dna,          color: CYAN },
  { path: "/dr-nexus",      label: "Dr. VERTEX", icon: FlaskConical, color: "#ff6644" },
  { path: "/ergo-vault",    label: "Ergo",       icon: Sparkles,     color: GREEN },
  { path: "/videoform",     label: "VideoForm",  icon: Video,        color: GOLD },
];

const LabPage = () => {
  const [tab, setTab] = useState("mce");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem("lab_onboarding_done");
    if (!seen) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("lab_onboarding_done", "1");
    setShowOnboarding(false);
  };

  const handleAskApex = (q: string) => {
    setInitialQuestion(q);
    setTab("apex");
  };

  const activeSecondary = SECONDARY_TABS.find(t => t.value === tab);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Hex grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.025) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />
      <div className="hud-scan-line" />

      {/* Header */}
      <div
        className="relative z-10 flex-shrink-0 px-4 pt-3 pb-2"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 34, height: 34,
              background: "rgba(184,146,42,0.1)",
              border: "1px solid rgba(184,146,42,0.3)",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            <Microscope style={{ width: 14, height: 14, color: GOLD }} />
          </div>
          <div className="flex-1">
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.1em", color: "#F5F0E8" }}>
              NUTRION LAB
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}>
              Ciência Aplicada · Resposta em Segundos
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 5px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.15em", color: "rgba(0,212,255,0.45)", textTransform: "uppercase" }}>
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {showOnboarding ? (
        <div className="relative z-10 flex-1 min-h-0">
          <LabOnboarding
            onComplete={handleOnboardingComplete}
            onAskQuestion={(q) => { setInitialQuestion(q); handleOnboardingComplete(); }}
          />
        </div>
      ) : (
        <>
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setShowMore(false); }} className="relative z-10 flex-1 flex flex-col min-h-0">

            {/* Tab bar */}
            <div
              className="flex-shrink-0 px-3 pt-2 pb-0 relative"
              style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}
            >
              <TabsList
                className="flex gap-1 bg-transparent h-auto p-0 w-full"
                style={{ overflowX: "visible" }}
              >
                {/* Primary tabs */}
                {PRIMARY_TABS.map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="flex-1 flex flex-col items-center gap-0.5 px-1 pb-2 pt-1.5 relative border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    style={{
                      minWidth: 0,
                    }}
                  >
                    {({ isSelected }: any) => {
                      const sel = tab === t.value;
                      return (
                        <>
                          <t.icon style={{ width: 14, height: 14, color: sel ? t.color : "rgba(80,80,122,0.5)", transition: "color 0.2s" }} />
                          <span style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "0.38rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: sel ? t.color : "rgba(80,80,122,0.5)",
                            transition: "color 0.2s",
                          }}>
                            {t.label}
                          </span>
                          {sel && (
                            <span
                              className="absolute bottom-0 left-1 right-1 h-[2px]"
                              style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }}
                            />
                          )}
                        </>
                      );
                    }}
                  </TabsTrigger>
                ))}

                {/* Active secondary tab (if any) */}
                {activeSecondary && (
                  <TabsTrigger
                    value={activeSecondary.value}
                    className="flex-1 flex flex-col items-center gap-0.5 px-1 pb-2 pt-1.5 relative border-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <activeSecondary.icon style={{ width: 14, height: 14, color: activeSecondary.color }} />
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.38rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: activeSecondary.color,
                    }}>
                      {activeSecondary.label}
                    </span>
                    <span
                      className="absolute bottom-0 left-1 right-1 h-[2px]"
                      style={{ background: activeSecondary.color, boxShadow: `0 0 6px ${activeSecondary.color}` }}
                    />
                  </TabsTrigger>
                )}

                {/* "+ MAIS" button */}
                <button
                  onClick={() => setShowMore(v => !v)}
                  className="flex-none flex flex-col items-center gap-0.5 px-2 pb-2 pt-1.5 relative"
                  style={{
                    background: showMore ? "rgba(184,146,42,0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: showMore ? GOLD : "rgba(80,80,122,0.5)",
                    transition: "all 0.2s",
                  }}
                >
                  <ChevronDown style={{ width: 14, height: 14, transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.38rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    MAIS
                  </span>
                </button>
              </TabsList>

              {/* Expanded "MAIS" dropdown */}
              {showMore && (
                <div
                  className="absolute left-3 right-3 z-50 mt-0"
                  style={{
                    background: "rgba(10,10,26,0.98)",
                    border: "1px solid rgba(184,146,42,0.15)",
                    borderTop: "none",
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="p-3">
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
                      Módulos
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      {SECONDARY_TABS.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => { setTab(t.value); setShowMore(false); }}
                          className="flex flex-col items-center gap-1 py-2 transition-all"
                          style={{
                            background: tab === t.value ? `rgba(${t.color === GOLD ? "184,146,42" : t.color === CYAN ? "0,212,255" : "0,200,150"},0.1)` : "rgba(80,80,122,0.05)",
                            border: `1px solid ${tab === t.value ? t.color + "44" : "rgba(80,80,122,0.1)"}`,
                            color: tab === t.value ? t.color : "rgba(80,80,122,0.7)",
                            cursor: "pointer",
                          }}
                        >
                          <t.icon style={{ width: 13, height: 13 }} />
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.36rem", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
                      Especializado
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {EXTERNAL_TABS.map((t) => (
                        <button
                          key={t.path}
                          onClick={() => { navigate(t.path); setShowMore(false); }}
                          className="flex flex-col items-center gap-1 py-2 transition-all"
                          style={{
                            background: "rgba(80,80,122,0.05)",
                            border: `1px solid rgba(${t.color === GOLD ? "184,146,42" : t.color === CYAN ? "0,212,255" : t.color === "#ff6644" ? "255,100,68" : "0,200,150"},0.2)`,
                            color: t.color,
                            cursor: "pointer",
                          }}
                        >
                          <t.icon style={{ width: 13, height: 13 }} />
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.36rem", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab content */}
            <TabsContent value="mce" className="flex-1 min-h-0 mt-0">
              <LabMCEAgent onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="apex" className="flex-1 min-h-0 mt-0">
              <ApexChat initialQuestion={initialQuestion} />
            </TabsContent>
            <TabsContent value="protocols" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <ProtocolLibrary onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="fito" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <FitoterapicosLibrary onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="microbiota" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <MicrobiotaLibrary onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="coach" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabCoachMode onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="elite" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabApexElite onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="training" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabTrainingMaster onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="nutrition" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabNutritionMaster onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="health" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabHealthMaster onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="cardio" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabCardioMaster onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="exercises" className="flex-1 min-h-0 mt-0">
              <ExerciseSelector />
            </TabsContent>
            <TabsContent value="protraining" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabProTraining onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="coachplanner" className="flex-1 overflow-y-auto mt-0">
              <LabCoachPlanner onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="search" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <StudySearch onAskApex={handleAskApex} />
            </TabsContent>
            <TabsContent value="notebook" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
              <LabNotebook />
            </TabsContent>
          </Tabs>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default LabPage;
