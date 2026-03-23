import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Microscope, Bot, BookOpen, Search, FileText, Leaf, Bug, Shield, Zap, Dumbbell } from "lucide-react";
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

const LabPage = () => {
  const [tab, setTab] = useState("apex");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();

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

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Microscope className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">NUTRION LAB <span className="text-primary">🔬</span></h1>
            <p className="text-[10px] text-muted-foreground font-mono">Ciência aplicada. Resposta em segundos.</p>
          </div>
        </div>
      </div>

      {showOnboarding ? (
        <div className="relative z-10 flex-1 min-h-0">
          <LabOnboarding onComplete={handleOnboardingComplete} onAskQuestion={(q) => { setInitialQuestion(q); handleOnboardingComplete(); }} />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="relative z-10 flex-1 flex flex-col min-h-0">
            <TabsList className="flex-shrink-0 mx-4 mt-3 bg-card border border-border h-10 overflow-x-auto">
              <TabsTrigger value="apex" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Bot className="w-3.5 h-3.5" /> APEX
              </TabsTrigger>
              <TabsTrigger value="protocols" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <BookOpen className="w-3.5 h-3.5" /> Protocolos
              </TabsTrigger>
              <TabsTrigger value="fito" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Leaf className="w-3.5 h-3.5" /> Fito
              </TabsTrigger>
              <TabsTrigger value="microbiota" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Bug className="w-3.5 h-3.5" /> Microbiota
              </TabsTrigger>
              <TabsTrigger value="coach" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Shield className="w-3.5 h-3.5" /> Coach
              </TabsTrigger>
              <TabsTrigger value="elite" className="flex-1 text-xs gap-1 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive">
                <Zap className="w-3.5 h-3.5" /> Elite
              </TabsTrigger>
              <TabsTrigger value="training" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Dumbbell className="w-3.5 h-3.5" /> Training
              </TabsTrigger>
              <TabsTrigger value="search" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Search className="w-3.5 h-3.5" /> Estudos
              </TabsTrigger>
              <TabsTrigger value="notebook" className="flex-1 text-xs gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <FileText className="w-3.5 h-3.5" /> Caderno
              </TabsTrigger>
            </TabsList>

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
