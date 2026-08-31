import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, ChevronRight, ChevronLeft, Download, FileText, Save,
  BarChart3, History, Settings, Zap, TrendingUp, Search, ArrowLeft,
  Target, Shield, AlertTriangle, Clock, Flame, Eye, Brain,
  ChevronDown, ChevronUp, Activity, Award, Bookmark, Share2,
  Trash2, Edit3, Users, X, Check, FileDown, RotateCcw,
  Microscope, Scan, HeartPulse, BookOpen, TrendingDown, Layers, Sparkles, Flower2, Loader2,
} from "lucide-react";
import { buildVolumeReport, detectGvtMismatch } from "@/lib/trainingVolume";
import "@/styles/training-hud.css";
import { TrainingHUDBackground } from "@/components/training/TrainingHUDBackground";
import SendToAthleteBar from "@/components/coach/SendToAthleteBar";
import { exportTrainingPDF } from "@/lib/trainingPdfExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import BottomNav from "@/components/BottomNav";
import StratumMethodology from "@/components/training/StratumMethodology";
import StratumBadges from "@/components/training/StratumBadges";
import { runStratum, buildStratumInstruction } from "@/lib/stratumEngine";
import StratumGenerationProgress from "@/components/training/StratumGenerationProgress";
import DayLoadingCard from "@/components/training/DayLoadingCard";
import TrainingOnFibrasChat from "@/components/training/TrainingOnFibrasChat";
import TrainingReadinessSection from "@/components/training/TrainingReadinessSection";
import WeekNavigator from "@/components/training/WeekNavigator";
import ExerciseLogPanel from "@/components/training/ExerciseLogPanel";
import { applyWeekProgression, WEEK_PLAN, WeekPhase } from "@/lib/weekProgression";
import {
  PHASES, MUSCLES, LEVELS, WEEKS_OPTIONS, DAYS_OPTIONS,
  SESSION_DURATIONS, CARDIO_OPTIONS, STRESS_OPTIONS, EQUIPMENT_OPTIONS,
  VOLUME_LANDMARKS,
} from "@/data/trainingData";
import SystemSelectorInline from "@/components/training/systems/SystemSelectorInline";
import SystemConflictAlerts from "@/components/training/systems/SystemConflictAlerts";
import ProtocolDurationCheck from "@/components/training/systems/ProtocolDurationCheck";
import { estimateProtocolDuration } from "@/data/protocolDuration";
import { ResistanceProfileBadge, SessionProfilePanel } from "@/components/training/ResistanceProfileBadge";
import { RIRBadge, MesocycleRIRPlanner } from "@/components/training/RIRControls";
import { calcWeekRIR, resolveRIRForExercise, buildRIRInstruction } from "@/utils/rirSystem";
import { RepZoneBadge, SessionZonePanel, TripleCoherenceMarker } from "@/components/training/RepZoneBadge";
import { buildZoneInstruction, getWeekZones, WAVE_PATTERNS, DEFAULT_PATTERN_KEY } from "@/utils/repZones";
import { MuscleRegionBadge, RegionalCoveragePanel } from "@/components/training/RegionalCoverage";
import { buildRegionalInstruction, findExerciseRegion } from "@/utils/muscleRegions";
import { PlateauDashboard } from "@/components/training/PlateauDashboard";
import { buildPlateauInstruction } from "@/utils/plateauDetector";
import {
  SMHPanel,
  SupercompPanel,
  RBEPanel,
  ExerciseRBEBadge,
  buildDarksideFinalInstruction,
} from "@/components/training/DarksideFinalPanels";
import { buildSystemPrescription } from "@/data/recommendSystem";
import { TRAINING_SYSTEMS } from "@/data/trainingSystems";
import CompetitionModeBlocks from "@/components/training/systems/CompetitionModeBlocks";
import StratumAIAgent from "@/components/training/StratumAIAgent";
import SmartWarmup from "@/components/training/SmartWarmup";
import { MarkdownProtocolView } from "@/components/training/MarkdownProtocolView";
import { parseProtocolText } from "@/lib/parseProtocolText";
import {
  TrackerProvider,
  WorkoutProgressBar,
  RestTimerOverlay,
  WorkoutCompleteCard,
  SetTrackerBlock,
} from "@/components/training/tracker/WorkoutTracker";
import VERAAgent from "@/components/training/VERAAgent";
import MceBanner from "@/components/mce/MceBanner";

const ADMIN_UID = "70e51469-1acf-4df6-afe6-f094d21db122";

type Section = "gerar" | "readiness" | "fibras" | "sistemas" | "metodologia" | "competicao" | "stratumai" | "vera" | "progressao" | "volume" | "historico" | "config";

const sectionNav: { id: Section; label: string; icon: any; adminOnly?: boolean }[] = [
  { id: "gerar", label: "Prescrição", icon: Brain },
  { id: "readiness", label: "Readiness", icon: HeartPulse },
  { id: "fibras", label: "Fibras", icon: Activity },
  { id: "sistemas", label: "Sistemas", icon: Layers, adminOnly: true },
  { id: "metodologia", label: "Metodologia", icon: Microscope },
  { id: "competicao", label: "Competição", icon: Award, adminOnly: true },
  { id: "progressao", label: "Progressão", icon: TrendingUp },
  { id: "volume", label: "Volume", icon: BarChart3 },
  { id: "historico", label: "Histórico", icon: History },
  { id: "stratumai", label: "STRATUM", icon: Sparkles },
  { id: "vera", label: "VERA", icon: Flower2 },
  { id: "config", label: "Config", icon: Settings },
];

// ── Design tokens ──
const BG = "#060a06";
const SURFACE = "#0c120c";
const SURFACE2 = "#111a11";
const BORDER = "rgba(74,222,128,0.1)";
const BORDER_ACTIVE = "rgba(74,222,128,0.35)";
const GREEN = "#4ade80";
const GREEN_DIM = "rgba(74,222,128,0.08)";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const TEXT_MUTED = "#64748b";
const FONT = "'Space Grotesk', sans-serif";

