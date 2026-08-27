import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Camera,
  UtensilsCrossed,
  Dumbbell,
  ScanLine,
  FlaskConical,
  FileBarChart,
  ArrowLeft,
  Sparkles,
  Headphones,
} from "lucide-react";
import AthleteRoster from "@/components/coach/AthleteRoster";
import PlanoAlimentarIA from "@/components/coach/PlanoAlimentarIA";
import CoachApexVisualPage from "@/pages/coach/CoachApexVisualPage";
import CoachTrainingOnPage from "@/pages/coach/CoachTrainingOnPage";
import APEXPoseAnalysisPage from "@/pages/coach/APEXPoseAnalysisPage";
import CoachLabExamsPage from "@/pages/coach/CoachLabExamsPage";
import CoachReportsPage from "@/pages/coach/CoachReportsPage";
import CoachAudioAcademyPage from "@/pages/coach/CoachAudioAcademyPage";

type ModuleKey = "atletas" | "apex" | "vera" | "plano" | "training" | "pose" | "lab" | "relatorios" | "mce";

// ── Design tokens (mesmo padrão do TrainingON, paleta Coach Amber) ──
const BG = "#03030a";
const SURFACE2 = "#0f0d08";
const BORDER = "rgba(232,160,32,0.12)";
const BORDER_ACTIVE = "rgba(232,160,32,0.4)";
const AMBER = "#E8A020";
const AMBER_DIM = "rgba(232,160,32,0.1)";
const VERA_PURPLE = "#A78BFA";
const TEXT = "#fff8eb";
const TEXT_DIM = "#a8a29e";
const TEXT_MUTED = "#78716c";
const FONT = "'Space Grotesk', sans-serif";

const modules: { key: ModuleKey; label: string; icon: any; desc: string }[] = [
  { key: "atletas", label: "Atletas", icon: Trophy, desc: "Roster e timeline visual" },
  { key: "apex", label: "APEX Visual", icon: Camera, desc: "Análise de fotos pelo sistema" },
  { key: "vera", label: "VERA", icon: Sparkles, desc: "Avaliação feminina completa" },
  { key: "plano", label: "Plano Alimentar", icon: UtensilsCrossed, desc: "Macros e carb cycling" },
  { key: "training", label: "TrainingON", icon: Dumbbell, desc: "Sistema, fibra e volume" },
  { key: "pose", label: "Pose AI", icon: ScanLine, desc: "Análise postural MediaPipe" },
  { key: "lab", label: "Exames Lab", icon: FlaskConical, desc: "Score metabólico e alertas" },
  { key: "relatorios", label: "Relatórios", icon: FileBarChart, desc: "Relatório semanal" },
  { key: "mce", label: "MCE", icon: Headphones, desc: "Biblioteca de áudios MCE e progresso de escuta" },
];

const CoachHub = () => {
  const [active, setActive] = useState<ModuleKey>("atletas");
  const navigate = useNavigate();
  const current = modules.find((m) => m.key === active)!;

  const renderModule = () => {
    switch (active) {
      case "atletas":
        return <AthleteRoster />;
      case "apex":
        return <CoachApexVisualPage />;
      case "plano":
        return <PlanoAlimentarIA />;
      case "training":
        return <CoachTrainingOnPage />;
      case "pose":
        return <APEXPoseAnalysisPage />;
      case "lab":
        return <CoachLabExamsPage />;
      case "relatorios":
        return <CoachReportsPage />;
      case "mce":
        return <CoachAudioAcademyPage embedded />;
      case "vera":
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/coach/dashboard")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: TEXT_DIM }} />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: AMBER_DIM, border: `1px solid ${BORDER_ACTIVE}` }}
          >
            <current.icon className="w-5 h-5" style={{ color: AMBER }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg font-black tracking-tight truncate"
              style={{ color: TEXT, fontFamily: FONT }}
            >
              Coach<span style={{ color: AMBER }}>Hub</span>
            </h1>
            <p
              className="text-[10px] font-medium tracking-wider uppercase truncate"
              style={{ color: TEXT_MUTED }}
            >
              {current.desc}
            </p>
          </div>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: AMBER_DIM, border: `1px solid ${BORDER}` }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: AMBER }}
            />
            <span className="text-[9px] font-bold" style={{ color: AMBER }}>
              AI LIVE
            </span>
          </div>
        </div>

        {/* Section Nav */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {modules.map((m) => (
            <button
              key={m.key}
              onClick={() => m.key === "vera" ? navigate("/coach/vera") : setActive(m.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all"
              style={{
                background: m.key === "vera" ? "rgba(167,139,250,0.1)" : (active === m.key ? AMBER_DIM : "transparent"),
                color: m.key === "vera" ? VERA_PURPLE : (active === m.key ? AMBER : TEXT_MUTED),
                border: `1px solid ${m.key === "vera" ? "rgba(167,139,250,0.3)" : (active === m.key ? BORDER_ACTIVE : "transparent")}`,
              }}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoachHub;
