import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Layers, Sparkles, Target, Calculator, Dog, Activity, HeartPulse, Award } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SystemSelector from "@/components/training/systems/SystemSelector";
import IntensityTechniquesPicker from "@/components/training/systems/IntensityTechniquesPicker";
import SpecializationProtocol from "@/components/training/systems/SpecializationProtocol";
import Wendler531Calculator from "@/components/training/systems/Wendler531Calculator";
import DoggcrappMode from "@/components/training/systems/DoggcrappMode";
import VelocityTracking from "@/components/training/systems/VelocityTracking";
import RecoveryScore from "@/components/training/systems/RecoveryScore";
import CompetitionModeBlocks from "@/components/training/systems/CompetitionModeBlocks";

type Tab = "sistemas" | "tecnicas" | "especializacao" | "531" | "dc" | "vbt" | "recovery" | "competicao";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "sistemas", label: "Sistemas", icon: Layers },
  { id: "tecnicas", label: "Técnicas", icon: Sparkles },
  { id: "especializacao", label: "Especialização", icon: Target },
  { id: "531", label: "5/3/1", icon: Calculator },
  { id: "dc", label: "Doggcrapp", icon: Dog },
  { id: "vbt", label: "VBT", icon: Activity },
  { id: "recovery", label: "Recovery", icon: HeartPulse },
  { id: "competicao", label: "Competição", icon: Award },
];

export default function TrainingSystemsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("sistemas");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/training")} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-black text-foreground">Training Systems Library</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">24+ sistemas científicos · técnicas · especialização</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition ${
                tab === t.id ? "bg-primary/15 border border-primary/40 text-primary" : "bg-transparent text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {tab === "sistemas" && <SystemSelector />}
        {tab === "tecnicas" && <IntensityTechniquesPicker />}
        {tab === "especializacao" && <SpecializationProtocol />}
        {tab === "531" && <Wendler531Calculator />}
        {tab === "dc" && <DoggcrappMode />}
        {tab === "vbt" && <VelocityTracking />}
        {tab === "recovery" && <RecoveryScore pharmacological={false} />}
        {tab === "competicao" && <CompetitionModeBlocks />}
      </div>

      <BottomNav />
    </div>
  );
}