export default function TrainingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [section, setSection] = useState<Section>("gerar");
  const isAdmin = user?.id === ADMIN_UID;
  const visibleNav = sectionNav.filter((s) => !s.adminOnly || isAdmin);

  // APEX → VERA → TrainingON: protocolo recebido
  const veraProtocoloFlag = searchParams.get("vera_protocolo") === "true";
  const veraAtletaId = searchParams.get("atleta");
  const [veraProtocolo, setVeraProtocolo] = useState<{ texto: string; timeline: number } | null>(null);
  useEffect(() => {
    if (!veraProtocoloFlag || !veraAtletaId) return;
    (async () => {
      const { data } = await supabase
        .from("apex_vera_bridge" as any)
        .select("resultado")
        .eq("atleta_id", veraAtletaId)
        .eq("status", "ENVIADO_TRAININGON")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const r = (data as any)?.resultado;
      if (r?.protocolo_texto) {
        setVeraProtocolo({ texto: r.protocolo_texto, timeline: r.timeline ?? 12 });
        toast.success("Protocolo VERA + APEX recebido");
      }
    })();
  }, [veraProtocoloFlag, veraAtletaId]);

  return (
    <TrackerProvider userId={user?.id}>
    <div className="ton-root min-h-screen">
      <TrainingHUDBackground />
      <WorkoutProgressBar />
      <WorkoutCompleteCard />
      <RestTimerOverlay />
      <MceBanner
        dimension="e"
        storageKey="mce_banner_trainingon_dismissed"
        text="Protocolo de Foco Progressivo recomendado — dimensão Execução crítica"
      />





      {/* ── HUD Header ── */}
      <div className="ton-header">
        <button onClick={() => navigate("/coach/dashboard")} className="ton-back" aria-label="Voltar">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="ton-logo">T↑N</div>
        <div className="flex-1 min-w-0">
          <div className="ton-header-sub">// MOTOR DE PRESCRIÇÃO DE ELITE v2.4</div>
          <div className="ton-header-title">TRAINING<span>ON</span></div>
        </div>
      </div>

      {/* ── HUD Tabs ── */}
      <div className="ton-nav">
        {visibleNav.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === "sistemas") { navigate("/training/systems"); return; }
              setSection(s.id);
            }}
            className={`ton-tab ${section === s.id ? "active" : ""}`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
            {s.adminOnly && <span className="ton-tab-badge">ADM</span>}
          </button>
        ))}
      </div>

      {/* APEX → VERA → TrainingON banner */}
      {veraProtocolo && (
        <div style={{ margin: "12px 16px", padding: 14, background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.35)", borderLeft: "3px solid #A78BFA", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 10, color: "#A78BFA", letterSpacing: "0.1em", margin: 0, fontWeight: 700 }}>PROTOCOLO VERA + APEX RECEBIDO</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>Timeline esperada: {veraProtocolo.timeline} semanas</p>
            </div>
            <button onClick={() => setVeraProtocolo(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>×</button>
          </div>
          <pre style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto", background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 6 }}>{veraProtocolo.texto}</pre>
        </div>
      )}

      {/* ── Content ── */}
      <div className="ton-content">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {section === "gerar" && <EliteGenerateSection userId={user?.id} />}
            {section === "readiness" && <TrainingReadinessSection />}
            {section === "fibras" && <TrainingOnFibrasChat />}
            {section === "metodologia" && <StratumMethodology />}
            {section === "progressao" && <ProgressionSection userId={user?.id} />}
            {section === "volume" && <VolumeLandmarksSection userId={user?.id} />}
            {section === "historico" && <HistorySection userId={user?.id} />}
            {section === "config" && <CoachConfigSection userId={user?.id} />}
            {section === "stratumai" && <StratumAIAgent userId={user?.id} />}
            {section === "vera" && <VERAAgent userId={user?.id} />}
            {section === "competicao" && isAdmin && (
              <div className="space-y-4">
                <CompetitionModeBlocks />
                <button
                  onClick={() => navigate("/coach/dashboard")}
                  className="w-full p-3 rounded-xl text-xs font-bold transition"
                  style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER_ACTIVE}` }}
                >
                  → Abrir Coach Dashboard (gestão completa de competição)
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Status Bar ── */}
      <div className="ton-status-bar">
        <div className="ton-status-item"><span className="ton-status-dot" /> SISTEMA ATIVO</div>
        <div className="ton-status-item">MPS OTIMIZADO</div>
        <div className="ton-status-item">mTOR: ON</div>
        <div className="ton-ticker">
          <div className="ton-ticker-inner">
            STRATUM LAYER 7 ACTIVE — FIBER IIA HYPERTROPHY WINDOW: 6-12 REPS — VOLUME PROGRESSIVO — FST-7 INTEGRATION READY — PEAK PROTOCOL STANDBY — NEXUS-BIO SYNC — NUTRION AI ENGINE v3.1
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
    </TrackerProvider>
  );
}


/* ================================================================
   ELITE GENERATE SECTION — Premium Protocol Generator
   ================================================================ */
function EliteGenerateSection({ userId }: { userId?: string }) {
  const [step, setStep] = useState(1);
  // Anamnese
  const [injuries, setInjuries] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState("60min");
  const [specificGoal, setSpecificGoal] = useState("");
  const [weakPoints, setWeakPoints] = useState("");
  const [cardio, setCardio] = useState("Não");
  const [stressLevel, setStressLevel] = useState("Bom");
  const [supplements, setSupplements] = useState("");
  const [correctivePrompt, setCorrectivePrompt] = useState("");
  // Protocol
  const [phase, setPhase] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [weeks, setWeeks] = useState("8");
  const [days, setDays] = useState("5");
  const [clientName, setClientName] = useState("");
  const [trainingSystem, setTrainingSystem] = useState<string>("");
  const [clientSex, setClientSex] = useState<"F" | "M" | null>(null);
  const [showMethod, setShowMethod] = useState(false);
  // Results
  const [protocol, setProtocol] = useState<any>(null);
  const [textResults, setTextResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [dayStatus, setDayStatus] = useState<Record<number, "loading" | "done" | "error">>({});

  const [loadingTab, setLoadingTab] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<string>("overview");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [weekPhase, setWeekPhase] = useState<WeekPhase>(WEEK_PLAN[0]);
  const [savedProtocolId, setSavedProtocolId] = useState<string | null>(null);

  // Detecta se o protocolo é o "Mello — Bulking 16 semanas" (16 semanas + bulking)
  const isMello16 = String(weeks) === "16" && (phase || "").toLowerCase().includes("bulk");

  // Sync sources: STRATUM Ready + Fibras
  const [readyCheckin, setReadyCheckin] = useState<{
    sono: number;
    energia: number;
    dorMuscular: string;
    estresseHoje: string;
  } | null>(null);
  const [fiberProfile, setFiberProfile] = useState<{
    dominancia: string;
    notas: string;
  } | null>(null);

  const toggleEquipment = (e: string) => setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  const toggleMuscle = (m: string) => setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  // Auto-preenche músculos a partir do texto do prompt (objetivo + pontos fracos + corretivo)
  const [musclesAutoFilled, setMusclesAutoFilled] = useState(false);
  useEffect(() => {
    if (musclesAutoFilled) return;
    const haystack = `${specificGoal} ${weakPoints} ${correctivePrompt}`.toLowerCase();
    if (!haystack.trim()) return;
    const aliases: Record<string, string[]> = {
      "Peitoral": ["peito", "peitor", "chest", "pec"],
      "Costas (Lat)": ["costas", "dorsal", "lat", "back", "puxada"],
      "Deltoides": ["ombro", "delt", "shoulder"],
      "Bíceps": ["biceps", "bíceps", "biceip"],
      "Tríceps": ["triceps", "tríceps"],
      "Quadríceps": ["quadr", "quad", "coxa anterior"],
      "Posterior de Coxa": ["posterior", "isquio", "ísquio", "hamstring", "femoral"],
      "Glúteos": ["glut", "glúte", "bumbum"],
      "Panturrilha": ["panturr", "calf", "gemeo", "gêmeo"],
      "Core/Abdômen": ["core", "abdom", "abs", "lombar"],
      "Trapézio": ["trapez", "trapéz", "traps"],
      "Antebraço": ["antebra", "forearm", "grip"],
    };
    const detected = Object.entries(aliases)
      .filter(([_, keys]) => keys.some(k => haystack.includes(k)))
      .map(([m]) => m);
    if (detected.length) {
      setMuscles(detected);
      setMusclesAutoFilled(true);
    }
  }, [specificGoal, weakPoints, correctivePrompt, musclesAutoFilled]);

  const bodyData = useMemo(() => ({
    phase, muscles, level, weeks, days, clientName,
    equipment: equipment.join(", "), injuries, sessionDuration,
    stressLevel, supplements, weakPoints, specificGoal, cardio,
    trainingSystem,
    trainingSystemName: TRAINING_SYSTEMS.find(s => s.id === trainingSystem)?.nome || "",
    systemPrescription: trainingSystem ? buildSystemPrescription(trainingSystem, phase) : "",
  }), [phase, muscles, level, weeks, days, clientName, equipment, injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio, trainingSystem]);

  // ── STRATUM: motor invisível — roda automaticamente a partir do contexto da prescrição ──
  const stratum = useMemo(() => runStratum({
    phase, level, days, weeks, muscles,
    weakPoints, specificGoal,
    correctiveText: correctivePrompt,
    sex: clientSex,
    systemName: TRAINING_SYSTEMS.find(s => s.id === trainingSystem)?.nome,
  }), [phase, level, days, weeks, muscles, weakPoints, specificGoal, correctivePrompt, clientSex, trainingSystem]);

  // Carrega perfil de fibras + último STRATUM Ready check-in
  useEffect(() => {
    if (!userId) return;

    (supabase
      .from("fiber_profiles" as any)
      .select("dominancia, notas")
      .eq("user_id", userId)
      .maybeSingle() as any)
      .then(({ data }: any) => {
        if (data) setFiberProfile({ dominancia: data.dominancia, notas: data.notas });
      });

    (supabase
      .from("stratum_checkins" as any)
      .select("sono, energia, dor_muscular, estresse_hoje")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as any)
      .then(({ data }: any) => {
        if (data) setReadyCheckin({
          sono: data.sono,
          energia: data.energia,
          dorMuscular: data.dor_muscular,
          estresseHoje: data.estresse_hoje,
        });
      });
  }, [userId]);

  const buildElitePrompt = () => {
    let readyScore = 7;
    if (readyCheckin) {
      const dorPenalty: Record<string, number> = { Nenhuma: 0, Leve: 0.5, Moderada: 1.5, Forte: 3 };
      const stressPenalty: Record<string, number> = { Baixo: 0, Médio: 0.5, Alto: 1.5 };
      const base = (readyCheckin.sono + readyCheckin.energia) / 2;
      const penalty = (dorPenalty[readyCheckin.dorMuscular] || 0) + (stressPenalty[readyCheckin.estresseHoje] || 0);
      readyScore = Math.max(1, Math.round((base - penalty) * 10) / 10);
    }

    const prontidaoBloco = readyCheckin
      ? `
━━━ PRONTIDÃO DO DIA (STRATUM Ready) ━━━
- Sono: ${readyCheckin.sono}/10
- Energia: ${readyCheckin.energia}/10
- Dor muscular: ${readyCheckin.dorMuscular}
- Estresse: ${readyCheckin.estresseHoje}
- Score: ${readyScore}/10
${readyScore >= 8 ? "✅ Score ALTO — protocolo completo, RPE máximo permitido" : readyScore >= 6 ? "⚡ Score MÉDIO — reduzir 1-2 sets, manter intensidade" : "⚠️ Score BAIXO — -20% volume, RPE máx 7, foco em técnica"}`
      : `━━━ PRONTIDÃO DO DIA: não registrada (assumir score 7/10) ━━━`;

    const fibrasBloco = fiberProfile
      ? `
━━━ PERFIL DE FIBRAS (Fibras) ━━━
- Dominância: ${fiberProfile.dominancia.toUpperCase()}
- Notas: ${fiberProfile.notas}
${fiberProfile.dominancia === "tipo_i" ? "→ Mais sets, reps altas (15-25), descanso 60-90s" : fiberProfile.dominancia === "tipo_iia" ? "→ 6-12 reps, tensão mecânica máxima, descanso 2-3min" : fiberProfile.dominancia === "tipo_iix" ? "→ 3-6 reps pesadas + finisher metabólico, descanso 3-5min" : "→ Periodização por bloco na sessão (pesado → metabólico)"}`
      : `━━━ PERFIL DE FIBRAS: não avaliado (usar padrão para o nível) ━━━`;

    const sistemaBloco = trainingSystem
      ? buildSystemPrescription(trainingSystem, phase)
      : `━━━ SISTEMA DE TREINAMENTO: não definido (usar padrão da fase) ━━━`;

    return `Você é o Motor de Prescrição de Elite do TrainingON — camada máxima do sistema STRATUM.

Integre QUATRO fontes de inteligência em UM protocolo definitivo:

━━━ DADOS DO CLIENTE ━━━
- Lesões: ${injuries || "nenhuma"}
- Equipamentos: ${equipment.join(", ") || "academia completa"}
- Tempo por sessão: ${sessionDuration}
- Cardio: ${cardio}
- Objetivo: ${specificGoal || "não informado"}
- Pontos fracos: ${weakPoints || "não informado"}
- Estresse/recuperação: ${stressLevel}
- Suplementos: ${supplements || "não informado"}
- Fase: ${phase} | Músculos: ${muscles.join(", ")}
- Nível: ${level} | ${weeks} semanas | ${days} dias/sem
- Cliente: ${clientName}
${prontidaoBloco}
${fibrasBloco}
${sistemaBloco}

━━━ PROGRESSÃO DE RIR (Reps In Reserve) — OBRIGATÓRIO ━━━
${buildRIRInstruction(1, Math.max(parseInt(String(weeks)) || 8, 1))}
━━━ FIM PROGRESSÃO RIR ━━━

━━━ ZONAS DE REPETIÇÃO + ONDULAÇÃO — OBRIGATÓRIO ━━━
${buildZoneInstruction(1, Math.max(parseInt(String(weeks)) || 8, 1), DEFAULT_PATTERN_KEY)}
━━━ FIM ZONAS DE REPETIÇÃO ━━━

━━━ HIPERTROFIA REGIONAL — OBRIGATÓRIO ━━━
${buildRegionalInstruction(["ombro","costas","peito","biceps","triceps","quadriceps","posterior","gluteo","panturrilha"], "")}
━━━ FIM HIPERTROFIA REGIONAL ━━━

━━━ DETECÇÃO DE PLATÔ (De-Output) — DIRETRIZES ━━━
Caso o atleta esteja em platô (carga estagnada 2+ semanas, queda de performance, RIR executado acima do prescrito):
- Reduzir volume 30-50% e carga 20-30% por 1 semana (De-Output / Deload Ativo)
- Variar perfil de resistência e zona de reps dos exercícios estagnados
- Aumentar RIR (mais conservador) durante a semana de descarga
- Após a semana de De-Output, reiniciar mesociclo com +1 série no exercício principal
━━━ FIM DETECÇÃO DE PLATÔ ━━━

${buildStratumInstruction(stratum)}

${buildDarksideFinalInstruction()}
${correctivePrompt ? `\n━━━ PROTOCOLO CORRETIVO APEX (colado pelo coach) ━━━\nUse as recomendações abaixo como BASE para os exercícios corretivos, ativações, finalizadores e ajustes de volume por grupo. Integre ao protocolo principal sem duplicar exercícios. Corretivos APEX NUNCA recebem RIR 0 — mínimo RIR 1.\n\n${correctivePrompt}\n━━━ FIM PROTOCOLO CORRETIVO ━━━` : ""}

━━━ OUTPUT OBRIGATÓRIO ━━━
1. AQUECIMENTO específico (considera lesões e grupo muscular)
2. 4-6 EXERCÍCIOS por sessão com: nome exato, sets×reps (SEGUINDO os parâmetros do SISTEMA acima), RPE/RIR, cadência, cue técnico, referência científica
3. VOLUME LANDMARKS — MEV / MAV / MRV para este contexto
4. PROGRESSÃO SEMANAL — adaptada à duração ideal do sistema escolhido (com deload)
5. BLOCO DE CARDIO — frequência, duração e tipo CONFORME a recomendação do sistema
6. BLOCO DE NUTRIÇÃO — superávit/déficit, proteína g/kg, timing CONFORME o sistema + fase
7. NOTA DE INTEGRAÇÃO — 4 linhas explicando como o sistema, fibras, prontidão e fase se combinam
8. ALERTA DE LESÃO se houver restrição

REGRA ABSOLUTA #1 — FREQUÊNCIA: o array training_days DEVE conter EXATAMENTE ${days} sessões (rótulos D1 até D${days}). NUNCA gere menos, NUNCA gere mais. Se o sistema base sugerir frequência diferente, ADAPTE a divisão (push/pull/legs, upper/lower, bro split, full body) para encaixar exatamente em ${days} dias/sem — distribuindo grupos musculares de forma coerente. Repetir sessões idênticas é proibido; cada dia deve ter foco distinto ou rotação clara (ex.: PPL×2 para 6 dias).

REGRA ABSOLUTA #2 — SISTEMA: Os parâmetros do SISTEMA DE TREINAMENTO BASE são INVIOLÁVEIS. Sets, reps, RIR, descanso, cadência e técnicas devem refletir EXATAMENTE o que está prescrito no bloco de sistema. Você adapta apenas o exercício ao equipamento, lesão e à frequência exigida acima.

Português. Específico. Científico. Zero genérico.`;
  };

  // Chamada com timeout individual de 90s (geração fracionada; cobre o retry interno da edge function)
  const invokeWithTimeout = async (body: any, label: string, ms = 90000) => {
    const invokePromise = supabase.functions.invoke("generate-training-protocol", { body });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Tempo excedido (${Math.round(ms / 1000)}s) em ${label}. Tente novamente.`)), ms)
    );
    const { data, error } = (await Promise.race([invokePromise, timeoutPromise])) as any;
    if (error) throw new Error(error.message || `Falha em ${label}`);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const buildAthleteSummary = () =>
    [
      `Cliente: ${clientName}`,
      phase && `Fase: ${phase}`,
      level && `Nível: ${level}`,
      `Frequência: ${days}x/sem`,
      `Duração/sessão: ${sessionDuration}`,
      muscles.length ? `Prioridades: ${muscles.join(", ")}` : "",
      equipment.length ? `Equipamentos: ${equipment.join(", ")}` : "",
      injuries ? `Lesões: ${injuries}` : "",
      trainingSystem ? `Sistema: ${TRAINING_SYSTEMS.find(s => s.id === trainingSystem)?.nome || trainingSystem}` : "",
      fiberProfile ? `Fibras: ${fiberProfile.dominancia}` : "",
      readyCheckin ? `Prontidão: sono ${readyCheckin.sono}/10, energia ${readyCheckin.energia}/10` : "",
    ].filter(Boolean).join(" · ");

  const generate = async () => {
    if (!clientName) {
      toast.error("Informe o nome do cliente para gerar o protocolo");
      return;
    }
    // Fase, músculos e nível são opcionais — o sistema infere pelo prompt elite
    // Bloqueio por tempo: protocolo não cabe na sessão (margem severa de 15min)
    const est = estimateProtocolDuration({ systemId: trainingSystem, muscles, level, sessionDuration, cardio });
    if (est.diff <= -15) {
      toast.error(`Protocolo estoura ${Math.abs(est.diff)}min do tempo de sessão. Ajuste antes de gerar.`);
      return;
    }
    setLoading(true);
    setGenerationError(null);
    setGenerated(true);
    setProtocol(null);
    setDayStatus({});
    setActiveResultTab("overview");
    try {
      // ── FASE 1 — ESQUELETO ──
      console.log("[SKELETON] request", { clientName, days });
      const skelData = await invokeWithTimeout(
        { ...bodyData, mode: "skeleton", tab: "protocolo", elitePrompt: buildElitePrompt() },
        "esqueleto"
      );
      const skeleton = skelData?.skeleton;
      if (!skeleton?.block_overview || !Array.isArray(skeleton.day_plan) || !skeleton.day_plan.length) {
        throw new Error("Não foi possível gerar o esqueleto do protocolo. Tente novamente.");
      }
      console.log("[SKELETON] ok", { days: skeleton.day_plan.length });

      // Renderiza imediatamente com placeholders por dia
      const placeholderDays = skeleton.day_plan.map((d: any) => ({
        day_number: d.day_number,
        session_title: d.session_title,
        focus_muscles: d.focus_muscles,
        estimated_duration: d.estimated_duration,
        warmup: [],
        exercises: [],
        session_notes: d.priority_note || "",
        _loading: true,
      }));
      setProtocol({
        block_overview: skeleton.block_overview,
        improvement_alerts: skeleton.improvement_alerts || [],
        training_days: placeholderDays,
      });
      setDayStatus(Object.fromEntries(skeleton.day_plan.map((d: any) => [d.day_number, "loading"])));
      setLoading(false);

      // ── FASE 2 — DIAS EM PARALELO ──
      const athleteSummary = buildAthleteSummary();
      const blockContext = {
        title: skeleton.block_overview.title,
        split_type: skeleton.block_overview.split_type,
        progression_model: skeleton.block_overview.progression_model,
      };

      const results = await Promise.allSettled(
        skeleton.day_plan.map(async (spec: any) => {
          console.log(`[DAY-${spec.day_number}] request`, spec.focus_muscles);
          const res = await invokeWithTimeout(
            { mode: "day", daySpec: spec, athleteSummary, blockContext },
            `dia ${spec.day_number}`
          );
          const day = res?.day;
          if (!day || !Array.isArray(day.exercises) || !day.exercises.length) {
            throw new Error(`Dia ${spec.day_number} inválido`);
          }
          console.log(`[DAY-${spec.day_number}] ok`, { exercises: day.exercises.length });
          setProtocol((prev: any) => {
            if (!prev) return prev;
            const training_days = prev.training_days.map((d: any) =>
              d.day_number === spec.day_number ? { ...day, day_number: spec.day_number } : d
            );
            return { ...prev, training_days };
          });
          setDayStatus(prev => ({ ...prev, [spec.day_number]: "done" }));
          return spec.day_number;
        })
      );

      const failed = results
        .map((r, i) => (r.status === "rejected" ? skeleton.day_plan[i].day_number : null))
        .filter((n): n is number => n != null);
      if (failed.length) {
        console.warn("[DAY] falhas:", failed);
        setDayStatus(prev => {
          const next = { ...prev };
          failed.forEach(n => { next[n] = "error"; });
          return next;
        });
        toast.error(`Falha ao gerar ${failed.length} dia(s): D${failed.join(", D")}. Use "Regerar dia".`);
      }

      const sysName = TRAINING_SYSTEMS.find(s => s.id === trainingSystem)?.nome;
      if (failed.length < skeleton.day_plan.length) {
        toast.success(
          `✅ Protocolo gerado${sysName ? ` · ${sysName}` : ""}${fiberProfile ? ` · Fibras ${fiberProfile.dominancia.toUpperCase()}` : ""}${readyCheckin ? ` · Ready ⚡` : ""}`,
          { duration: 4000 }
        );
      }
    } catch (e: any) {
      const msg = e?.message || "Erro desconhecido";
      setGenerationError(msg);
      // não chama setGenerated(false) — mantém na view do erro pra mostrar o card
    } finally {
      setLoading(false);
    }
  };

  // Regenera um único dia (usado nos cards com falha)
  const regenerateDay = async (dayNumber: number) => {
    const proto: any = protocol;
    const spec = proto?.training_days?.find((d: any) => d.day_number === dayNumber);
    if (!spec) return;
    setDayStatus(prev => ({ ...prev, [dayNumber]: "loading" }));
    try {
      console.log(`[DAY-${dayNumber}] retry`);
      const res = await invokeWithTimeout(
        {
          mode: "day",
          daySpec: {
            day_number: dayNumber,
            session_title: spec.session_title,
            focus_muscles: spec.focus_muscles,
            estimated_duration: spec.estimated_duration,
          },
          athleteSummary: buildAthleteSummary(),
          blockContext: {
            title: proto?.block_overview?.title,
            split_type: proto?.block_overview?.split_type,
            progression_model: proto?.block_overview?.progression_model,
          },
        },
        `dia ${dayNumber}`
      );
      const day = res?.day;
      if (!day?.exercises?.length) throw new Error("Dia inválido");
      setProtocol((prev: any) => ({
        ...prev,
        training_days: prev.training_days.map((d: any) =>
          d.day_number === dayNumber ? { ...day, day_number: dayNumber } : d
        ),
      }));
      setDayStatus(prev => ({ ...prev, [dayNumber]: "done" }));
    } catch (e: any) {
      setDayStatus(prev => ({ ...prev, [dayNumber]: "error" }));
      toast.error(e?.message || `Falha ao regerar dia ${dayNumber}`);
    }
  };


  const loadTab = async (tab: string) => {
    if (textResults[tab] || loadingTab[tab]) return;
    setLoadingTab(prev => ({ ...prev, [tab]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-protocol", { body: { ...bodyData, tab } });
      if (error) throw error;
      setTextResults(prev => ({ ...prev, [tab]: data.content }));
    } catch (e: any) {
      toast.error(`Erro ao gerar ${tab}`);
    } finally {
      setLoadingTab(prev => ({ ...prev, [tab]: false }));
    }
  };

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  useEffect(() => {
    if (!userId) return;
    supabase.from("coach_patients").select("id, patient_user_id, status, notes").eq("status", "active")
      .then(async ({ data }) => {
        if (!data?.length) return;
        const ids = data.map(p => p.patient_user_id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, sex").in("user_id", ids);
        setPatients(data.map(cp => {
          const pr = profiles?.find(x => x.user_id === cp.patient_user_id);
          return { ...cp, name: pr?.full_name || "Sem nome", sex: pr?.sex || null };
        }));
      });
  }, [userId]);

  const saveProtocol = async (patientId?: string) => {
    if (!userId) return;
    // Remove flags internas de carregamento antes de persistir
    const cleanProtocol = protocol
      ? {
          ...(protocol as any),
          training_days: ((protocol as any).training_days || []).map(({ _loading, ...d }: any) => d),
        }
      : null;
    const { data: inserted, error } = await supabase.from("training_protocols").insert({
      user_id: userId, client_name: clientName, phase, muscles, level, weeks,
      days_per_week: days, equipment: equipment.join(", "), injuries,
      session_duration: sessionDuration,
      protocol_text: cleanProtocol ? JSON.stringify(cleanProtocol) : textResults.protocolo || "",
      anatomy_text: textResults.anatomia || "",
      tecnica_text: textResults.tecnica || "",
      periodizacao_text: textResults.periodizacao || "",
      patient_user_id: patientId || null,
    }).select("id").single();
    if (error) { toast.error("Erro ao salvar"); setShowSaveModal(false); return; }
    if (inserted?.id) setSavedProtocolId(inserted.id);

    // Se enviou para um aluno, dispara notificação
    if (patientId && inserted?.id) {
      const patientName = patients.find(p => p.patient_user_id === patientId)?.name || "aluno";
      const { error: notifErr } = await supabase.from("coach_notifications").insert({
        recipient_user_id: patientId,
        sender_user_id: userId,
        notification_type: "training_plan",
        title: "Novo plano de treino do seu coach",
        message: `${clientName || "Seu protocolo"} — ${phase || "treino"} (${days || "?"} dias/sem)`,
        action_url: "/training",
        reference_id: inserted.id,
      });
      if (notifErr) console.error("Notif error:", notifErr);
      toast.success(`Plano enviado para ${patientName}!`);
    } else {
      toast.success("Protocolo salvo!");
    }
    setShowSaveModal(false);
  };

  // ── Step 1: Anamnese ──
  if (step === 1 && !generated) {
    return (
      <div className="space-y-4 mt-3">
        <StepHeader step={1} total={2} title="Anamnese de Treino" subtitle="Dados do cliente para prescrição personalizada" />

        <Field label="Histórico de lesões ou restrições">
          <Textarea value={injuries} onChange={e => setInjuries(e.target.value)} placeholder="Ex: joelho direito, hérnia L4-L5, ombro com impingement" className="bg-transparent text-sm min-h-[60px]" style={{ borderColor: BORDER, color: TEXT }} />
        </Field>

        <Field label="Equipamentos disponíveis">
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map(e => (
              <button key={e} onClick={() => toggleEquipment(e)}
                className="text-[11px] px-3 py-2.5 rounded-xl transition-all text-left font-medium"
                style={{
                  background: equipment.includes(e) ? GREEN_DIM : SURFACE,
                  border: `1px solid ${equipment.includes(e) ? BORDER_ACTIVE : BORDER}`,
                  color: equipment.includes(e) ? GREEN : TEXT_DIM,
                }}>{e}</button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tempo por sessão">
            <StyledSelect value={sessionDuration} onValueChange={setSessionDuration} options={SESSION_DURATIONS.map(v => ({ value: v, label: v }))} />
          </Field>
          <Field label="Pratica cardio?">
            <StyledSelect value={cardio} onValueChange={setCardio} options={CARDIO_OPTIONS.map(v => ({ value: v, label: v }))} />
          </Field>
        </div>

        <Field label="Objetivo específico do cliente">
          <Textarea value={specificGoal} onChange={e => setSpecificGoal(e.target.value)} placeholder="Ex: aumentar largura de costas, melhorar glúteos, definir abdômen" className="bg-transparent text-sm min-h-[50px]" style={{ borderColor: BORDER, color: TEXT }} />
        </Field>

        <Field label="Pontos fracos identificados">
          <Input value={weakPoints} onChange={e => setWeakPoints(e.target.value)} placeholder="Ex: ombros pequenos, posterior de coxa fraco" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estresse / Recuperação">
            <StyledSelect value={stressLevel} onValueChange={setStressLevel} options={STRESS_OPTIONS.map(v => ({ value: v, label: v }))} />
          </Field>
          <Field label="Suplementos em uso">
            <Input value={supplements} onChange={e => setSupplements(e.target.value)} placeholder="creatina, whey..." className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
          </Field>
        </div>

        <Field label="🔬 Protocolo corretivo APEX (opcional — cole as recomendações)">
          <Textarea
            value={correctivePrompt}
            onChange={e => setCorrectivePrompt(e.target.value)}
            placeholder="Cole aqui o texto do protocolo corretivo gerado pelo APEX/TrainingON Sync. O sistema vai integrar exercícios corretivos, ativações e ajustes de volume ao treino principal."
            className="bg-transparent text-xs min-h-[120px] font-mono"
            style={{ borderColor: BORDER, color: TEXT }}
          />
          {correctivePrompt && (
            <div className="text-[10px] mt-1" style={{ color: GREEN }}>
              ✓ {correctivePrompt.length} caracteres — será integrado ao protocolo
            </div>
          )}
        </Field>

        <Button onClick={() => setStep(2)} className="w-full font-bold text-sm h-12 rounded-xl" style={{ background: GREEN, color: BG }}>
          Continuar para Protocolo <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  // ── Step 2: Protocol Config ──
  if (step === 2 && !generated) {
    return (
      <div className="space-y-4 mt-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep(1)} className="text-xs flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: TEXT_DIM }}>
            <ChevronLeft className="w-3 h-3" /> Voltar
          </button>
        </div>
        <StepHeader step={2} total={2} title="Configurar Protocolo" subtitle="Defina fase, divisão e prioridades musculares" />

        <Field label="Fase de treinamento">
          <div className="grid grid-cols-3 gap-2">
            {PHASES.map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                className="p-3 rounded-xl text-center transition-all"
                style={{
                  background: phase === p.id ? GREEN_DIM : SURFACE,
                  border: `1px solid ${phase === p.id ? BORDER_ACTIVE : BORDER}`,
                }}>
                <div className="text-lg mb-0.5">{p.emoji}</div>
                <div className="text-[11px] font-bold" style={{ color: phase === p.id ? GREEN : TEXT }}>{p.name}</div>
                <div className="text-[9px]" style={{ color: TEXT_MUTED }}>{p.subtitle}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Músculos prioritários (${muscles.length})`}>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLES.map(m => (
              <button key={m} onClick={() => toggleMuscle(m)}
                className="text-[10px] px-2.5 py-1.5 rounded-full transition-all font-medium"
                style={{
                  background: muscles.includes(m) ? GREEN_DIM : SURFACE,
                  border: `1px solid ${muscles.includes(m) ? BORDER_ACTIVE : BORDER}`,
                  color: muscles.includes(m) ? GREEN : TEXT_DIM,
                }}>{m}</button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nível de experiência">
            <StyledSelect value={level} onValueChange={setLevel} options={LEVELS.map(l => ({ value: l.value, label: l.label }))} placeholder="Selecione" />
          </Field>
          <Field label="Duração (semanas)">
            <StyledSelect value={weeks} onValueChange={setWeeks} options={WEEKS_OPTIONS.map(w => ({ value: w, label: `${w} semanas` }))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dias/semana">
            <StyledSelect value={days} onValueChange={setDays} options={DAYS_OPTIONS.map(d => ({ value: d, label: `${d} dias` }))} />
          </Field>
          <Field label="Nome do cliente">
            <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
          </Field>
        </div>

        <Field label="🧬 Sistema de Treinamento Base">
          <SystemSelectorInline
            context={{
              phase, level, days, weeks,
              fiberType: fiberProfile?.dominancia,
              weakPoints, specificGoal,
            }}
            selectedId={trainingSystem}
            onSelect={setTrainingSystem}
            surface={SURFACE} surface2={SURFACE2}
            border={BORDER} borderActive={BORDER_ACTIVE}
            green={GREEN} greenDim={GREEN_DIM}
            text={TEXT} textDim={TEXT_DIM} textMuted={TEXT_MUTED}
          />
        </Field>

        {/* Alertas automáticos: lesões, equipamento, tempo de sessão */}
        <Field label="🚨 Verificação de Compatibilidade">
          <SystemConflictAlerts
            systemId={trainingSystem}
            injuries={injuries}
            equipment={equipment}
            sessionDuration={sessionDuration}
            onSwitchSystem={setTrainingSystem}
            surface={SURFACE} surface2={SURFACE2}
            border={BORDER} borderActive={BORDER_ACTIVE}
            text={TEXT} textDim={TEXT_DIM} textMuted={TEXT_MUTED}
          />
        </Field>

        {/* Validação de duração estimada vs tempo disponível */}
        <Field label="⏱️ Validação de Tempo de Sessão">
          <ProtocolDurationCheck
            systemId={trainingSystem}
            muscles={muscles}
            level={level}
            sessionDuration={sessionDuration}
            cardio={cardio}
            surface={SURFACE} surface2={SURFACE2}
            border={BORDER} borderActive={BORDER_ACTIVE}
            green={GREEN} greenDim={GREEN_DIM}
            text={TEXT} textDim={TEXT_DIM} textMuted={TEXT_MUTED}
          />
        </Field>

        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
              style={{
                background: fiberProfile ? "rgba(74,222,128,0.1)" : "rgba(100,116,139,0.08)",
                border: `1px solid ${fiberProfile ? "rgba(74,222,128,0.3)" : "rgba(100,116,139,0.15)"}`,
                color: fiberProfile ? GREEN : TEXT_MUTED,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: fiberProfile ? GREEN : TEXT_MUTED }} />
              {fiberProfile ? `🧬 Fibras: ${fiberProfile.dominancia.replace("tipo_", "Tipo ").toUpperCase()}` : "🧬 Fibras: não avaliado"}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
              style={{
                background: readyCheckin ? "rgba(249,115,22,0.1)" : "rgba(100,116,139,0.08)",
                border: `1px solid ${readyCheckin ? "rgba(249,115,22,0.3)" : "rgba(100,116,139,0.15)"}`,
                color: readyCheckin ? "#f97316" : TEXT_MUTED,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: readyCheckin ? "#f97316" : TEXT_MUTED }} />
              {readyCheckin ? `⚡ Ready: Sono ${readyCheckin.sono} · Energia ${readyCheckin.energia}` : "⚡ STRATUM Ready: não registrado"}
            </div>
          </div>

          {(() => {
            const durEst = estimateProtocolDuration({ systemId: trainingSystem, muscles, level, sessionDuration, cardio });
            const blockedByTime = durEst.diff <= -15;
            const disabled = loading || blockedByTime;
            return (
              <Button
                onClick={generate}
                disabled={disabled}
                className="w-full font-black text-sm h-12 rounded-xl tracking-wide"
                style={{ background: disabled ? TEXT_MUTED : (blockedByTime ? "#f87171" : GREEN), color: BG, opacity: disabled ? 0.7 : 1 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> Gerando protocolo de elite...</span>
                ) : blockedByTime ? (
                  <span className="flex items-center gap-2">⛔ TEMPO INSUFICIENTE — ESTOURA {Math.abs(durEst.diff)}MIN</span>
                ) : (fiberProfile || readyCheckin) ? (
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> GERAR PROTOCOLO ELITE SINCRONIZADO</span>
                ) : (
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> GERAR PROTOCOLO DE ELITE</span>
                )}
              </Button>
            );
          })()}

          {!fiberProfile && (
            <p className="text-[9px] text-center" style={{ color: TEXT_MUTED }}>
              💡 Vá em <b>Fibras</b> e converse com o agente para ativar a prescrição sincronizada
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Results View ──
  if (generated) {
    const resultTabs = [
      { id: "overview", label: "Visão Geral", icon: Eye },
      { id: "fases", label: "Fases", icon: TrendingUp },
      { id: "treino", label: "Treino", icon: Dumbbell },
      { id: "anatomia", label: "Anatomia", icon: Activity },
      { id: "tecnica", label: "Técnica", icon: Target },
      { id: "periodizacao", label: "Periodização", icon: BarChart3 },
      { id: "biomec", label: "Biomecânica", icon: Microscope },
      { id: "emg", label: "EMG", icon: Zap },
      { id: "postural", label: "Postural", icon: Scan },
      { id: "recuperacao", label: "Recuperação", icon: HeartPulse },
      { id: "metodologia", label: "Metodologia", icon: BookOpen },
      { id: "feminino", label: "Feminino", icon: Shield },
      { id: "platô", label: "Platô", icon: TrendingDown },
    ];

    const saveToNotebook = async () => {
      if (!userId) return;
      const protocolData = protocol || textResults;
      await supabase.from("lab_saved_items").insert({
        user_id: userId,
        tipo: "protocolo_treino",
        titulo: `Protocolo: ${clientName} — ${PHASES.find(p => p.id === phase)?.name || phase}`,
        conteudo: { protocol: protocolData, clientName, phase, muscles, level, weeks, days },
        tags: ["training", phase],
      });
      toast.success("Salvo no caderno científico!");
    };

    const exportPDF = () => {
      const data = protocol || textResults;
      exportTrainingPDF(data, clientName, {
        phase: PHASES.find(p => p.id === phase)?.name || phase,
        level,
        weeks,
        days,
      });
      toast.success("PDF premium exportado!");
    };

    const exportFormatted = () => {
      const lines: string[] = [];
      const pp = protocol?.phase_plan;
      if (pp) {
        lines.push(`═══════════════════════════════════════`);
        lines.push(`PLANEJAMENTO DE FASES — ${clientName.toUpperCase()}`);
        lines.push(`═══════════════════════════════════════\n`);
        if (pp.macrocycle_title) lines.push(`📊 ${pp.macrocycle_title}`);
        if (pp.current_phase) lines.push(`🔵 Fase Atual: ${pp.current_phase}`);
        pp.phases?.forEach((ph: any, i: number) => {
          lines.push(`\n  ── FASE ${i + 1}: ${ph.name} (${ph.duration_weeks} semanas) ──`);
          if (ph.objective) lines.push(`  Objetivo: ${ph.objective}`);
          if (ph.volume_strategy) lines.push(`  Volume: ${ph.volume_strategy}`);
          if (ph.intensity_strategy) lines.push(`  Intensidade: ${ph.intensity_strategy}`);
          if (ph.criteria_to_advance) lines.push(`  Critério: ${ph.criteria_to_advance}`);
          if (ph.rationale) lines.push(`  Justificativa: ${ph.rationale}`);
        });
        if (pp.deload_strategy) lines.push(`\n🛡️ DELOAD: ${pp.deload_strategy}`);
        if (pp.post_deload_decision?.scenarios?.length) {
          lines.push(`\n⚡ DECISÃO PÓS-DELOAD:`);
          if (pp.post_deload_decision.intro) lines.push(`${pp.post_deload_decision.intro}\n`);
          pp.post_deload_decision.scenarios.forEach((sc: any, i: number) => {
            lines.push(`  ${i + 1}. ${sc.condition}`);
            lines.push(`     Sinais: ${sc.signal}`);
            lines.push(`     Decisão: ${sc.decision}`);
            lines.push(`     Ação: ${sc.action}`);
            lines.push(`     Início do próximo bloco: ${sc.how_next_block_starts}\n`);
          });
        }
        if (pp.long_term_note) lines.push(`\n🎯 VISÃO LONGO PRAZO: ${pp.long_term_note}`);
        lines.push(`\n`);
      }
      const ov = protocol?.block_overview;
      if (ov) {
        lines.push(`═══════════════════════════════════════`);
        lines.push(`PROTOCOLO DE TREINO — ${clientName.toUpperCase()}`);
        lines.push(`═══════════════════════════════════════\n`);
        lines.push(`📋 ${ov.title || "Protocolo de Elite"}`);
        lines.push(`⏱  Duração: ${ov.duration_weeks} semanas | Deload: Semana ${ov.deload_week}`);
        lines.push(`🔀 Divisão: ${ov.split_type}`);
        lines.push(`\n📝 JUSTIFICATIVA DA DIVISÃO:`);
        lines.push(ov.split_justification || "");
        lines.push(`\n📈 MODELO DE PROGRESSÃO:`);
        lines.push(ov.progression_model || "");
        if (ov.muscle_priorities?.length) {
          lines.push(`\n🎯 PRIORIDADES MUSCULARES:`);
          ov.muscle_priorities.forEach((mp: any) => lines.push(`  • ${mp.muscle} — ${mp.weekly_sets} séries/sem (${mp.priority})`));
        }
        if (ov.coach_notes) lines.push(`\n💡 OBSERVAÇÕES DO COACH:\n${ov.coach_notes}`);
      }
      if (protocol?.training_days?.length) {
        protocol.training_days.forEach((day: any) => {
          lines.push(`\n${"─".repeat(40)}`);
          lines.push(`DIA ${day.day_number} — ${day.session_title}`);
          lines.push(`Foco: ${day.focus_muscles?.join(", ")} | Duração: ${day.estimated_duration}`);
          if (day.warmup?.length) {
            lines.push(`\n  🔥 WARM-UP:`);
            day.warmup.forEach((w: any) => lines.push(`    • ${w.name} — ${w.sets}×${w.reps}`));
          }
          day.exercises?.forEach((ex: any, i: number) => {
            lines.push(`\n  ${i + 1}. ${ex.name}`);
            lines.push(`     Alvo: ${ex.muscle_target} | Tempo: ${ex.tempo || "—"}`);
            const s = ex.structure || {};
            if (s.feeder_sets?.length) s.feeder_sets.forEach((f: any) => lines.push(`     [FEEDER] ${f.load_percent} × ${f.reps}`));
            if (s.top_set) lines.push(`     [TOP SET] ${s.top_set.sets}×${s.top_set.reps} RPE ${s.top_set.rpe} | Descanso: ${s.top_set.rest}`);
            if (s.backoff_sets) lines.push(`     [BACK-OFF] ${s.backoff_sets.sets} séries × ${s.backoff_sets.reps} (${s.backoff_sets.load_reduction})`);
            if (s.work_sets) lines.push(`     [TRABALHO] ${s.work_sets.sets} séries × ${s.work_sets.reps} RPE ${s.work_sets.rpe}`);
            if (ex.execution_cues) lines.push(`     📌 ${ex.execution_cues}`);
          });
          if (day.session_notes) lines.push(`\n  📝 ${day.session_notes}`);
        });
      }
      if (!protocol && textResults.protocolo) lines.push(textResults.protocolo);
      const text = lines.join("\n");
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `protocolo_${clientName.replace(/\s+/g, "_")}.txt`; a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-4 mt-3">
        <div className="flex items-center justify-between">
          <button onClick={() => { setGenerated(false); setStep(2); setProtocol(null); setTextResults({}); }}
            className="text-xs flex items-center gap-1" style={{ color: TEXT_DIM }}>
            <ChevronLeft className="w-3 h-3" /> Novo protocolo
          </button>
          <div className="flex gap-1.5">
            <button onClick={() => saveToNotebook()} className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(139,92,246,0.08)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.15)" }}>
              <Bookmark className="w-3 h-3" /> Caderno
            </button>
            <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg font-semibold" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER}` }}>
              <Save className="w-3 h-3" /> Salvar
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
              <FileDown className="w-3 h-3" /> PDF
            </button>
            <button onClick={exportFormatted} className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg font-semibold" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER}` }}>
              <Download className="w-3 h-3" /> TXT
            </button>
          </div>
        </div>

        {(protocol || textResults.protocolo) && (
          <SendToAthleteBar
            type="training_plan"
            sourceId={savedProtocolId}
            label={`${clientName || "Protocolo"} — ${phase || "treino"}`}
            buildPayload={() => ({
              protocol: protocol || null,
              protocol_text: textResults.protocolo || "",
              periodizacao_text: textResults.periodizacao || "",
              client_name: clientName,
              phase,
              weeks,
            })}
          />
        )}


        {loading || generationError ? (
          <StratumGenerationProgress
            error={generationError}
            onRetry={() => { setGenerationError(null); generate(); }}
            onCancel={() => { setGenerationError(null); setGenerated(false); }}
          />
        ) : (
          <>
            {/* Result Tabs */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {resultTabs.map(t => (
                <button key={t.id} onClick={() => {
                  setActiveResultTab(t.id);
                  if (t.id !== "overview" && t.id !== "treino" && t.id !== "fases") loadTab(t.id);
                }}
                  className="flex items-center gap-1 text-[10px] px-3 py-2 whitespace-nowrap rounded-xl transition-all font-semibold"
                  style={{
                    background: activeResultTab === t.id ? GREEN_DIM : "transparent",
                    color: activeResultTab === t.id ? GREEN : TEXT_MUTED,
                    border: `1px solid ${activeResultTab === t.id ? BORDER_ACTIVE : "transparent"}`,
                  }}>
                  <t.icon className="w-3 h-3" />{t.label}
                </button>
              ))}
            </div>

            {console.log("[CHECK render]", {
              activeResultTab,
              hasProtocol: !!protocol,
              protocolType: typeof protocol,
              protocolKeys: protocol ? Object.keys(protocol) : null,
              hasBlockOverview: !!(protocol as any)?.block_overview,
              hasTrainingDays: !!(protocol as any)?.training_days,
              textResultsProtoType: typeof textResults.protocolo,
              textResultsProtoPreview: typeof textResults.protocolo === "string"
                ? textResults.protocolo.slice(0, 100)
                : null,
            })}

            {/* ── Overview Tab ── */}
            {activeResultTab === "overview" && (() => {
              // Padrão unificado — igual ao modal de histórico arquivado
              const source = (protocol as any) ?? textResults.protocolo;
              const { json, markdown } = parseProtocolText(source);
              const proto = (protocol as any)?.block_overview ? (protocol as any) : json;

              if (proto?.block_overview) {
                return (
                  <div className="space-y-3">
                    <BlockOverviewCard
                      overview={proto.block_overview}
                      alerts={proto.improvement_alerts}
                      clientName={clientName}
                      trainingDays={proto.training_days}
                      systemId={trainingSystem}
                    />
                    {isMello16 && <WeekNavigator onWeekChange={setWeekPhase} />}
                    {proto.training_days?.map((day: any, idx: number) => (
                      (day?._loading || dayStatus[day?.day_number] === "loading" || dayStatus[day?.day_number] === "error") &&
                      !(day?.exercises?.length) ? (
                        <DayLoadingCard
                          key={idx}
                          dayNumber={day?.day_number ?? idx + 1}
                          title={day?.session_title}
                          focusMuscles={day?.focus_muscles}
                          state={dayStatus[day?.day_number] === "error" ? "error" : "loading"}
                          onRetry={() => regenerateDay(day?.day_number ?? idx + 1)}
                        />
                      ) : (
                      <TrainingDayCard
                        key={idx}
                        day={day}
                        index={idx}
                        expanded={expandedDay === idx}
                        setExpandedDay={setExpandedDay}
                        expandedExercise={expandedExercise}
                        setExpandedExercise={setExpandedExercise}
                        weekPhase={isMello16 ? weekPhase : null}
                        athleteId={userId}
                        protocolId={savedProtocolId}
                      />
                      )
                    ))}
                  </div>
                );
              }
              if (markdown) {
                return <MarkdownProtocolView content={markdown} title={clientName || "Protocolo"} />;
              }
              return (
                <p className="text-xs text-center py-8 text-zinc-500">
                  Sem dados do protocolo. Gere um treino novo na aba "Prescrição".
                </p>
              );
            })()}


            {/* ── Phase Plan Tab ── */}
            {activeResultTab === "fases" && protocol?.phase_plan && (
              <PhasePlanCard plan={protocol.phase_plan} />
            )}
            {activeResultTab === "fases" && !protocol?.phase_plan && (
              <div className="rounded-2xl p-5 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <p className="text-[11px]" style={{ color: TEXT_MUTED }}>Planejamento de fases não disponível neste protocolo.</p>
              </div>
            )}

            {/* ── Training Days Tab ── */}
            {activeResultTab === "treino" && (() => {
              const { json: protocolObj, markdown: protocolMd } = parseProtocolText(
                (protocol as any) ?? textResults.protocolo
              );

              if (protocolObj?.training_days) {
                return (
                  <div className="space-y-3">
                    {isMello16 && <WeekNavigator onWeekChange={setWeekPhase} />}
                    <MesocycleRIRPlanner
                      totalWeeks={Math.max(parseInt(String(weeks)) || 8, 1)}
                      currentWeek={isMello16 ? weekPhase.week : 1}
                    />
                    {userId && (
                      <PlateauDashboard
                        athleteId={userId}
                        exercises={(protocolObj.training_days || []).flatMap((d: any) =>
                          (d.exercises || []).map((e: any) => ({ nome: e?.name ?? e?.nome ?? "" }))
                        ).filter((e: any) => e.nome)}
                        semanaMeso={isMello16 ? weekPhase.week : 1}
                        totalMeso={Math.max(parseInt(String(weeks)) || 8, 1)}
                      />
                    )}
                    {protocolObj.training_days.map((day: any, idx: number) => (
                      (day?._loading || dayStatus[day?.day_number] === "loading" || dayStatus[day?.day_number] === "error") &&
                      !(day?.exercises?.length) ? (
                        <DayLoadingCard
                          key={idx}
                          dayNumber={day?.day_number ?? idx + 1}
                          title={day?.session_title}
                          focusMuscles={day?.focus_muscles}
                          state={dayStatus[day?.day_number] === "error" ? "error" : "loading"}
                          onRetry={() => regenerateDay(day?.day_number ?? idx + 1)}
                        />
                      ) : (
                      <TrainingDayCard
                        key={idx}
                        day={day}
                        index={idx}
                        expanded={expandedDay === idx}
                        setExpandedDay={setExpandedDay}
                        expandedExercise={expandedExercise}
                        setExpandedExercise={setExpandedExercise}
                        weekPhase={isMello16 ? weekPhase : null}
                        athleteId={userId}
                        protocolId={savedProtocolId}
                      />
                      )
                    ))}
                  </div>
                );
              }
              if (protocolMd) {
                return <MarkdownProtocolView content={protocolMd} title={clientName || "Protocolo"} />;
              }
              return (
                <p className="text-xs text-center py-8 text-zinc-500">
                  Sem dados do protocolo
                </p>
              );
            })()}


            {/* ── Text Tabs ── */}
            {["anatomia", "tecnica", "periodizacao", "biomec", "emg", "postural", "recuperacao", "metodologia", "feminino", "platô"].includes(activeResultTab) && (
              loadingTab[activeResultTab] ? <LoadingState /> :
              textResults[activeResultTab] ? <TextCard content={safeTextContent(textResults[activeResultTab])} /> :
              <div className="py-12 text-center"><p className="text-xs" style={{ color: TEXT_MUTED }}>Clique na aba para carregar</p></div>
             )}
           </>
         )}

         {/* Save Modal */}
         <AnimatePresence>
           {showSaveModal && (
             <SaveProtocolModal
               patients={patients}
               selectedPatient={selectedPatient}
               setSelectedPatient={setSelectedPatient}
               clientName={clientName}
               onSave={(patientId) => saveProtocol(patientId)}
               onClose={() => setShowSaveModal(false)}
             />
           )}
         </AnimatePresence>
       </div>
     );
   }

   return null;
 }

/* ── Save Protocol Modal ── */
function SaveProtocolModal({ patients, selectedPatient, setSelectedPatient, clientName, onSave, onClose }: {
  patients: any[]; selectedPatient: string; setSelectedPatient: (v: string) => void;
  clientName: string; onSave: (patientId?: string) => void; onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5" style={{ background: BG, border: `1px solid ${BORDER_ACTIVE}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" style={{ color: GREEN }} />
            <h3 className="text-sm font-black" style={{ color: TEXT, fontFamily: FONT }}>Salvar Protocolo</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: SURFACE2 }}>
            <X className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
          </button>
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-semibold mb-0.5" style={{ color: TEXT_MUTED }}>Cliente</p>
          <p className="text-sm font-bold" style={{ color: TEXT }}>{clientName}</p>
        </div>

        {patients.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold mb-2 tracking-wide uppercase" style={{ color: TEXT_MUTED }}>
              <Users className="w-3 h-3 inline mr-1" />Vincular a um paciente
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <button onClick={() => setSelectedPatient("")}
                className="w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all"
                style={{
                  background: !selectedPatient ? GREEN_DIM : SURFACE,
                  border: `1px solid ${!selectedPatient ? BORDER_ACTIVE : BORDER}`,
                  color: !selectedPatient ? GREEN : TEXT_DIM,
                }}>
                Sem vínculo (salvar apenas)
              </button>
              {patients.map(p => (
                <button key={p.patient_user_id} onClick={() => setSelectedPatient(p.patient_user_id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all"
                  style={{
                    background: selectedPatient === p.patient_user_id ? GREEN_DIM : SURFACE,
                    border: `1px solid ${selectedPatient === p.patient_user_id ? BORDER_ACTIVE : BORDER}`,
                    color: selectedPatient === p.patient_user_id ? GREEN : TEXT_DIM,
                  }}>
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: GREEN_DIM, color: GREEN }}>
                      {p.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {p.name}
                    {selectedPatient === p.patient_user_id && <Check className="w-3 h-3 ml-auto" style={{ color: GREEN }} />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button onClick={() => onSave(selectedPatient || undefined)} className="w-full font-bold text-sm h-11 rounded-xl" style={{ background: GREEN, color: BG }}>
          <Save className="w-4 h-4 mr-2" /> Salvar Protocolo
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ── Phase Plan Card ── */
function PhasePlanCard({ plan }: { plan: any }) {
  const phaseColors: Record<string, string> = {
    "Bulking": "#4ade80",
    "Cutting": "#f97316",
    "Transição": "#60a5fa",
    "Manutenção": "#fbbf24",
  };

  const getPhaseColor = (name: string) => {
    for (const key in phaseColors) {
      if (name.toLowerCase().includes(key.toLowerCase())) return phaseColors[key];
    }
    return GREEN;
  };

  return (
    <div className="space-y-3">
      {/* Macrocycle Header */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${SURFACE} 0%, ${SURFACE2} 100%)`, border: `1px solid ${BORDER_ACTIVE}` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(74,222,128,0.06)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: GREEN }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>Planejamento de Fases</span>
          </div>
          <h2 className="text-base font-black mb-1" style={{ color: TEXT, fontFamily: FONT }}>{plan.macrocycle_title || "Macrociclo"}</h2>
          {plan.current_phase && (
            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full" style={{ background: GREEN_DIM, border: `1px solid ${BORDER_ACTIVE}` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
              <span className="text-[10px] font-bold" style={{ color: GREEN }}>{plan.current_phase}</span>
            </div>
          )}
        </div>
      </div>

      {/* Phase Timeline */}
      {plan.phases?.map((phase: any, i: number) => {
        const color = getPhaseColor(phase.name);
        const isCurrent = phase.name.toLowerCase().includes("atual");
        return (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${isCurrent ? color + "40" : BORDER}` }}>
            {/* Phase Header */}
            <div className="p-4" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ background: `${color}15`, color }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: TEXT }}>{phase.name}</p>
                    <p className="text-[9px]" style={{ color: TEXT_MUTED }}>{phase.duration_weeks} semanas{phase.mesocycles ? ` · ${phase.mesocycles} mesociclo${phase.mesocycles > 1 ? "s" : ""}` : ""}</p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[8px] px-2 py-1 rounded-full font-bold uppercase" style={{ background: `${color}15`, color }}>Fase Atual</span>
                )}
              </div>

              {/* Objective */}
              <p className="text-[11px] mb-3 leading-relaxed" style={{ color: TEXT_DIM }}>{phase.objective}</p>

              {/* Strategy Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {phase.volume_strategy && (
                  <div className="rounded-lg p-2" style={{ background: SURFACE2 }}>
                    <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: TEXT_MUTED }}>Volume</span>
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{phase.volume_strategy}</p>
                  </div>
                )}
                {phase.intensity_strategy && (
                  <div className="rounded-lg p-2" style={{ background: SURFACE2 }}>
                    <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: TEXT_MUTED }}>Intensidade</span>
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{phase.intensity_strategy}</p>
                  </div>
                )}
              </div>

              {/* Criteria to advance */}
              {phase.criteria_to_advance && (
                <div className="rounded-lg p-2" style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
                  <span className="text-[8px] font-bold" style={{ color }}>📊 CRITÉRIO PARA AVANÇAR</span>
                  <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{phase.criteria_to_advance}</p>
                </div>
              )}

              {/* Rationale */}
              {phase.rationale && (
                <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(74,222,128,0.03)" }}>
                  <span className="text-[8px] font-bold" style={{ color: GREEN }}>💡 JUSTIFICATIVA</span>
                  <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: TEXT_MUTED }}>{phase.rationale}</p>
                </div>
              )}
            </div>

            {/* Connector */}
            {i < (plan.phases?.length || 0) - 1 && (
              <div className="flex justify-center py-0">
                <div className="w-px h-3" style={{ background: BORDER_ACTIVE }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Deload Strategy */}
      {plan.deload_strategy && (
        <div className="rounded-xl p-3" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className="w-3 h-3" style={{ color: "#60a5fa" }} />
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>Estratégia de Deload</span>
          </div>
          <p className="text-[11px]" style={{ color: TEXT_DIM }}>{plan.deload_strategy}</p>
        </div>
      )}

      {/* Post-Deload Decision Tree */}
      {plan.post_deload_decision && (
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid rgba(249,115,22,0.2)` }}>
          <div className="p-4" style={{ background: "rgba(249,115,22,0.06)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" style={{ color: "#f97316" }} />
              <span className="text-[11px] font-black tracking-wider uppercase" style={{ color: "#f97316" }}>Decisão Pós-Deload</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: TEXT_DIM }}>{plan.post_deload_decision.intro || "Após o deload, o sistema decide o próximo passo com base na resposta do aluno."}</p>
          </div>
          <div className="p-3 space-y-2">
            {plan.post_deload_decision.scenarios?.map((sc: any, i: number) => {
              const scenarioColors = ["#4ade80", "#60a5fa", "#ef4444", "#fbbf24", "#a78bfa"];
              const scenarioIcons = ["📈", "🔄", "🛑", "🔀", "🎯"];
              const color = scenarioColors[i] || GREEN;
              return (
                <PostDeloadScenario key={i} scenario={sc} color={color} icon={scenarioIcons[i] || "▸"} index={i} />
              );
            })}
          </div>
        </div>
      )}

      {/* Long-term Note */}
      {plan.long_term_note && (
        <div className="rounded-xl p-3" style={{ background: "rgba(74,222,128,0.04)", borderLeft: `3px solid ${GREEN}` }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3 h-3" style={{ color: GREEN }} />
            <span className="text-[10px] font-bold" style={{ color: GREEN }}>Visão de Longo Prazo</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>{plan.long_term_note}</p>
        </div>
      )}
    </div>
  );
}

/* ── Post-Deload Scenario Card ── */
function PostDeloadScenario({ scenario, color, icon, index }: { scenario: any; color: string; icon: string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center gap-2.5 text-left">
        <span className="text-base">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold" style={{ color: TEXT }}>{scenario.condition}</p>
          <p className="text-[9px] truncate" style={{ color: TEXT_MUTED }}>{scenario.signal}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap" style={{ background: `${color}15`, color }}>{scenario.decision}</span>
          {expanded ? <ChevronUp className="w-3 h-3 shrink-0" style={{ color: TEXT_MUTED }} /> : <ChevronDown className="w-3 h-3 shrink-0" style={{ color: TEXT_MUTED }} />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-3 pb-3 space-y-2">
              <div className="rounded-lg p-2.5" style={{ background: SURFACE2 }}>
                <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: TEXT_MUTED }}>Sinais Observados</span>
                <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{scenario.signal}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: SURFACE2 }}>
                <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color }}>Ação Recomendada</span>
                <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{scenario.action}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color }}>Como o Próximo Bloco Começa</span>
                <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{scenario.how_next_block_starts}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Block Overview Card ── */
function BlockOverviewCard({ overview, alerts, clientName, trainingDays, systemId }: { overview: any; alerts?: any[]; clientName: string; trainingDays?: any[]; systemId?: string }) {
  const [volumeMode, setVolumeMode] = useState<"primary" | "synergy">("primary");
  const volumeReport = trainingDays && overview.muscle_priorities
    ? buildVolumeReport(overview.muscle_priorities, trainingDays, { mode: volumeMode, synergyFactor: 0.5 })
    : [];
  const gvtWarnings = detectGvtMismatch(systemId, overview.muscle_priorities || []);
  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${SURFACE} 0%, ${SURFACE2} 100%)`, border: `1px solid ${BORDER_ACTIVE}` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(74,222,128,0.06)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: GREEN }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>Protocolo de Elite</span>
          </div>
          <h2 className="text-base font-black mb-1" style={{ color: TEXT, fontFamily: FONT }}>{overview.title || `Bloco para ${clientName}`}</h2>
          <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>{overview.split_justification}</p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <MiniStat icon={<Clock className="w-3 h-3" />} label="Duração" value={`${overview.duration_weeks} sem`} />
            <MiniStat icon={<Target className="w-3 h-3" />} label="Divisão" value={overview.split_type} />
            <MiniStat icon={<Shield className="w-3 h-3" />} label="Deload" value={`Sem ${overview.deload_week}`} />
          </div>
        </div>
      </div>

      {/* Progression Model */}
      {overview.progression_model && (
        <div className="rounded-xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: GREEN }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: GREEN }}>Modelo de Progressão</span>
          </div>
          <p className="text-[11px]" style={{ color: TEXT_DIM }}>{overview.progression_model}</p>
        </div>
      )}

      {/* Muscle Priorities — agora com volume realizado vs prescrito */}
      {overview.muscle_priorities?.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT }}>Prioridade Muscular</span>
            {volumeReport.length > 0 && (
              <span className="text-[8px] font-medium ml-auto" style={{ color: TEXT_MUTED }}>realizado / prescrito</span>
            )}
          </div>
          {trainingDays && (
            <div className="flex items-center gap-1 mb-2 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}` }}>
              <button
                onClick={() => setVolumeMode("primary")}
                className="flex-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all"
                style={{ background: volumeMode === "primary" ? GREEN : "transparent", color: volumeMode === "primary" ? "#000" : TEXT_DIM }}
                title="Conta apenas o músculo primário (padrão científico)"
              >
                Só primário
              </button>
              <button
                onClick={() => setVolumeMode("synergy")}
                className="flex-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all"
                style={{ background: volumeMode === "synergy" ? GREEN : "transparent", color: volumeMode === "synergy" ? "#000" : TEXT_DIM }}
                title="Primário 1.0 + secundários 0.5"
              >
                + Sinergistas (0.5)
              </button>
            </div>
          )}
          <div className="space-y-2">
            {overview.muscle_priorities.map((mp: any, i: number) => {
              const rep = volumeReport.find((r) => r.muscle === mp.muscle);
              const prescribed = Number(mp.weekly_sets) || 0;
              const actual = rep?.actual ?? 0;
              const color = rep?.color ?? GREEN;
              const pct = prescribed > 0 ? Math.min(150, (actual / prescribed) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: mp.priority === "alta" ? "#f97316" : mp.priority === "media" ? "#fbbf24" : GREEN }} />
                    <span className="text-[11px] font-semibold flex-1" style={{ color: TEXT }}>{mp.muscle}</span>
                    {trainingDays ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums" style={{ background: `${color}1a`, color }}>
                        {actual}/{prescribed} sér/sem
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(74,222,128,0.08)", color: GREEN }}>{prescribed} séries/sem</span>
                    )}
                  </div>
                  {trainingDays && prescribed > 0 && (
                    <div className="ml-4 mt-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {overview.maintenance_muscles?.length > 0 && (
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
              <span className="text-[9px] font-medium" style={{ color: TEXT_MUTED }}>Manutenção: {overview.maintenance_muscles.join(", ")}</span>
            </div>
          )}
          {/* Alertas automáticos de volume */}
          {volumeReport.filter((r) => r.status === "above").map((r, i) => (
            <div key={`above-${i}`} className="mt-2 rounded-lg p-2 text-[10px]" style={{ background: "rgba(255,51,102,0.08)", border: "1px solid rgba(255,51,102,0.25)", color: "#FF3366" }}>
              ⚠️ {r.muscle}: {r.actual} séries excedem o volume prescrito ({r.prescribed}). Revise a distribuição semanal.
            </div>
          ))}
          {gvtWarnings.map((msg, i) => (
            <div key={`gvt-${i}`} className="mt-2 rounded-lg p-2 text-[10px]" style={{ background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.25)", color: "#FFB300" }}>
              ⚠️ {msg}
            </div>
          ))}
        </div>
      )}

      {/* Coach Notes */}
      {overview.coach_notes && (
        <div className="rounded-xl p-3" style={{ background: "rgba(74,222,128,0.04)", borderLeft: `3px solid ${GREEN}` }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3 h-3" style={{ color: GREEN }} />
            <span className="text-[10px] font-bold" style={{ color: GREEN }}>Observações do Coach</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>{overview.coach_notes}</p>
        </div>
      )}

      {/* Improvement Alerts */}
      {alerts?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#fbbf24" }}>Alertas de Melhoria</span>
          </div>
          {alerts.map((a: any, i: number) => (
            <div key={i} className="rounded-xl p-3" style={{
              background: a.severity === "alta" ? "rgba(239,68,68,0.06)" : "rgba(251,191,36,0.06)",
              border: `1px solid ${a.severity === "alta" ? "rgba(239,68,68,0.15)" : "rgba(251,191,36,0.15)"}`,
            }}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold" style={{ color: a.severity === "alta" ? "#ef4444" : "#fbbf24" }}>{a.area}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase" style={{
                  background: a.severity === "alta" ? "rgba(239,68,68,0.15)" : "rgba(251,191,36,0.15)",
                  color: a.severity === "alta" ? "#ef4444" : "#fbbf24",
                }}>{a.severity}</span>
              </div>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Helpers de extração de tags de músculo (inclui pares de super-set) ── */
const _normMuscle = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Mapeia pistas no nome do exercício → label de músculo exibido como tag.
const NAME_TO_MUSCLE: Array<{ keys: string[]; label: string }> = [
  { keys: ["gastrocn"], label: "Gastrocnêmio" },
  { keys: ["soleo"], label: "Sóleo" },
  { keys: ["panturrilha", "calf", "gemeo"], label: "Panturrilha" },
  { keys: ["extensora", "agachamento", "leg press", "hack", "sissy", "afundo", "bulgaro", "lunge"], label: "Quadríceps" },
  { keys: ["stiff", "mesa flexora", "flexora", "rdl", "good morning", "nordic"], label: "Posterior de Coxa" },
  { keys: ["gluteo", "hip thrust", "elevacao pelvica", "pelvica", "abducao", "abdutor", "kickback"], label: "Glúteos" },
  { keys: ["adutor", "aducao"], label: "Adutores" },
  { keys: ["supino", "crossover", "crucifixo", "peck deck", "peck-deck", "voador", "flexao"], label: "Peito" },
  { keys: ["remada", "puxada", "barra fixa", "pulldown", "pull down", "pullover"], label: "Costas" },
  { keys: ["desenvolvimento", "elevacao lateral", "elevacao frontal", "arnold", "facepull", "face pull", "encolhimento", "shrug"], label: "Deltoides" },
  { keys: ["rosca", "scott", "martelo", "biceps"], label: "Bíceps" },
  { keys: ["triceps", "frances", "francesa", "testa", "tricep"], label: "Tríceps" },
  { keys: ["abdom", "prancha", "cable crunch", "obliquo"], label: "Abdômen" },
  { keys: ["lombar", "hiperextensao", "extensao lombar"], label: "Lombar" },
  { keys: ["antebraco", "punho"], label: "Antebraço" },
];

function inferMuscleFromName(name: string): string[] {
  const n = _normMuscle(name);
  if (!n) return [];
  const out: string[] = [];
  for (const { keys, label } of NAME_TO_MUSCLE) {
    if (keys.some((k) => n.includes(k))) out.push(label);
  }
  return out;
}

/**
 * Extrai todas as tags de músculo de um dia de treino, iterando sobre TODOS
 * os exercícios — incluindo os pares de super-set codificados no nome
 * (ex: "Cadeira Extensora + Panturrilha em Pé"). Mantém deduplicação.
 */
function extractDayMuscleTags(day: any): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (label: string) => {
    if (!label) return;
    const key = _normMuscle(label);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(label);
  };

  (day?.focus_muscles || []).forEach((m: string) => push(String(m).trim()));

  // Itera sobre TODOS os exercícios — incluindo pares de super-set, seja por
  // separador no nome (ex: "Cadeira Extensora + Panturrilha em Pé") ou por
  // campo aninhado (ex.super_set / superset / paired / pair_exercise / pair).
  const visit = (ex: any) => {
    if (!ex || typeof ex !== "object") return;
    if (ex.muscle_target) push(String(ex.muscle_target).trim());
    if (Array.isArray(ex.secondary_muscles)) {
      ex.secondary_muscles.forEach((m: string) => push(String(m).trim()));
    }
    // Quebra o nome por TODOS os separadores comuns de super-set.
    const parts = String(ex.name || "").split(
      /\s*(?:\+|\/|&|,|;|\||•|·|–|—|-|\bcom\b|\be\b)\s*/i
    );
    parts.forEach((p) => inferMuscleFromName(p).forEach(push));

    // Pares aninhados de super-set podem vir em diversos formatos.
    const nested = [
      ex.super_set, ex.superset, ex.paired, ex.pair, ex.pair_exercise,
      ex.partner, ex.combo, ex.group,
    ];
    nested.forEach((n) => {
      if (!n) return;
      if (Array.isArray(n)) n.forEach(visit);
      else if (typeof n === "object") visit(n);
      else if (typeof n === "string") {
        n.split(/\s*(?:\+|\/|&|,|;|\||•|·|–|—|-|\bcom\b|\be\b)\s*/i)
          .forEach((p) => inferMuscleFromName(p).forEach(push));
      }
    });
  };

  (day?.exercises || []).forEach(visit);

  return out;
}

/* ── Training Day Card ── */
const TrainingDayCard = memo(function TrainingDayCard({ day, index, expanded, setExpandedDay, expandedExercise, setExpandedExercise, weekPhase, athleteId, protocolId }: any) {
  const muscleTags = useMemo(() => extractDayMuscleTags(day), [day]);
  const onToggle = useCallback(
    () => setExpandedDay((cur: number | null) => (cur === index ? null : index)),
    [setExpandedDay, index],
  );
  const toggleExercise = useCallback(
    (i: number) =>
      setExpandedExercise((cur: string | null) => (cur === `${index}-${i}` ? null : `${index}-${i}`)),
    [setExpandedExercise, index],
  );
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${expanded ? BORDER_ACTIVE : BORDER}` }}>
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: GREEN_DIM, color: GREEN, fontFamily: FONT }}>
            D{day.day_number || index + 1}
          </div>
          <div className="text-left">
            <p className="text-[12px] font-bold" style={{ color: TEXT }}>{day.session_title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {day.estimated_duration && (
                <span className="text-[9px] flex items-center gap-0.5" style={{ color: TEXT_MUTED }}>
                  <Clock className="w-2.5 h-2.5" />{day.estimated_duration}
                </span>
              )}
              {muscleTags.map((m: string, i: number) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: GREEN_DIM, color: GREEN }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" style={{ color: TEXT_MUTED }} /> : <ChevronDown className="w-4 h-4" style={{ color: TEXT_MUTED }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="px-4 pb-4 space-y-3">
              {/* Perfis de Resistência */}
              <SessionProfilePanel exercises={day.exercises || []} />
              {/* Supercompensação por grupo muscular */}
              <SupercompPanel athleteId={athleteId} muscleGroups={muscleTags} />
              {/* Repeated Bout Effect — alerta de adaptação */}
              <RBEPanel
                athleteId={athleteId}
                exercises={(day.exercises || []).map((e: any) => ({ name: e?.name ?? e?.nome ?? "" }))}
                mesoStart={(() => { const d = new Date(); d.setDate(d.getDate() - 28); return d.toISOString(); })()}
              />
              {/* Ondulação de Zonas de Repetição */}
              {(() => {
                const pattern = WAVE_PATTERNS[DEFAULT_PATTERN_KEY];
                const weekNum = 1;
                const weekZones = getWeekZones(weekNum, pattern);
                return (
                  <SessionZonePanel
                    exercises={day.exercises || []}
                    weekZones={weekZones}
                    patternName={pattern.nome}
                  />
                );
              })()}
              {/* Cobertura Regional (Hipertrofia Regional) */}
              <RegionalCoveragePanel
                exercises={(day.exercises || []).map((e: any) => ({ nome: e?.name ?? e?.nome ?? "" }))}
              />
              {/* Warm-up específico por grupamento muscular do dia */}
              <SmartWarmup exercises={day.exercises || []} dayKey={day.day_number ?? index} groupings={muscleTags} />


              {/* Exercises */}
              {day.exercises?.map((ex: any, i: number) => (
                <ExerciseCard
                  key={i}
                  exercise={ex}
                  displayOrder={i + 1}
                  expanded={expandedExercise === `${index}-${i}`}
                  onToggle={() => toggleExercise(i)}
                  weekPhase={weekPhase}
                  athleteId={athleteId}
                  protocolId={protocolId}
                  dayNumber={day.day_number || index + 1}
                />
              ))}

              {/* Session Notes */}
              {day.session_notes && (
                <div className="rounded-xl p-3" style={{ background: "rgba(74,222,128,0.04)", borderLeft: `3px solid ${GREEN}` }}>
                  <span className="text-[9px] font-bold" style={{ color: GREEN }}>📝 NOTA DA SESSÃO</span>
                  <p className="text-[11px] mt-1" style={{ color: TEXT_DIM }}>{day.session_notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ── Exercise Card ── */
const hasMeaningfulValue = (value: unknown) => {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "undefined" && normalized !== "null";
};

const sanitizeRenderedText = (value: unknown, fallback: string) => {
  if (!hasMeaningfulValue(value)) return fallback;

  const cleaned = String(value)
    .replace(/\bundefined\b/gi, "")
    .replace(/\bnull\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || fallback;
};

const formatSetLabel = (sets: unknown, fallback: string) => (
  hasMeaningfulValue(sets) ? `${sanitizeRenderedText(sets, "")} séries` : fallback
);

const formatEffort = (data: { rpe?: unknown; rir?: unknown }, fallback = "intensidade guiada") => {
  if (hasMeaningfulValue(data.rpe)) return `RPE ${sanitizeRenderedText(data.rpe, "")}`;
  if (hasMeaningfulValue(data.rir)) return `RIR ${sanitizeRenderedText(data.rir, "")}`;
  return fallback;
};

const joinDefinedParts = (parts: Array<string | false | null | undefined>, separator = " • ") => (
  parts.filter(Boolean).join(separator)
);

const ExerciseCard = memo(function ExerciseCard({
  exercise,
  displayOrder,
  expanded,
  onToggle,
  weekPhase,
  athleteId,
  protocolId,
  dayNumber,
}: {
  exercise: any;
  displayOrder?: number;
  expanded: boolean;
  onToggle: () => void;
  weekPhase?: WeekPhase | null;
  athleteId?: string | null;
  protocolId?: string | null;
  dayNumber?: number;
}) {
  const [showSubs, setShowSubs] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const [swapHistory, setSwapHistory] = useState<string[]>([]);

  const baseStruct = currentExercise.structure || {};
  const struct = weekPhase ? applyWeekProgression(baseStruct, weekPhase) : baseStruct;
  const hasTopSet = !!struct.top_set;
  const safeExerciseName = sanitizeRenderedText(currentExercise.name, "Exercício prescrito");
  const safeMuscleTarget = sanitizeRenderedText(currentExercise.muscle_target, "Alvo muscular ajustado");
  const safeExecutionCues = hasMeaningfulValue(currentExercise.execution_cues)
    ? sanitizeRenderedText(currentExercise.execution_cues, "Execução guiada pelo coach.")
    : "";
  const safeWhyThisExercise = hasMeaningfulValue(currentExercise.why_this_exercise)
    ? sanitizeRenderedText(currentExercise.why_this_exercise, "Escolha técnica ajustada ao bloco.")
    : "";
  const substitutes = currentExercise.substitutes || exercise.substitutes || [];
  const isSwapped = swapHistory.length > 0;

  const handleSwap = (sub: any) => {
    setSwapHistory(prev => [...prev, currentExercise.name]);
    setCurrentExercise({
      ...currentExercise,
      name: sub.name,
      why_this_exercise: sub.reason,
      execution_cues: `Substituto para: ${swapHistory.length > 0 ? swapHistory[0] : exercise.name}. Equipamento: ${sub.equipment}.`,
    });
    setShowSubs(false);
    toast.success(`Exercício trocado para ${sub.name}`);
  };

  const handleRevert = () => {
    setCurrentExercise(exercise);
    setSwapHistory([]);
    toast.success("Exercício original restaurado");
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: SURFACE2, border: `1px solid ${isSwapped ? "rgba(59,130,246,0.3)" : BORDER}` }}>
      <button onClick={onToggle} className="w-full p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ background: GREEN_DIM, color: GREEN }}>{displayOrder ?? exercise.order}</div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[11px] font-bold" style={{ color: TEXT }}>{safeExerciseName}</p>
              {isSwapped && (
                <span className="text-[7px] px-1 py-0.5 rounded font-bold" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>SUBSTITUTO</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <p className="text-[9px]" style={{ color: TEXT_MUTED }}>{safeMuscleTarget}</p>
              <ResistanceProfileBadge exerciseName={safeExerciseName} />
              <MuscleRegionBadge exerciseName={safeExerciseName} />
              {(() => {
                const weekRIR = weekPhase ? calcWeekRIR(weekPhase.week, 16) : 2;
                const effectiveRIR = resolveRIRForExercise(safeExerciseName, weekRIR);
                const repsValue = exercise?.reps ?? exercise?.sets_reps ?? exercise?.work_sets?.reps ?? "10";
                return (
                  <>
                    <RepZoneBadge reps={repsValue} compact />
                    <RIRBadge exerciseName={safeExerciseName} rir={effectiveRIR} showIntensity={false} />
                    <TripleCoherenceMarker exerciseName={safeExerciseName} reps={repsValue} rir={effectiveRIR} />
                    {athleteId && (
                      <ExerciseRBEBadge
                        athleteId={athleteId}
                        exerciseName={safeExerciseName}
                        mesoStart={(() => { const d = new Date(); d.setDate(d.getDate() - 28); return d.toISOString(); })()}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {hasTopSet && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>TOP SET</span>}
          {substitutes.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setShowSubs(!showSubs); }}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
              title="Ver exercícios substitutos">
              <RotateCcw className="w-3 h-3" style={{ color: "#60a5fa" }} />
            </button>
          )}
          {expanded ? <ChevronUp className="w-3 h-3" style={{ color: TEXT_MUTED }} /> : <ChevronDown className="w-3 h-3" style={{ color: TEXT_MUTED }} />}
        </div>
      </button>

      {/* Substitutes Panel */}
      <AnimatePresence>
        {showSubs && substitutes.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-3 pb-2 space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#60a5fa" }}>
                  🔄 EXERCÍCIOS SUBSTITUTOS
                </span>
                {isSwapped && (
                  <button onClick={handleRevert} className="text-[9px] font-semibold px-2 py-1 rounded-lg" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                    ↩ Original
                  </button>
                )}
              </div>
              {substitutes.map((sub: any, i: number) => (
                <button key={i} onClick={() => handleSwap(sub)}
                  className="w-full text-left rounded-lg p-2.5 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold" style={{ color: TEXT }}>{sub.name}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: TEXT_DIM }}>{sub.reason}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
                        {sub.equipment}
                      </span>
                      <ChevronRight className="w-3 h-3" style={{ color: "#60a5fa" }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="px-3 pb-3 space-y-2">
              {/* Tracker — séries marcáveis */}
              <SetTrackerBlock
                exerciseId={(currentExercise.id || currentExercise.name || `ex-${displayOrder ?? 0}`).toString().toLowerCase().replace(/\s+/g, "-").slice(0, 80)}
                struct={struct}
              />

              {/* Feeder Sets */}
              {struct.feeder_sets?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: "#818cf8" }}>FEEDER SETS</span>
                  {struct.feeder_sets.map((f: any, i: number) => (
                    <SetRow
                      key={i}
                      label={sanitizeRenderedText(f.set_label, `Feeder ${i + 1}`)}
                      detail={joinDefinedParts([
                        hasMeaningfulValue(f.load_percent) ? sanitizeRenderedText(f.load_percent, "") : "carga guiada",
                        hasMeaningfulValue(f.reps) ? sanitizeRenderedText(f.reps, "") : "reps ajustadas",
                      ], " × ")}
                      note={f.notes}
                      color="#818cf8"
                    />
                  ))}
                </div>
              )}

              {/* Top Set */}
              {struct.top_set && (
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: "#f97316" }}>TOP SET</span>
                  <SetRow
                    label="Top Set"
                    detail={joinDefinedParts([
                      `${sanitizeRenderedText(struct.top_set.sets, "1")}×${sanitizeRenderedText(struct.top_set.reps, "6-10")}`,
                      formatEffort(struct.top_set, "esforço principal guiado"),
                    ], " ")}
                    note={struct.top_set.notes}
                    color="#f97316"
                    rest={struct.top_set.rest}
                  />
                </div>
              )}

              {/* Back-off Sets */}
              {struct.backoff_sets && (
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: "#fbbf24" }}>BACK-OFF SETS</span>
                  <SetRow
                    label={formatSetLabel(struct.backoff_sets.sets, "Back-off ajustado")}
                    detail={joinDefinedParts([
                      hasMeaningfulValue(struct.backoff_sets.reps) ? sanitizeRenderedText(struct.backoff_sets.reps, "") : "faixa ajustada",
                      hasMeaningfulValue(struct.backoff_sets.load_reduction)
                        ? `(${sanitizeRenderedText(struct.backoff_sets.load_reduction, "")})`
                        : "redução guiada",
                    ], " ")}
                    note={struct.backoff_sets.notes}
                    color="#fbbf24"
                    rest={struct.backoff_sets.rest}
                  />
                </div>
              )}

              {/* Work Sets */}
              {struct.work_sets && (
                <div>
                  <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>SÉRIES DE TRABALHO</span>
                  <SetRow
                    label={formatSetLabel(struct.work_sets.sets, "Séries autoajustadas")}
                    detail={joinDefinedParts([
                      hasMeaningfulValue(struct.work_sets.reps) ? sanitizeRenderedText(struct.work_sets.reps, "") : "faixa de reps ajustada",
                      formatEffort(struct.work_sets),
                    ])}
                    note={struct.work_sets.notes}
                    color={GREEN}
                    rest={struct.work_sets.rest}
                  />
                </div>
              )}

              {/* Chip da semana atual */}
              {weekPhase && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="text-[8px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: weekPhase.bg, color: weekPhase.color, border: `1px solid ${weekPhase.color}40` }}
                  >
                    SEMANA {weekPhase.week} — {weekPhase.phase}
                  </span>
                  {weekPhase.isDeload && (
                    <span className="text-[9px]" style={{ color: TEXT_MUTED }}>
                      Foco em técnica e mobilidade · sem falha
                    </span>
                  )}
                </div>
              )}

              {/* Registro de carga */}
              {weekPhase && athleteId && (
                <ExerciseLogPanel
                  athleteId={athleteId}
                  protocolId={protocolId || null}
                  exerciseName={safeExerciseName}
                  weekNumber={weekPhase.week}
                  dayNumber={dayNumber || 1}
                />
              )}

              {/* SMH Protocol — Sobrecarga no Alongado (perfil ALONGADO) */}
              <SMHPanel exerciseName={safeExerciseName} />

              {/* Execution Cues */}
              {safeExecutionCues && (
                <div className="rounded-lg p-2.5 mt-1" style={{ background: "rgba(74,222,128,0.04)" }}>
                  <span className="text-[8px] font-bold" style={{ color: GREEN }}>EXECUÇÃO</span>
                  <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{safeExecutionCues}</p>
                </div>
              )}

              {/* Why */}
              {safeWhyThisExercise && (
                <div className="rounded-lg p-2.5" style={{ background: "rgba(139,92,246,0.04)" }}>
                  <span className="text-[8px] font-bold" style={{ color: "#a78bfa" }}>POR QUE ESTE EXERCÍCIO?</span>
                  <p className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>{safeWhyThisExercise}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ── Set Row ── */
function SetRow({ label, detail, note, color, rest }: { label: string; detail: string; note?: string; color: string; rest?: string }) {
  const safeLabel = sanitizeRenderedText(label, "Estrutura ajustada");
  const safeDetail = sanitizeRenderedText(detail, "Parâmetros autoajustados");
  const safeNote = hasMeaningfulValue(note) ? sanitizeRenderedText(note, "") : "";
  const safeRest = hasMeaningfulValue(rest) ? sanitizeRenderedText(rest, "") : "";

  return (
    <div className="rounded-lg p-2" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{ color }}>{safeLabel}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold" style={{ color: TEXT }}>{safeDetail}</span>
          {safeRest && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${color}10`, color: TEXT_MUTED }}>⏱ {safeRest}</span>}
        </div>
      </div>
      {safeNote && <p className="text-[9px] mt-0.5" style={{ color: TEXT_MUTED }}>{safeNote}</p>}
    </div>
  );
}

/* ── Text Card ── */
function tryParseJson(raw: string): any | null {
  if (!raw) return null;
  let s = raw.trim();
  // strip ```json ... ``` fences anywhere in the string
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  if (!(s.startsWith("{") || s.startsWith("["))) {
    const m = s.match(/[{\[][\s\S]*[}\]]/);
    if (m) s = m[0];
  }
  if (!(s.startsWith("{") || s.startsWith("["))) return null;

  const attempts = [
    s,
    // truncate to last closing bracket
    (() => {
      const last = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
      return last > 0 ? s.slice(0, last + 1) : s;
    })(),
    // permissive: strip // and /* */ comments + trailing commas
    s
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:"'])\/\/[^\n]*/g, "$1")
      .replace(/,(\s*[}\]])/g, "$1"),
  ];
  for (const a of attempts) {
    try { const o = JSON.parse(a); if (o && typeof o === "object") return o; } catch {}
  }
  return null;
}

function humanizeKey(k: string) {
  return k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function JsonRender({ data, level = 0 }: { data: any; level?: number }) {
  if (data === null || data === undefined) return null;
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>{String(data)}</p>;
  }
  if (Array.isArray(data)) {
    const allPrimitive = data.every(d => typeof d !== "object" || d === null);
    if (allPrimitive) {
      return (
        <ul className="space-y-1">
          {data.map((v, i) => (
            <li key={i} className="text-[11px] ml-3" style={{ color: TEXT_DIM }}>• {String(v)}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="space-y-3">
        {data.map((v, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <JsonRender data={v} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }
  // object
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([k, v]) => {
        const HeadingTag = level === 0 ? "h3" : "h4";
        const headingSize = level === 0 ? "text-[13px]" : "text-[11px]";
        return (
          <div key={k} className="space-y-1.5">
            <HeadingTag className={`${headingSize} font-black uppercase tracking-wide`} style={{ color: GREEN, fontFamily: FONT }}>
              {humanizeKey(k)}
            </HeadingTag>
            <div className="ml-1">
              <JsonRender data={v} level={level + 1} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const safeTextContent = (raw: unknown): string => {
  if (!raw) return "";
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return "Conteúdo em formato inválido. Gere novamente esta seção.";
    }
    return raw;
  }
  console.warn("[safeTextContent] received non-string:", typeof raw);
  return "Conteúdo em formato inválido.";
};

function TextCard({ content }: { content: string }) {

  const parsed = tryParseJson(content);
  if (parsed) {
    return (
      <div className="rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <JsonRender data={parsed} />
      </div>
    );
  }
  const lines = content.split("\n");
  return (
    <div className="rounded-2xl p-4 space-y-1" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (/^#{1,3}\s/.test(t) || /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\d][A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\d\s:—–\-]{4,}$/.test(t)) {
          return <h3 key={i} className="text-[13px] font-black mt-4 mb-2" style={{ color: GREEN, fontFamily: FONT }}>{t.replace(/^#+\s*/, "")}</h3>;
        }
        if (t.startsWith("- ") || t.startsWith("• ")) return <p key={i} className="text-[11px] ml-3 mb-0.5" style={{ color: TEXT_DIM }}>• {t.slice(2)}</p>;
        if (/^\d+\./.test(t)) return <p key={i} className="text-[11px] ml-3 mb-0.5" style={{ color: TEXT_DIM }}>{t}</p>;
        if (t.includes("|")) {
          const cells = t.split("|").map(c => c.trim()).filter(Boolean);
          if (cells.every(c => /^[-:]+$/.test(c))) return null;
          return (
            <div key={i} className="grid gap-1 text-[10px] mb-0.5" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)`, color: TEXT_DIM }}>
              {cells.map((c, ci) => <div key={ci} className="px-1 py-0.5" style={{ borderBottom: `1px solid ${BORDER}` }}>{c}</div>)}
            </div>
          );
        }
        return <p key={i} className="text-[11px] mb-0.5 leading-relaxed" style={{ color: TEXT_DIM }}>{t}</p>;
      })}
    </div>
  );
}

/* ── Loading State ── */
function LoadingState() {
  return (
    <div className="space-y-4 py-4">
      <div className="rounded-2xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GREEN_DIM }}>
            <Brain className="w-4 h-4 animate-pulse" style={{ color: GREEN }} />
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: TEXT }}>Analisando perfil e montando protocolo...</p>
            <p className="text-[9px]" style={{ color: TEXT_MUTED }}>Dual-AI: Perplexity + Gemini processando</p>
          </div>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: `${GREEN}15` }}>
          <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-full w-1/3 rounded-full" style={{ background: GREEN }} />
        </div>
        <div className="space-y-2 mt-4">
          {[85, 70, 55, 90, 60, 75, 45].map((w, i) => (
            <div key={i} className="h-3 rounded animate-pulse" style={{ background: `${GREEN}08`, width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MiniStat ── */
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-center mb-1" style={{ color: GREEN }}>{icon}</div>
      <p className="text-[9px]" style={{ color: TEXT_MUTED }}>{label}</p>
      <p className="text-[11px] font-black" style={{ color: TEXT, fontFamily: FONT }}>{value}</p>
    </div>
  );
}

/* ── Step Header ── */
function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: GREEN, color: BG }}>{step}</div>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: FONT }}>{title}</p>
        <p className="text-[10px]" style={{ color: TEXT_MUTED }}>{subtitle}</p>
      </div>
      <span className="text-[10px] font-medium" style={{ color: TEXT_MUTED }}>{step}/{total}</span>
    </div>
  );
}

/* ================================================================
   SECTION 2 — PROGRESSION (kept similar, refined style)
   ================================================================ */
function ProgressionSection({ userId }: { userId?: string }) {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [progress, setProgress] = useState<any[]>([]);
  const [weekNumber, setWeekNumber] = useState("1");
  const [exercise, setExercise] = useState("");
  const [setsDone, setSetsDone] = useState("");
  const [repsDone, setRepsDone] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [rpeReal, setRpeReal] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!userId) return;
    supabase.from("training_protocols").select("id, client_name, phase, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setProtocols(data || []));
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedProtocol) return;
    supabase.from("training_progress").select("*").eq("user_id", userId).eq("protocol_id", selectedProtocol).order("logged_at", { ascending: true })
      .then(({ data }) => setProgress(data || []));
  }, [userId, selectedProtocol]);

  const logProgress = async () => {
    if (!userId || !selectedProtocol || !exercise) { toast.error("Preencha os campos"); return; }
    const { error } = await supabase.from("training_progress").insert({
      user_id: userId, protocol_id: selectedProtocol,
      client_name: protocols.find(p => p.id === selectedProtocol)?.client_name || "",
      week_number: parseInt(weekNumber), exercise,
      sets_done: parseInt(setsDone) || null, reps_done: parseInt(repsDone) || null,
      weight_kg: parseFloat(weightKg) || null, rpe_real: parseFloat(rpeReal) || null, notes,
    });
    if (error) toast.error("Erro ao salvar");
    else {
      toast.success("Progressão registrada!");
      setExercise(""); setSetsDone(""); setRepsDone(""); setWeightKg(""); setRpeReal(""); setNotes("");
      supabase.from("training_progress").select("*").eq("user_id", userId).eq("protocol_id", selectedProtocol).order("logged_at", { ascending: true })
        .then(({ data }) => setProgress(data || []));
    }
  };

  const chartData = useMemo(() => {
    if (!exercise) return [];
    return progress.filter(p => p.exercise === exercise).map(p => ({ semana: `S${p.week_number}`, carga: p.weight_kg }));
  }, [progress, exercise]);

  const suggestion = useMemo(() => {
    const exProgress = progress.filter(p => p.exercise === exercise);
    if (exProgress.length < 2) return null;
    const last = exProgress[exProgress.length - 1];
    const prev = exProgress[exProgress.length - 2];
    if (last.rpe_real && last.rpe_real <= 8 && last.reps_done >= (prev.reps_done || 0)) return { type: "up", text: `RPE ${last.rpe_real} — Aumente 2.5kg na próxima sessão (dupla progressão)` };
    if (last.rpe_real && last.rpe_real > 9) return { type: "down", text: `RPE ${last.rpe_real} — Considere reduzir volume ou programar deload` };
    if (last.weight_kg === prev.weight_kg) return { type: "stag", text: "Carga estagnada por 2 sessões — considere variar estímulo" };
    return { type: "ok", text: "Progressão normal — mantenha a carga atual" };
  }, [progress, exercise]);

  return (
    <div className="space-y-4 mt-3">
      <Field label="Selecionar protocolo">
        <StyledSelect value={selectedProtocol} onValueChange={setSelectedProtocol} placeholder="Escolha um protocolo"
          options={protocols.map(p => ({ value: p.id, label: `${p.client_name} — ${p.phase}` }))} />
      </Field>

      {selectedProtocol && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Semana">
              <StyledSelect value={weekNumber} onValueChange={setWeekNumber} options={Array.from({ length: 16 }, (_, i) => ({ value: String(i + 1), label: `Semana ${i + 1}` }))} />
            </Field>
            <Field label="Exercício">
              <Input value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Ex: Supino Reto" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Field label="Séries"><Input value={setsDone} onChange={e => setSetsDone(e.target.value)} type="number" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} /></Field>
            <Field label="Reps"><Input value={repsDone} onChange={e => setRepsDone(e.target.value)} type="number" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} /></Field>
            <Field label="Carga"><Input value={weightKg} onChange={e => setWeightKg(e.target.value)} type="number" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} /></Field>
            <Field label="RPE"><Input value={rpeReal} onChange={e => setRpeReal(e.target.value)} type="number" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} /></Field>
          </div>
          <Button onClick={logProgress} className="w-full font-bold text-sm h-11 rounded-xl" style={{ background: GREEN, color: BG }}>Registrar Progressão</Button>

          {suggestion && (
            <div className="rounded-xl p-3" style={{
              background: suggestion.type === "up" ? "rgba(74,222,128,0.06)" : suggestion.type === "stag" ? "rgba(251,191,36,0.06)" : suggestion.type === "down" ? "rgba(239,68,68,0.06)" : SURFACE,
              border: `1px solid ${suggestion.type === "up" ? "rgba(74,222,128,0.2)" : suggestion.type === "stag" ? "rgba(251,191,36,0.2)" : suggestion.type === "down" ? "rgba(239,68,68,0.2)" : BORDER}`,
            }}>
              <p className="text-[11px] font-semibold" style={{ color: suggestion.type === "up" ? GREEN : suggestion.type === "stag" ? "#fbbf24" : suggestion.type === "down" ? "#ef4444" : TEXT_DIM }}>
                {suggestion.type === "up" ? "📈" : suggestion.type === "stag" ? "⚠️" : suggestion.type === "down" ? "🔻" : "✓"} {suggestion.text}
              </p>
            </div>
          )}

          {chartData.length > 1 && (
            <div className="rounded-xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p className="text-[11px] font-bold mb-2" style={{ color: TEXT }}>Evolução: {exercise}</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="semana" tick={{ fill: TEXT_MUTED, fontSize: 10 }} />
                  <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: BG, border: `1px solid ${BORDER_ACTIVE}`, borderRadius: 10, color: TEXT, fontSize: 11 }} />
                  <Line type="monotone" dataKey="carga" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================================================================
   SECTION 3 — VOLUME LANDMARKS
   ================================================================ */
function VolumeLandmarksSection({ userId }: { userId?: string }) {
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [currentSets, setCurrentSets] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("intermediate");
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const landmark = VOLUME_LANDMARKS.find(v => v.muscle === selectedMuscle);
  const levelData = landmark ? landmark[selectedLevel as keyof typeof landmark] as { mev: number; mav: number; mrv: number } : null;
  const sets = parseInt(currentSets) || 0;

  const getZone = () => {
    if (!levelData || !sets) return null;
    if (sets < levelData.mev) return { label: "Abaixo do MEV", color: "#6b7280", desc: "Volume insuficiente" };
    if (sets <= levelData.mav) return { label: "Zona de Crescimento", color: GREEN, desc: "Volume ideal" };
    if (sets <= levelData.mrv) return { label: "Zona de Atenção", color: "#fbbf24", desc: "Planeje deload" };
    return { label: "Acima do MRV", color: "#ef4444", desc: "Risco de overtraining" };
  };

  const zone = getZone();
  const barPercent = levelData ? Math.min((sets / levelData.mrv) * 100, 120) : 0;

  const analyzeVolume = async () => {
    if (!userId || !selectedMuscle) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-protocol", {
        body: { muscles: [selectedMuscle], level: selectedLevel, currentSets: sets, tab: "volume" },
      });
      if (error) throw error;
      setAnalysis(data.content);
    } catch { toast.error("Erro na análise"); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="space-y-4 mt-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Músculo">
          <StyledSelect value={selectedMuscle} onValueChange={setSelectedMuscle} placeholder="Selecione" options={VOLUME_LANDMARKS.map(v => ({ value: v.muscle, label: v.muscle }))} />
        </Field>
        <Field label="Nível">
          <StyledSelect value={selectedLevel} onValueChange={setSelectedLevel} options={[
            { value: "beginner", label: "Iniciante" }, { value: "intermediate", label: "Intermediário" }, { value: "advanced", label: "Avançado" },
          ]} />
        </Field>
      </div>

      {levelData && (
        <div className="rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between text-[10px] mb-3" style={{ color: TEXT_DIM }}>
            <span>MEV: <b style={{ color: GREEN }}>{levelData.mev}</b></span>
            <span>MAV: <b style={{ color: GREEN }}>{levelData.mav}</b></span>
            <span>MRV: <b style={{ color: "#fbbf24" }}>{levelData.mrv}</b></span>
          </div>

          <Field label="Séries atuais por semana">
            <Input value={currentSets} onChange={e => setCurrentSets(e.target.value)} type="number" placeholder="Ex: 14" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
          </Field>

          {sets > 0 && (
            <>
              <div className="mt-3 relative h-5 rounded-full overflow-hidden" style={{ background: `${GREEN}08` }}>
                <div className="absolute h-full rounded-full transition-all" style={{ width: `${Math.min(barPercent, 100)}%`, background: zone?.color || GREEN, opacity: 0.4 }} />
                <div className="absolute top-0 h-full w-0.5" style={{ left: `${Math.min(barPercent, 100)}%`, background: zone?.color }} />
              </div>
              {zone && (
                <div className="mt-2 rounded-xl p-2.5" style={{ background: `${zone.color}10`, border: `1px solid ${zone.color}20` }}>
                  <p className="text-[11px] font-bold" style={{ color: zone.color }}>{zone.label}</p>
                  <p className="text-[10px]" style={{ color: TEXT_MUTED }}>{zone.desc}</p>
                </div>
              )}
            </>
          )}

          <Button onClick={analyzeVolume} disabled={analyzing || !sets} className="w-full mt-3 text-xs font-bold h-10 rounded-xl" style={{ background: GREEN, color: BG }}>
            {analyzing? "Analisando..." : "🔬 Analisar "}
          </Button>

          {analysis && (
            <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(74,222,128,0.04)", borderLeft: `3px solid ${GREEN}` }}>
              <p className="text-[11px] whitespace-pre-wrap" style={{ color: TEXT_DIM }}>{analysis}</p>
            </div>
          )}
        </div>
      )}

      {/* Reference Table */}
      <div className="rounded-2xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <p className="text-[11px] font-bold mb-2" style={{ color: TEXT }}>📊 Referência de Volume (séries/sem)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]" style={{ color: TEXT_MUTED }}>
            <thead><tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              <th className="text-left py-1 pr-2" style={{ color: TEXT }}>Músculo</th>
              <th className="text-center py-1">Ini</th><th className="text-center py-1">Int</th><th className="text-center py-1">Ava</th>
            </tr></thead>
            <tbody>{VOLUME_LANDMARKS.map(v => (
              <tr key={v.muscle} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="py-1 pr-2" style={{ color: TEXT_DIM }}>{v.muscle}</td>
                <td className="text-center py-1">{v.beginner.mev}/{v.beginner.mav}/{v.beginner.mrv}</td>
                <td className="text-center py-1">{v.intermediate.mev}/{v.intermediate.mav}/{v.intermediate.mrv}</td>
                <td className="text-center py-1">{v.advanced.mev}/{v.advanced.mav}/{v.advanced.mrv}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SECTION 4 — HISTORY
   ================================================================ */

/** Cache de protocolos completos (persiste entre trocas de aba/remontagens). */
const protocolFullCache = new Map<string, any>();

function HistorySkeletonCard() {
  return (
    <div className="rounded-xl p-3 animate-pulse" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 rounded w-1/3" style={{ background: SURFACE2 }} />
        <div className="h-3 rounded w-16" style={{ background: SURFACE2 }} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2.5 rounded w-16" style={{ background: SURFACE2 }} />
        <div className="h-2.5 rounded w-10" style={{ background: SURFACE2 }} />
      </div>
      <div className="h-7 rounded-lg w-full" style={{ background: SURFACE2 }} />
    </div>
  );
}

function HistorySection({ userId }: { userId?: string }) {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadProtocols = useCallback(() => {
    if (!userId) return;
    setLoadingList(true);
    supabase.from("training_protocols")
      .select("id, client_name, phase, level, weeks, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setProtocols(data || []); setLoadingList(false); });
  }, [userId]);

  /** Busca (com cache) o conteúdo completo de um protocolo. */
  const fetchFull = useCallback(async (id: string) => {
    const cached = protocolFullCache.get(id);
    if (cached) return cached;
    const { data, error } = await supabase.from("training_protocols").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    protocolFullCache.set(id, data);
    return data;
  }, []);

  // Pré-carrega em segundo plano ao passar o mouse / tocar no card
  const prefetchProtocol = useCallback((id: string) => {
    if (protocolFullCache.has(id)) return;
    fetchFull(id);
  }, [fetchFull]);

  // Conteúdo completo só é buscado ao abrir um protocolo específico (cacheado)
  const openProtocol = useCallback(async (id: string) => {
    const cached = protocolFullCache.get(id);
    if (cached) { setViewModal(cached); return; }
    setLoadingId(id);
    const data = await fetchFull(id);
    setLoadingId(null);
    if (!data) { toast.error("Erro ao carregar protocolo"); return; }
    setViewModal(data);
  }, [fetchFull]);

  useEffect(() => { loadProtocols(); }, [loadProtocols]);

  const deleteProtocol = async (id: string) => {
    const { error } = await supabase.from("training_protocols").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Protocolo excluído");
      protocolFullCache.delete(id);
      setProtocols(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
    }
  };


  const filtered = protocols.filter(p => p.client_name?.toLowerCase().includes(search.toLowerCase()) || p.phase?.toLowerCase().includes(search.toLowerCase()));
  const phaseColor: Record<string, string> = { bulking: GREEN, cutting: "#ef4444", manutencao: "#3b82f6", recomposicao: "#8b5cf6", emagrecimento: "#f97316", performance: "#fbbf24" };

  return (
    <div className="space-y-3 mt-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: TEXT_MUTED }} />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm pl-9" style={{ borderColor: BORDER, color: TEXT }} />
      </div>

      {loadingList ? (
        <>
          <HistorySkeletonCard />
          <HistorySkeletonCard />
          <HistorySkeletonCard />
        </>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: TEXT_MUTED }}>Nenhum protocolo encontrado</p>
      ) : filtered.map(p => (
        <div
          key={p.id}
          className="rounded-xl p-3"
          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          onMouseEnter={() => prefetchProtocol(p.id)}
          onTouchStart={() => prefetchProtocol(p.id)}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold" style={{ color: TEXT }}>{p.client_name}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${phaseColor[p.phase] || GREEN}15`, color: phaseColor[p.phase] || GREEN }}>
              {PHASES.find(ph => ph.id === p.phase)?.name || p.phase}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px]" style={{ color: TEXT_MUTED }}>{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
            {p.weeks && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: GREEN_DIM, color: GREEN }}>{p.weeks} sem</span>}
            {p.level && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: SURFACE2, color: TEXT_MUTED }}>{p.level}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => openProtocol(p.id)} disabled={loadingId === p.id} className="flex-1 text-[10px] py-2 rounded-lg font-semibold text-center disabled:opacity-60 flex items-center justify-center gap-1" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER}` }}>
              {loadingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
              {loadingId === p.id ? "Carregando..." : "Ver Treino"}
            </button>
            {confirmDelete === p.id ? (
              <>
                <button onClick={() => deleteProtocol(p.id)} className="text-[10px] px-3 py-2 rounded-lg font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  Confirmar
                </button>
                <button onClick={() => setConfirmDelete(null)} className="text-[10px] px-2 py-2 rounded-lg" style={{ background: SURFACE2, color: TEXT_MUTED }}>
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(p.id)} className="text-[10px] px-2.5 py-2 rounded-lg font-semibold" style={{ background: "rgba(239,68,68,0.06)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.1)" }}>
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {viewModal && (
          <HistoryViewModal
            protocol={viewModal}
            onClose={() => setViewModal(null)}
            userId={userId}
            onUpdate={(patch?: any) => {
              // Mantém o cache coerente após edições (ex.: renomear cliente)
              if (patch && typeof patch === "object") {
                const merged = { ...viewModal, ...patch };
                protocolFullCache.set(viewModal.id, merged);
                setViewModal(merged);
              } else {
                protocolFullCache.delete(viewModal.id);
              }
              loadProtocols();
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/* ── History View Modal ── */
function HistoryViewModal({ protocol: p, onClose, userId, onUpdate }: { protocol: any; onClose: () => void; userId?: string; onUpdate?: (patch?: any) => void }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(p.client_name || "");

  const { json: parsed, markdown: rawMarkdown } = parseProtocolText(p.protocol_text);

  // ── Mello 16 wk navigator (apenas se 16 semanas + bulking) ──
  const isMello16 = String(p.weeks) === "16" && String(p.phase || "").toLowerCase().includes("bulk");
  const initialWeek = (typeof p.last_viewed_week === "number" && p.last_viewed_week >= 1 && p.last_viewed_week <= 16) ? p.last_viewed_week : undefined;
  const [weekPhase, setWeekPhase] = useState<WeekPhase>(WEEK_PLAN[(initialWeek ?? 1) - 1]);
  const [weekSummaries, setWeekSummaries] = useState<Record<number, { count: number; avgTop: number | null; avgRpe: number | null }>>({});

  // Carrega resumos por semana (workout_logs) para exibir badges "Concluída"
  useEffect(() => {
    if (!isMello16 || !p.id) return;
    (async () => {
      const { data } = await (supabase.from as any)("workout_logs")
        .select("week_number, top_set_kg, rpe_felt")
        .eq("protocol_id", p.id);
      if (!data) return;
      const map: Record<number, { count: number; sumTop: number; sumRpe: number; nTop: number; nRpe: number }> = {};
      for (const r of data as any[]) {
        const w = Number(r.week_number);
        if (!w) continue;
        if (!map[w]) map[w] = { count: 0, sumTop: 0, sumRpe: 0, nTop: 0, nRpe: 0 };
        map[w].count++;
        if (typeof r.top_set_kg === "number") { map[w].sumTop += r.top_set_kg; map[w].nTop++; }
        if (typeof r.rpe_felt === "number") { map[w].sumRpe += r.rpe_felt; map[w].nRpe++; }
      }
      const summary: Record<number, { count: number; avgTop: number | null; avgRpe: number | null }> = {};
      Object.entries(map).forEach(([w, v]) => {
        summary[Number(w)] = {
          count: v.count,
          avgTop: v.nTop ? v.sumTop / v.nTop : null,
          avgRpe: v.nRpe ? v.sumRpe / v.nRpe : null,
        };
      });
      setWeekSummaries(summary);
    })();
  }, [isMello16, p.id]);

  // Persiste última semana visualizada
  const handleWeekChange = useCallback((wp: WeekPhase) => {
    setWeekPhase(wp);
    if (isMello16 && p.id) {
      (supabase.from("training_protocols") as any).update({ last_viewed_week: wp.week }).eq("id", p.id).then(() => {});
    }
  }, [isMello16, p.id]);

  const updateProtocol = async () => {
    const { error } = await supabase.from("training_protocols").update({ client_name: editName }).eq("id", p.id);
    if (error) toast.error("Erro ao atualizar");
    else { toast.success("Atualizado!"); setEditing(false); onUpdate?.({ client_name: editName }); }
  };

  const saveToNotebook = async () => {
    if (!userId) return;
    await supabase.from("lab_saved_items").insert({
      user_id: userId,
      tipo: "protocolo_treino",
      titulo: `Protocolo: ${p.client_name} — ${PHASES.find((ph: any) => ph.id === p.phase)?.name || p.phase}`,
      conteudo: { protocol: parsed || p.protocol_text, clientName: p.client_name, phase: p.phase },
      tags: ["training", p.phase],
    });
    toast.success("Salvo no caderno científico!");
  };

  const exportFormatted = () => {
    const lines: string[] = [];
    const ov = parsed?.block_overview;
    lines.push(`PROTOCOLO DE TREINO — ${p.client_name?.toUpperCase()}`);
    lines.push(`${p.phase} · ${p.weeks} semanas\n`);
    if (ov) {
      lines.push(ov.title || "");
      lines.push(`Divisão: ${ov.split_type || "—"}`);
      lines.push(`Duração: ${ov.duration_weeks} semanas`);
      if (ov.split_justification) lines.push(`\nJustificativa: ${ov.split_justification}`);
      if (ov.coach_notes) lines.push(`\nObservações: ${ov.coach_notes}`);
    }
    if (parsed?.training_days?.length) {
      parsed.training_days.forEach((day: any) => {
        lines.push(`\n${"─".repeat(40)}`);
        lines.push(`DIA ${day.day_number} — ${day.session_title}`);
        day.exercises?.forEach((ex: any, i: number) => {
          lines.push(`  ${i + 1}. ${ex.name} — ${ex.muscle_target}`);
          const s = ex.structure || {};
          if (s.top_set) lines.push(`     [TOP SET] ${s.top_set.sets}×${s.top_set.reps} RPE ${s.top_set.rpe}`);
          if (s.backoff_sets) lines.push(`     [BACK-OFF] ${s.backoff_sets.sets}×${s.backoff_sets.reps}`);
          if (s.work_sets) lines.push(`     [TRABALHO] ${s.work_sets.sets}×${s.work_sets.reps}`);
        });
      });
    } else if (rawMarkdown && !parsed) {
      lines.push(rawMarkdown);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `protocolo_${p.client_name?.replace(/\s+/g, "_")}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl max-h-[90vh] overflow-y-auto" style={{ background: BG, border: `1px solid ${BORDER_ACTIVE}` }}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 pt-5 pb-3" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-transparent text-sm h-8 flex-1" style={{ borderColor: BORDER_ACTIVE, color: TEXT }} />
                  <button onClick={updateProtocol} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GREEN_DIM }}><Check className="w-3 h-3" style={{ color: GREEN }} /></button>
                  <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: SURFACE2 }}><X className="w-3 h-3" style={{ color: TEXT_MUTED }} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black" style={{ color: TEXT, fontFamily: FONT }}>{p.client_name}</h3>
                  <button onClick={() => setEditing(true)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: SURFACE2 }}>
                    <Edit3 className="w-2.5 h-2.5" style={{ color: TEXT_MUTED }} />
                  </button>
                </div>
              )}
              <p className="text-[10px]" style={{ color: TEXT_MUTED }}>
                {PHASES.find((ph: any) => ph.id === p.phase)?.name || p.phase} · {p.weeks} sem · {new Date(p.created_at).toLocaleDateString("pt-BR")}
                {isMello16 && (
                  <> · <span style={{ color: weekPhase.color, fontWeight: 700 }}>Semana {weekPhase.week} de 16 — {weekPhase.label}</span></>
                )}
              </p>
            </div>
            <button onClick={onClose} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: SURFACE2, color: TEXT_MUTED }}>✕</button>
          </div>
          <div className="flex gap-1.5">
            <button onClick={saveToNotebook} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(139,92,246,0.08)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.15)" }}>
              <Bookmark className="w-2.5 h-2.5" /> Caderno
            </button>
            <button onClick={() => {
              if (parsed) {
                exportTrainingPDF(parsed, p.client_name || "Cliente", {
                  phase: PHASES.find((ph: any) => ph.id === p.phase)?.name || p.phase,
                  level: p.level || "",
                  weeks: p.weeks || "",
                  days: p.days || "",
                });
                toast.success("PDF premium exportado!");
              } else {
                toast.error("Sem dados para exportar");
              }
            }} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
              <FileDown className="w-2.5 h-2.5" /> PDF
            </button>
            <button onClick={exportFormatted} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg font-semibold" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER}` }}>
              <Download className="w-2.5 h-2.5" /> TXT
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          {parsed?.block_overview ? (
            <>
              <BlockOverviewCard overview={parsed.block_overview} alerts={parsed.improvement_alerts} clientName={p.client_name} trainingDays={parsed.training_days} />
              {isMello16 && (
                <WeekNavigator
                  protocolKey={`history-${p.id}`}
                  initialWeek={initialWeek}
                  weekSummaries={weekSummaries}
                  onWeekChange={handleWeekChange}
                />
              )}
              {parsed.training_days?.map((day: any, idx: number) => (
                <TrainingDayCard key={idx} day={day} index={idx} expanded={expandedDay === idx} setExpandedDay={setExpandedDay}
                  expandedExercise={expandedExercise} setExpandedExercise={setExpandedExercise}
                  weekPhase={isMello16 ? weekPhase : null}
                  athleteId={userId}
                  protocolId={p.id} />
              ))}
            </>
          ) : rawMarkdown ? (
            <MarkdownProtocolView
              content={rawMarkdown}
              title={p.client_name || "Protocolo"}
            />
          ) : (
            <p className="text-xs text-center py-8" style={{ color: TEXT_MUTED }}>Sem dados do protocolo</p>
          )}

          {p.anatomy_text && (
            <div>
              <h4 className="text-[11px] font-bold mb-2" style={{ color: GREEN }}>📐 Anatomia</h4>
              <TextCard content={safeTextContent(p.anatomy_text)} />
            </div>
          )}
          {p.tecnica_text && (
            <div>
              <h4 className="text-[11px] font-bold mb-2" style={{ color: GREEN }}>🎯 Técnica</h4>
              <TextCard content={safeTextContent(p.tecnica_text)} />
            </div>
          )}
          {p.periodizacao_text && (
            <div>
              <h4 className="text-[11px] font-bold mb-2" style={{ color: GREEN }}>📊 Periodização</h4>
              <TextCard content={safeTextContent(p.periodizacao_text)} />

            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================
   SECTION 5 — COACH CONFIG
   ================================================================ */
function CoachConfigSection({ userId }: { userId?: string }) {
  const [coachName, setCoachName] = useState("");
  const [coachTitle, setCoachTitle] = useState("");
  const [coachCref, setCoachCref] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("coach_profiles").select("*").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCoachName(data.professional_name || "");
          setCoachTitle(data.bio || "");
          setCoachCref(data.crn || "");
        }
      });
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("coach_profiles").update({ professional_name: coachName, bio: coachTitle, crn: coachCref }).eq("user_id", userId);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Configurações salvas!");
    setSaving(false);
  };

  return (
    <div className="space-y-4 mt-3">
      <div className="rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: TEXT, fontFamily: FONT }}>⚙️ Configurações do Coach</h3>
        <div className="space-y-3">
          <Field label="Nome completo">
            <Input value={coachName} onChange={e => setCoachName(e.target.value)} placeholder="Seu nome" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
          </Field>
          <Field label="Título profissional">
            <Input value={coachTitle} onChange={e => setCoachTitle(e.target.value)} placeholder="Especialista em..." className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
          </Field>
          <Field label="CREF">
            <Input value={coachCref} onChange={e => setCoachCref(e.target.value)} placeholder="123456-G/RJ" className="bg-transparent text-sm" style={{ borderColor: BORDER, color: TEXT }} />
          </Field>
          <Button onClick={save} disabled={saving} className="w-full font-bold text-sm h-11 rounded-xl" style={{ background: GREEN, color: BG }}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl p-5 text-center" style={{ background: BG, border: `1px solid ${BORDER_ACTIVE}` }}>
        <p className="text-[10px] mb-2" style={{ color: TEXT_MUTED }}>Preview PDF</p>
        <div className="py-6 rounded-xl" style={{ background: SURFACE }}>
          <p className="text-lg font-black" style={{ color: GREEN, fontFamily: FONT }}>Training<span style={{ color: TEXT }}>ON</span></p>
          <p className="text-[11px] mt-2 font-bold tracking-wider uppercase" style={{ color: TEXT_DIM }}>Protocolo de Treino Científico</p>
          <p className="text-sm mt-2 font-bold" style={{ color: GREEN }}>{coachName || "Nome do Coach"}</p>
          <p className="text-[10px]" style={{ color: TEXT_MUTED }}>{coachTitle || "Título profissional"}</p>
          {coachCref && <p className="text-[10px]" style={{ color: TEXT_MUTED }}>CREF: {coachCref}</p>}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SHARED
   ================================================================ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold mb-1 block tracking-wide uppercase" style={{ color: TEXT_MUTED }}>{label}</label>
      {children}
    </div>
  );
}

function StyledSelect({ value, onValueChange, options, placeholder }: {
  value: string; onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-transparent text-sm h-10 rounded-xl" style={{ borderColor: BORDER, color: TEXT }}>
        <SelectValue placeholder={placeholder || "Selecione"} />
      </SelectTrigger>
      <SelectContent className="border rounded-xl" style={{ background: SURFACE2, borderColor: BORDER_ACTIVE }}>
        {options.map(o => (
          <SelectItem key={o.value} value={o.value} className="text-sm" style={{ color: TEXT }}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
