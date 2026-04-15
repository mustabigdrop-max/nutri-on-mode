import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Microscope, Scan, HeartPulse, BookOpen, TrendingDown,
} from "lucide-react";
import { exportTrainingPDF } from "@/lib/trainingPdfExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import BottomNav from "@/components/BottomNav";
import {
  PHASES, MUSCLES, LEVELS, WEEKS_OPTIONS, DAYS_OPTIONS,
  SESSION_DURATIONS, CARDIO_OPTIONS, STRESS_OPTIONS, EQUIPMENT_OPTIONS,
  VOLUME_LANDMARKS,
} from "@/data/trainingData";

type Section = "gerar" | "progressao" | "volume" | "historico" | "config";

const sectionNav: { id: Section; label: string; icon: any }[] = [
  { id: "gerar", label: "Prescrição", icon: Brain },
  { id: "progressao", label: "Progressão", icon: TrendingUp },
  { id: "volume", label: "Volume", icon: BarChart3 },
  { id: "historico", label: "Histórico", icon: History },
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
  const [section, setSection] = useState<Section>("gerar");

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <ArrowLeft className="w-4 h-4" style={{ color: TEXT_DIM }} />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,222,128,0.12)", border: `1px solid ${BORDER_ACTIVE}` }}>
            <Dumbbell className="w-5 h-5" style={{ color: GREEN }} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black tracking-tight" style={{ color: TEXT, fontFamily: FONT }}>
              Training<span style={{ color: GREEN }}>ON</span>
            </h1>
            <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: TEXT_MUTED }}>Motor de Prescrição de Elite</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: GREEN_DIM, border: `1px solid ${BORDER}` }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
            <span className="text-[9px] font-bold" style={{ color: GREEN }}>AI LIVE</span>
          </div>
        </div>

        {/* Section Nav */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sectionNav.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all"
              style={{
                background: section === s.id ? GREEN_DIM : "transparent",
                color: section === s.id ? GREEN : TEXT_MUTED,
                border: `1px solid ${section === s.id ? BORDER_ACTIVE : "transparent"}`,
              }}>
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {section === "gerar" && <EliteGenerateSection userId={user?.id} />}
            {section === "progressao" && <ProgressionSection userId={user?.id} />}
            {section === "volume" && <VolumeLandmarksSection userId={user?.id} />}
            {section === "historico" && <HistorySection userId={user?.id} />}
            {section === "config" && <CoachConfigSection userId={user?.id} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
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
  // Protocol
  const [phase, setPhase] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [weeks, setWeeks] = useState("8");
  const [days, setDays] = useState("5");
  const [clientName, setClientName] = useState("");
  // Results
  const [protocol, setProtocol] = useState<any>(null);
  const [textResults, setTextResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<string>("overview");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const toggleEquipment = (e: string) => setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  const toggleMuscle = (m: string) => setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const bodyData = useMemo(() => ({
    phase, muscles, level, weeks, days, clientName,
    equipment: equipment.join(", "), injuries, sessionDuration,
    stressLevel, supplements, weakPoints, specificGoal, cardio,
  }), [phase, muscles, level, weeks, days, clientName, equipment, injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio]);

  const generate = async () => {
    if (!phase || muscles.length === 0 || !level || !clientName) {
      toast.error("Preencha fase, músculos, nível e nome do cliente");
      return;
    }
    setLoading(true);
    setGenerated(true);
    setActiveResultTab("overview");
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-protocol", {
        body: { ...bodyData, tab: "protocolo" },
      });
      if (error) throw error;
      if (data.protocol) {
        setProtocol(data.protocol);
      } else if (data.content) {
        setTextResults(prev => ({ ...prev, protocolo: data.content }));
      }
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
      setGenerated(false);
    } finally {
      setLoading(false);
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
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
        setPatients(data.map(cp => ({
          ...cp,
          name: profiles?.find(pr => pr.user_id === cp.patient_user_id)?.full_name || "Sem nome",
        })));
      });
  }, [userId]);

  const saveProtocol = async (patientId?: string) => {
    if (!userId) return;
    const { error } = await supabase.from("training_protocols").insert({
      user_id: userId, client_name: clientName, phase, muscles, level, weeks,
      days_per_week: days, equipment: equipment.join(", "), injuries,
      session_duration: sessionDuration,
      protocol_text: protocol ? JSON.stringify(protocol) : textResults.protocolo || "",
      anatomy_text: textResults.anatomia || "",
      tecnica_text: textResults.tecnica || "",
      periodizacao_text: textResults.periodizacao || "",
      patient_user_id: patientId || null,
    });
    if (error) toast.error("Erro ao salvar");
    else toast.success("Protocolo salvo!");
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

        <Button onClick={generate} disabled={loading} className="w-full font-black text-sm h-12 rounded-xl tracking-wide" style={{ background: loading ? TEXT_MUTED : GREEN, color: BG }}>
          {loading ? (
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> Gerando protocolo de elite...</span>
          ) : (
            <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> GERAR PROTOCOLO DE ELITE</span>
          )}
        </Button>
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

        {loading ? (
          <LoadingState />
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

            {/* ── Overview Tab ── */}
            {activeResultTab === "overview" && protocol?.block_overview && (
              <BlockOverviewCard overview={protocol.block_overview} alerts={protocol.improvement_alerts} clientName={clientName} />
            )}
            {activeResultTab === "overview" && !protocol?.block_overview && textResults.protocolo && (
              <TextCard content={textResults.protocolo} />
            )}

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
            {activeResultTab === "treino" && protocol?.training_days && (
              <div className="space-y-3">
                {protocol.training_days.map((day: any, idx: number) => (
                  <TrainingDayCard key={idx} day={day} index={idx} expanded={expandedDay === idx} onToggle={() => setExpandedDay(expandedDay === idx ? null : idx)}
                    expandedExercise={expandedExercise} setExpandedExercise={setExpandedExercise} />
                ))}
              </div>
            )}
            {activeResultTab === "treino" && !protocol?.training_days && textResults.protocolo && (
              <TextCard content={textResults.protocolo} />
            )}

            {/* ── Text Tabs ── */}
            {["anatomia", "tecnica", "periodizacao"].includes(activeResultTab) && (
              loadingTab[activeResultTab] ? <LoadingState /> :
              textResults[activeResultTab] ? <TextCard content={textResults[activeResultTab]} /> :
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
function BlockOverviewCard({ overview, alerts, clientName }: { overview: any; alerts?: any[]; clientName: string }) {
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

      {/* Muscle Priorities */}
      {overview.muscle_priorities?.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT }}>Prioridade Muscular</span>
          </div>
          <div className="space-y-2">
            {overview.muscle_priorities.map((mp: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: mp.priority === "alta" ? "#f97316" : mp.priority === "media" ? "#fbbf24" : GREEN }} />
                <span className="text-[11px] font-semibold flex-1" style={{ color: TEXT }}>{mp.muscle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(74,222,128,0.08)", color: GREEN }}>{mp.weekly_sets} séries/sem</span>
              </div>
            ))}
          </div>
          {overview.maintenance_muscles?.length > 0 && (
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
              <span className="text-[9px] font-medium" style={{ color: TEXT_MUTED }}>Manutenção: {overview.maintenance_muscles.join(", ")}</span>
            </div>
          )}
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

/* ── Training Day Card ── */
function TrainingDayCard({ day, index, expanded, onToggle, expandedExercise, setExpandedExercise }: any) {
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
              {day.focus_muscles?.map((m: string, i: number) => (
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
              {/* Warm-up */}
              {day.warmup?.length > 0 && (
                <div className="rounded-xl p-3" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#60a5fa" }}>🔥 WARM-UP</span>
                  <div className="mt-2 space-y-1.5">
                    {day.warmup.map((w: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px] font-medium" style={{ color: TEXT }}>{w.name}</span>
                        <span className="text-[10px]" style={{ color: TEXT_DIM }}>{w.sets}×{w.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises */}
              {day.exercises?.map((ex: any, i: number) => (
                <ExerciseCard key={i} exercise={ex} expanded={expandedExercise === `${index}-${i}`}
                  onToggle={() => setExpandedExercise(expandedExercise === `${index}-${i}` ? null : `${index}-${i}`)} />
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
}

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

function ExerciseCard({ exercise, expanded, onToggle }: { exercise: any; expanded: boolean; onToggle: () => void }) {
  const [showSubs, setShowSubs] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const [swapHistory, setSwapHistory] = useState<string[]>([]);

  const struct = currentExercise.structure || {};
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
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ background: GREEN_DIM, color: GREEN }}>{exercise.order}</div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold" style={{ color: TEXT }}>{safeExerciseName}</p>
              {isSwapped && (
                <span className="text-[7px] px-1 py-0.5 rounded font-bold" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>SUBSTITUTO</span>
              )}
            </div>
            <p className="text-[9px]" style={{ color: TEXT_MUTED }}>{safeMuscleTarget}</p>
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
}

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
function TextCard({ content }: { content: string }) {
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
            {analyzing ? "Analisando..." : "🔬 Analisar com IA"}
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
function HistorySection({ userId }: { userId?: string }) {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadProtocols = useCallback(() => {
    if (!userId) return;
    supabase.from("training_protocols").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setProtocols(data || []));
  }, [userId]);

  useEffect(() => { loadProtocols(); }, [loadProtocols]);

  const deleteProtocol = async (id: string) => {
    const { error } = await supabase.from("training_protocols").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Protocolo excluído");
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

      {filtered.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: TEXT_MUTED }}>Nenhum protocolo encontrado</p>
      ) : filtered.map(p => (
        <div key={p.id} className="rounded-xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
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
            <button onClick={() => setViewModal(p)} className="flex-1 text-[10px] py-2 rounded-lg font-semibold text-center" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER}` }}>
              <Eye className="w-3 h-3 inline mr-1" />Ver Treino
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
          <HistoryViewModal protocol={viewModal} onClose={() => setViewModal(null)} userId={userId} onUpdate={loadProtocols} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── History View Modal ── */
function HistoryViewModal({ protocol: p, onClose, userId, onUpdate }: { protocol: any; onClose: () => void; userId?: string; onUpdate?: () => void }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(p.client_name || "");

  let parsed: any = null;
  try {
    parsed = typeof p.protocol_text === "string" ? JSON.parse(p.protocol_text) : p.protocol_text;
  } catch { parsed = null; }

  const updateProtocol = async () => {
    const { error } = await supabase.from("training_protocols").update({ client_name: editName }).eq("id", p.id);
    if (error) toast.error("Erro ao atualizar");
    else { toast.success("Atualizado!"); setEditing(false); onUpdate?.(); }
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
    } else if (p.protocol_text && !parsed) {
      lines.push(p.protocol_text);
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
              <BlockOverviewCard overview={parsed.block_overview} alerts={parsed.improvement_alerts} clientName={p.client_name} />
              {parsed.training_days?.map((day: any, idx: number) => (
                <TrainingDayCard key={idx} day={day} index={idx} expanded={expandedDay === idx} onToggle={() => setExpandedDay(expandedDay === idx ? null : idx)}
                  expandedExercise={expandedExercise} setExpandedExercise={setExpandedExercise} />
              ))}
            </>
          ) : p.protocol_text ? (
            <TextCard content={typeof p.protocol_text === "string" ? p.protocol_text : JSON.stringify(p.protocol_text, null, 2)} />
          ) : (
            <p className="text-xs text-center py-8" style={{ color: TEXT_MUTED }}>Sem dados do protocolo</p>
          )}

          {p.anatomy_text && (
            <div>
              <h4 className="text-[11px] font-bold mb-2" style={{ color: GREEN }}>📐 Anatomia</h4>
              <TextCard content={p.anatomy_text} />
            </div>
          )}
          {p.tecnica_text && (
            <div>
              <h4 className="text-[11px] font-bold mb-2" style={{ color: GREEN }}>🎯 Técnica</h4>
              <TextCard content={p.tecnica_text} />
            </div>
          )}
          {p.periodizacao_text && (
            <div>
              <h4 className="text-[11px] font-bold mb-2" style={{ color: GREEN }}>📊 Periodização</h4>
              <TextCard content={p.periodizacao_text} />
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
