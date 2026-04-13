import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ChevronRight, ChevronLeft, Download, FileText, Video, Save, BarChart3, History, Settings, Zap, TrendingUp, AlertTriangle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import BottomNav from "@/components/BottomNav";
import {
  PHASES, MUSCLES, LEVELS, WEEKS_OPTIONS, DAYS_OPTIONS,
  SESSION_DURATIONS, CARDIO_OPTIONS, STRESS_OPTIONS, EQUIPMENT_OPTIONS,
  VOLUME_LANDMARKS, RESULT_TABS,
} from "@/data/trainingData";

type Section = "gerar" | "progressao" | "volume" | "historico" | "config";
type TabId = "protocolo" | "anatomia" | "tecnica" | "periodizacao";

const sectionNav: { id: Section; label: string; icon: any }[] = [
  { id: "gerar", label: "Gerar Protocolo", icon: Zap },
  { id: "progressao", label: "Progressão", icon: TrendingUp },
  { id: "volume", label: "Volume", icon: BarChart3 },
  { id: "historico", label: "Histórico", icon: History },
  { id: "config", label: "Config", icon: Settings },
];

export default function TrainingPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("gerar");

  return (
    <div className="min-h-screen" style={{ background: "#0a0f0a" }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,222,128,0.15)" }}>
            <Dumbbell className="w-5 h-5" style={{ color: "#4ade80" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#f0fdf4", fontFamily: "'Space Grotesk', sans-serif" }}>TrainingON</h1>
            <p className="text-xs" style={{ color: "#9ca3af" }}>Motor de Treino Científico</p>
          </div>
        </div>

        {/* Section Nav */}
        <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {sectionNav.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: section === s.id ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.03)",
                color: section === s.id ? "#4ade80" : "#9ca3af",
                border: `1px solid ${section === s.id ? "rgba(74,222,128,0.3)" : "rgba(74,222,128,0.08)"}`,
              }}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-24">
        {section === "gerar" && <GenerateSection userId={user?.id} />}
        {section === "progressao" && <ProgressionSection userId={user?.id} />}
        {section === "volume" && <VolumeLandmarksSection userId={user?.id} />}
        {section === "historico" && <HistorySection userId={user?.id} />}
        {section === "config" && <CoachConfigSection userId={user?.id} />}
      </div>

      <BottomNav />
    </div>
  );
}

/* ============================================================
   SECTION 1 — GENERATE PROTOCOL
   ============================================================ */
function GenerateSection({ userId }: { userId?: string }) {
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
  // Protocol params
  const [phase, setPhase] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [weeks, setWeeks] = useState("8");
  const [days, setDays] = useState("5");
  const [clientName, setClientName] = useState("");
  // Results
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabId>("protocolo");
  const [generated, setGenerated] = useState(false);
  const [reelsModal, setReelsModal] = useState(false);
  const [reelsContent, setReelsContent] = useState("");
  const [reelsLoading, setReelsLoading] = useState(false);

  const toggleEquipment = (e: string) => {
    setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };
  const toggleMuscle = (m: string) => {
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const callAI = useCallback(async (tab: string) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-protocol", {
        body: { phase, muscles, level, weeks, days, clientName, equipment: equipment.join(", "), injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio, tab },
      });
      if (error) throw error;
      setResults(prev => ({ ...prev, [tab]: data.content }));
    } catch (e: any) {
      toast.error(`Erro ao gerar ${tab}: ${e.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [phase, muscles, level, weeks, days, clientName, equipment, injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio]);

  const generate = async () => {
    if (!phase || muscles.length === 0 || !level || !clientName) {
      toast.error("Preencha fase, músculos, nível e nome do cliente");
      return;
    }
    setGenerated(true);
    setActiveTab("protocolo");
    await callAI("protocolo");
    // Load others in parallel
    Promise.allSettled([callAI("anatomia"), callAI("tecnica"), callAI("periodizacao")]);
  };

  const saveProtocol = async () => {
    if (!userId) return;
    const { error } = await supabase.from("training_protocols").insert({
      user_id: userId,
      client_name: clientName,
      phase, muscles, level, weeks,
      days_per_week: days,
      equipment: equipment.join(", "),
      injuries, session_duration: sessionDuration,
      protocol_text: results.protocolo || "",
      anatomy_text: results.anatomia || "",
      tecnica_text: results.tecnica || "",
      periodizacao_text: results.periodizacao || "",
    });
    if (error) toast.error("Erro ao salvar");
    else toast.success("Protocolo salvo com sucesso!");
  };

  const saveAsTemplate = async () => {
    if (!userId) return;
    const tName = prompt("Nome do template:");
    if (!tName) return;
    const { error } = await supabase.from("training_templates").insert({
      user_id: userId,
      template_name: tName,
      phase, muscles, level, weeks,
      days_per_week: days,
      equipment: equipment.join(", "),
      protocol_text: results.protocolo || "",
    });
    if (error) toast.error("Erro ao salvar template");
    else toast.success("Template salvo!");
  };

  const generateReels = async () => {
    setReelsModal(true);
    setReelsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-protocol", {
        body: { phase, muscles, level, weeks, days, clientName, tab: "reels" },
      });
      if (error) throw error;
      setReelsContent(data.content);
    } catch (e: any) {
      toast.error("Erro ao gerar roteiro");
    } finally {
      setReelsLoading(false);
    }
  };

  const formatContent = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      if (/^#{1,3}\s/.test(trimmed) || /^[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\d][A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\d\s:—–\-]{4,}$/.test(trimmed)) {
        return <h3 key={i} className="text-base font-bold mt-4 mb-2" style={{ color: "#4ade80", fontFamily: "'Space Grotesk', sans-serif" }}>{trimmed.replace(/^#+\s*/, "")}</h3>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return <p key={i} className="text-sm ml-3 mb-1" style={{ color: "#d1d5db" }}>• {trimmed.slice(2)}</p>;
      }
      if (/^\d+\./.test(trimmed)) {
        return <p key={i} className="text-sm ml-3 mb-1" style={{ color: "#d1d5db" }}>{trimmed}</p>;
      }
      if (trimmed.includes("|")) {
        const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
        if (cells.every(c => /^[-:]+$/.test(c))) return null;
        return (
          <div key={i} className="grid gap-1 text-xs mb-0.5" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)`, color: "#d1d5db" }}>
            {cells.map((c, ci) => <div key={ci} className="px-1 py-0.5 border-b" style={{ borderColor: "rgba(74,222,128,0.1)" }}>{c}</div>)}
          </div>
        );
      }
      return <p key={i} className="text-sm mb-1" style={{ color: "#d1d5db" }}>{trimmed}</p>;
    });
  };

  // Step 1: Anamnese
  if (step === 1 && !generated) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#4ade80", color: "#0a0f0a" }}>1</div>
          <span className="text-sm font-semibold" style={{ color: "#f0fdf4" }}>Anamnese de Treino</span>
          <span className="text-xs ml-auto" style={{ color: "#6b7280" }}>Step 1 de 2</span>
        </div>

        <Field label="Histórico de lesões ou restrições">
          <Textarea value={injuries} onChange={e => setInjuries(e.target.value)} placeholder="Ex: joelho direito, hérnia L4-L5" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
        </Field>

        <Field label="Equipamentos disponíveis">
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map(e => (
              <button key={e} onClick={() => toggleEquipment(e)}
                className="text-xs px-3 py-2 rounded-lg transition-all text-left"
                style={{
                  background: equipment.includes(e) ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${equipment.includes(e) ? "#4ade80" : "rgba(74,222,128,0.08)"}`,
                  color: equipment.includes(e) ? "#4ade80" : "#9ca3af",
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

        <Field label="Objetivo específico">
          <Textarea value={specificGoal} onChange={e => setSpecificGoal(e.target.value)} placeholder="Ex: aumentar glúteo, definir abdômen" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm min-h-[60px]" />
        </Field>

        <Field label="Pontos fracos do cliente">
          <Input value={weakPoints} onChange={e => setWeakPoints(e.target.value)} placeholder="Ex: ombros pequenos" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estresse/sono">
            <StyledSelect value={stressLevel} onValueChange={setStressLevel} options={STRESS_OPTIONS.map(v => ({ value: v, label: v }))} />
          </Field>
          <Field label="Suplementos">
            <Input value={supplements} onChange={e => setSupplements(e.target.value)} placeholder="creatina, whey..." className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>
        </div>

        <Button onClick={() => setStep(2)} className="w-full font-bold text-sm" style={{ background: "#4ade80", color: "#0a0f0a" }}>
          Continuar para o Protocolo <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  // Step 2: Protocol config
  if (step === 2 && !generated) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setStep(1)} className="text-xs flex items-center gap-1" style={{ color: "#9ca3af" }}>
            <ChevronLeft className="w-3 h-3" /> Voltar
          </button>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#4ade80", color: "#0a0f0a" }}>2</div>
          <span className="text-sm font-semibold" style={{ color: "#f0fdf4" }}>Configurar Protocolo</span>
        </div>

        <Field label="Fase de treinamento">
          <div className="grid grid-cols-3 gap-2">
            {PHASES.map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                className="p-3 rounded-xl text-center transition-all"
                style={{
                  background: phase === p.id ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${phase === p.id ? "#4ade80" : "rgba(74,222,128,0.08)"}`,
                }}>
                <div className="text-lg mb-1">{p.emoji}</div>
                <div className="text-xs font-medium" style={{ color: phase === p.id ? "#4ade80" : "#f0fdf4" }}>{p.name}</div>
                <div className="text-[10px]" style={{ color: "#6b7280" }}>{p.subtitle}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Músculos prioritários (${muscles.length} selecionados)`}>
          <div className="grid grid-cols-4 gap-1.5">
            {MUSCLES.map(m => (
              <button key={m} onClick={() => toggleMuscle(m)}
                className="text-[10px] px-2 py-1.5 rounded-full transition-all text-center"
                style={{
                  background: muscles.includes(m) ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${muscles.includes(m) ? "#4ade80" : "rgba(74,222,128,0.08)"}`,
                  color: muscles.includes(m) ? "#4ade80" : "#9ca3af",
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
            <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>
        </div>

        <Button onClick={generate} disabled={loading.protocolo} className="w-full font-bold text-sm py-3" style={{ background: "#4ade80", color: "#0a0f0a" }}>
          {loading.protocolo ? "Gerando protocolo..." : "⚡ Gerar Protocolo Científico Completo"}
        </Button>
      </div>
    );
  }

  // Results view
  if (generated) {
    return (
      <div className="space-y-4 mt-4">
        <button onClick={() => { setGenerated(false); setStep(2); setResults({}); }} className="text-xs flex items-center gap-1" style={{ color: "#9ca3af" }}>
          <ChevronLeft className="w-3 h-3" /> Novo protocolo
        </button>

        <div className="text-sm font-bold" style={{ color: "#f0fdf4" }}>
          Protocolo: <span style={{ color: "#4ade80" }}>{clientName}</span> — {PHASES.find(p => p.id === phase)?.name}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {RESULT_TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id as TabId); if (!results[t.id] && !loading[t.id]) callAI(t.id); }}
              className="text-xs px-3 py-2 whitespace-nowrap rounded-t-lg transition-all"
              style={{
                color: activeTab === t.id ? "#4ade80" : "#9ca3af",
                borderBottom: activeTab === t.id ? "2px solid #4ade80" : "2px solid transparent",
                background: activeTab === t.id ? "rgba(74,222,128,0.05)" : "transparent",
              }}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
          {loading[activeTab] ? (
            <div className="space-y-3">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(74,222,128,0.1)" }}>
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/3 rounded-full" style={{ background: "#4ade80" }} />
              </div>
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-4 bg-[rgba(255,255,255,0.05)]" style={{ width: `${60 + Math.random() * 40}%` }} />)}
            </div>
          ) : results[activeTab] ? (
            <div className="space-y-1">{formatContent(results[activeTab])}</div>
          ) : (
            <p className="text-sm" style={{ color: "#6b7280" }}>Clique para carregar este conteúdo.</p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={saveProtocol} variant="outline" className="text-xs border-[rgba(74,222,128,0.2)] text-[#4ade80] bg-transparent hover:bg-[rgba(74,222,128,0.1)]">
            <Save className="w-3 h-3 mr-1" /> Salvar
          </Button>
          <Button onClick={saveAsTemplate} variant="outline" className="text-xs border-[rgba(74,222,128,0.2)] text-[#4ade80] bg-transparent hover:bg-[rgba(74,222,128,0.1)]">
            <FileText className="w-3 h-3 mr-1" /> Salvar Template
          </Button>
          <Button onClick={generateReels} variant="outline" className="text-xs border-[rgba(74,222,128,0.2)] text-[#4ade80] bg-transparent hover:bg-[rgba(74,222,128,0.1)]">
            <Video className="w-3 h-3 mr-1" /> Roteiro Reels
          </Button>
          <Button onClick={() => {
            const blob = new Blob([
              `PROTOCOLO DE TREINO — ${clientName}\nFase: ${phase} | ${weeks} semanas | ${days} dias/sem\n\n` +
              `=== PROTOCOLO ===\n${results.protocolo || ""}\n\n` +
              `=== ANATOMIA ===\n${results.anatomia || ""}\n\n` +
              `=== TÉCNICA ===\n${results.tecnica || ""}\n\n` +
              `=== PERIODIZAÇÃO ===\n${results.periodizacao || ""}\n\n` +
              `Gerado por nutriON · TrainingON Engine`
            ], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `protocolo_${clientName.replace(/\s/g, "_")}.txt`; a.click();
            URL.revokeObjectURL(url);
          }} variant="outline" className="text-xs border-[rgba(74,222,128,0.2)] text-[#4ade80] bg-transparent hover:bg-[rgba(74,222,128,0.1)]">
            <Download className="w-3 h-3 mr-1" /> Exportar TXT
          </Button>
        </div>

        {/* Reels Modal */}
        <AnimatePresence>
          {reelsModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setReelsModal(false)}>
              <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} onClick={e => e.stopPropagation()}
                className="w-full max-w-lg rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto" style={{ background: "#0a0f0a", border: "1px solid rgba(74,222,128,0.15)" }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "#4ade80" }}>🎬 Roteiro de Reels</h3>
                {reelsLoading ? (
                  <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 bg-[rgba(255,255,255,0.05)]" />)}</div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap" style={{ color: "#d1d5db" }}>{reelsContent}</div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

/* ============================================================
   SECTION 2 — PROGRESSION
   ============================================================ */
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
    return progress.filter(p => p.exercise === exercise).map(p => ({
      semana: `S${p.week_number}`, carga: p.weight_kg,
    }));
  }, [progress, exercise]);

  const suggestion = useMemo(() => {
    const exProgress = progress.filter(p => p.exercise === exercise);
    if (exProgress.length < 2) return null;
    const last = exProgress[exProgress.length - 1];
    const prev = exProgress[exProgress.length - 2];
    if (last.rpe_real && last.rpe_real <= 8 && last.reps_done >= (prev.reps_done || 0)) {
      return { type: "up", text: `RPE ${last.rpe_real} — Aumente 2.5kg na próxima sessão (dupla progressão)` };
    }
    if (last.rpe_real && last.rpe_real > 9) {
      return { type: "down", text: `RPE ${last.rpe_real} — Considere reduzir volume ou programar deload` };
    }
    if (last.weight_kg === prev.weight_kg) {
      return { type: "stag", text: "Carga estagnada por 2 sessões — considere variar estímulo" };
    }
    return { type: "ok", text: "Progressão normal — mantenha a carga atual" };
  }, [progress, exercise]);

  return (
    <div className="space-y-4 mt-4">
      <Field label="Selecionar protocolo">
        <StyledSelect value={selectedProtocol} onValueChange={setSelectedProtocol} placeholder="Escolha um protocolo"
          options={protocols.map(p => ({ value: p.id, label: `${p.client_name} — ${p.phase} (${new Date(p.created_at).toLocaleDateString("pt-BR")})` }))} />
      </Field>

      {selectedProtocol && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Semana">
              <StyledSelect value={weekNumber} onValueChange={setWeekNumber} options={Array.from({ length: 16 }, (_, i) => ({ value: String(i + 1), label: `Semana ${i + 1}` }))} />
            </Field>
            <Field label="Exercício">
              <Input value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Ex: Supino Reto" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Field label="Séries"><Input value={setsDone} onChange={e => setSetsDone(e.target.value)} type="number" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] text-sm" /></Field>
            <Field label="Reps"><Input value={repsDone} onChange={e => setRepsDone(e.target.value)} type="number" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] text-sm" /></Field>
            <Field label="Carga (kg)"><Input value={weightKg} onChange={e => setWeightKg(e.target.value)} type="number" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] text-sm" /></Field>
            <Field label="RPE"><Input value={rpeReal} onChange={e => setRpeReal(e.target.value)} type="number" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] text-sm" /></Field>
          </div>
          <Field label="Observações">
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>
          <Button onClick={logProgress} className="w-full font-bold text-sm" style={{ background: "#4ade80", color: "#0a0f0a" }}>Registrar Progressão</Button>

          {suggestion && (
            <div className="rounded-xl p-3" style={{
              background: suggestion.type === "up" ? "rgba(74,222,128,0.08)" : suggestion.type === "stag" ? "rgba(251,191,36,0.08)" : suggestion.type === "down" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${suggestion.type === "up" ? "rgba(74,222,128,0.3)" : suggestion.type === "stag" ? "rgba(251,191,36,0.3)" : suggestion.type === "down" ? "rgba(239,68,68,0.3)" : "rgba(74,222,128,0.12)"}`,
            }}>
              <p className="text-xs font-medium" style={{ color: suggestion.type === "up" ? "#4ade80" : suggestion.type === "stag" ? "#fbbf24" : suggestion.type === "down" ? "#ef4444" : "#9ca3af" }}>
                {suggestion.type === "up" ? "📈" : suggestion.type === "stag" ? "⚠️" : suggestion.type === "down" ? "🔻" : "✓"} {suggestion.text}
              </p>
            </div>
          )}

          {chartData.length > 1 && (
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#f0fdf4" }}>Evolução: {exercise}</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.08)" />
                  <XAxis dataKey="semana" tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0a0f0a", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, color: "#f0fdf4", fontSize: 12 }} />
                  <Line type="monotone" dataKey="carga" stroke="#4ade80" strokeWidth={2} dot={{ fill: "#4ade80", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {progress.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#f0fdf4" }}>Registros recentes</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {progress.slice(-10).reverse().map(p => (
                  <div key={p.id} className="flex justify-between text-[10px] py-1 border-b" style={{ borderColor: "rgba(74,222,128,0.06)", color: "#9ca3af" }}>
                    <span style={{ color: "#d1d5db" }}>{p.exercise}</span>
                    <span>S{p.week_number} · {p.sets_done}x{p.reps_done} · {p.weight_kg}kg · RPE{p.rpe_real}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   SECTION 3 — VOLUME LANDMARKS
   ============================================================ */
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
    if (sets < levelData.mev) return { label: "Abaixo do MEV", color: "#6b7280", desc: "Volume insuficiente para estímulo de crescimento" };
    if (sets <= levelData.mav) return { label: "Zona de Crescimento", color: "#4ade80", desc: "Volume ideal — continue progredindo" };
    if (sets <= levelData.mrv) return { label: "Zona de Atenção", color: "#fbbf24", desc: "Planeje deload em breve" };
    return { label: "Acima do MRV", color: "#ef4444", desc: "Overreaching — risco de overtraining" };
  };

  const zone = getZone();

  const analyzeVolume = async () => {
    if (!userId || !selectedMuscle) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-training-protocol", {
        body: { muscles: [selectedMuscle], level: selectedLevel, currentSets: sets, tab: "volume" },
      });
      if (error) throw error;
      setAnalysis(data.content);
    } catch (e: any) {
      toast.error("Erro na análise");
    } finally {
      setAnalyzing(false);
    }
  };

  const barPercent = levelData ? Math.min((sets / levelData.mrv) * 100, 120) : 0;

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Músculo">
          <StyledSelect value={selectedMuscle} onValueChange={setSelectedMuscle} placeholder="Selecione" options={VOLUME_LANDMARKS.map(v => ({ value: v.muscle, label: v.muscle }))} />
        </Field>
        <Field label="Nível">
          <StyledSelect value={selectedLevel} onValueChange={setSelectedLevel} options={[
            { value: "beginner", label: "Iniciante" },
            { value: "intermediate", label: "Intermediário" },
            { value: "advanced", label: "Avançado" },
          ]} />
        </Field>
      </div>

      {levelData && (
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
          <div className="flex justify-between text-xs mb-3" style={{ color: "#9ca3af" }}>
            <span>MEV: <b style={{ color: "#4ade80" }}>{levelData.mev}</b></span>
            <span>MAV: <b style={{ color: "#4ade80" }}>{levelData.mav}</b></span>
            <span>MRV: <b style={{ color: "#fbbf24" }}>{levelData.mrv}</b></span>
          </div>

          <Field label="Séries atuais por semana">
            <Input value={currentSets} onChange={e => setCurrentSets(e.target.value)} type="number" placeholder="Ex: 14" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>

          {sets > 0 && (
            <>
              {/* Progress bar */}
              <div className="mt-3 relative h-6 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="absolute h-full rounded-full transition-all" style={{
                  width: `${Math.min((levelData.mev / levelData.mrv) * 100, 100)}%`,
                  background: "rgba(74,222,128,0.1)",
                }} />
                <div className="absolute h-full rounded-full transition-all" style={{
                  width: `${Math.min((levelData.mav / levelData.mrv) * 100, 100)}%`,
                  background: "rgba(74,222,128,0.15)",
                }} />
                <div className="absolute h-full rounded-full transition-all" style={{
                  width: `${Math.min(barPercent, 100)}%`,
                  background: zone?.color || "#4ade80",
                  opacity: 0.5,
                }} />
                <div className="absolute top-0 h-full w-0.5" style={{ left: `${Math.min(barPercent, 100)}%`, background: zone?.color || "#4ade80" }} />
                <div className="absolute top-1 text-[9px] font-bold" style={{ left: `${Math.min(barPercent, 98)}%`, color: zone?.color }}>{sets}</div>
              </div>

              {zone && (
                <div className="mt-2 rounded-lg p-2" style={{ background: `${zone.color}15`, border: `1px solid ${zone.color}30` }}>
                  <p className="text-xs font-bold" style={{ color: zone.color }}>{zone.label}</p>
                  <p className="text-[10px]" style={{ color: "#9ca3af" }}>{zone.desc}</p>
                </div>
              )}
            </>
          )}

          <Button onClick={analyzeVolume} disabled={analyzing || !sets} className="w-full mt-3 text-xs font-bold" style={{ background: "#4ade80", color: "#0a0f0a" }}>
            {analyzing ? "Analisando..." : "🔬 Analisar Volume com IA"}
          </Button>

          {analysis && (
            <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(74,222,128,0.05)", borderLeft: "3px solid #4ade80" }}>
              <p className="text-xs whitespace-pre-wrap" style={{ color: "#d1d5db" }}>{analysis}</p>
            </div>
          )}
        </div>
      )}

      {/* Reference table */}
      <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
        <p className="text-xs font-bold mb-2" style={{ color: "#f0fdf4" }}>📊 Tabela de Referência (séries/semana)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]" style={{ color: "#9ca3af" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(74,222,128,0.1)" }}>
                <th className="text-left py-1 pr-2" style={{ color: "#f0fdf4" }}>Músculo</th>
                <th className="text-center py-1 px-1">Ini MEV/MAV/MRV</th>
                <th className="text-center py-1 px-1">Int MEV/MAV/MRV</th>
                <th className="text-center py-1 px-1">Ava MEV/MAV/MRV</th>
              </tr>
            </thead>
            <tbody>
              {VOLUME_LANDMARKS.map(v => (
                <tr key={v.muscle} style={{ borderBottom: "1px solid rgba(74,222,128,0.05)" }}>
                  <td className="py-1 pr-2" style={{ color: "#d1d5db" }}>{v.muscle}</td>
                  <td className="text-center py-1">{v.beginner.mev}/{v.beginner.mav}/{v.beginner.mrv}</td>
                  <td className="text-center py-1">{v.intermediate.mev}/{v.intermediate.mav}/{v.intermediate.mrv}</td>
                  <td className="text-center py-1">{v.advanced.mev}/{v.advanced.mav}/{v.advanced.mrv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION 4 — HISTORY
   ============================================================ */
function HistorySection({ userId }: { userId?: string }) {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    supabase.from("training_protocols").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setProtocols(data || []));
  }, [userId]);

  const filtered = protocols.filter(p =>
    p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phase?.toLowerCase().includes(search.toLowerCase())
  );

  const phaseColor: Record<string, string> = {
    bulking: "#4ade80", cutting: "#ef4444", manutencao: "#3b82f6", recomposicao: "#8b5cf6", emagrecimento: "#f97316", performance: "#fbbf24",
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "#6b7280" }} />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente ou fase..." className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm pl-9" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "#6b7280" }}>Nenhum protocolo encontrado</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: "#f0fdf4" }}>{p.client_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${phaseColor[p.phase] || "#4ade80"}20`, color: phaseColor[p.phase] || "#4ade80" }}>
                  {PHASES.find(ph => ph.id === p.phase)?.name || p.phase}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {p.muscles?.slice(0, 5).map((m: string) => (
                  <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80" }}>{m}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: "#6b7280" }}>{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                <div className="flex gap-1">
                  <button onClick={() => setViewModal(p)} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>Ver</button>
                  <button onClick={() => {
                    const blob = new Blob([`PROTOCOLO: ${p.client_name}\n\n${p.protocol_text || ""}\n\n${p.anatomy_text || ""}\n\n${p.tecnica_text || ""}\n\n${p.periodizacao_text || ""}`], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `protocolo_${p.client_name}.txt`; a.click();
                  }} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>Exportar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setViewModal(null)}>
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: "#0a0f0a", border: "1px solid rgba(74,222,128,0.15)" }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: "#4ade80" }}>{viewModal.client_name}</h3>
              <p className="text-[10px] mb-4" style={{ color: "#6b7280" }}>{viewModal.phase} · {viewModal.weeks} sem · {viewModal.days_per_week} dias/sem</p>
              <div className="text-xs whitespace-pre-wrap space-y-4" style={{ color: "#d1d5db" }}>
                {viewModal.protocol_text && <div><h4 className="font-bold mb-1" style={{ color: "#4ade80" }}>Protocolo</h4>{viewModal.protocol_text}</div>}
                {viewModal.anatomy_text && <div><h4 className="font-bold mb-1" style={{ color: "#4ade80" }}>Anatomia</h4>{viewModal.anatomy_text}</div>}
                {viewModal.tecnica_text && <div><h4 className="font-bold mb-1" style={{ color: "#4ade80" }}>Técnica</h4>{viewModal.tecnica_text}</div>}
                {viewModal.periodizacao_text && <div><h4 className="font-bold mb-1" style={{ color: "#4ade80" }}>Periodização</h4>{viewModal.periodizacao_text}</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   SECTION 5 — COACH CONFIG
   ============================================================ */
function CoachConfigSection({ userId }: { userId?: string }) {
  const [coachName, setCoachName] = useState("");
  const [coachTitle, setCoachTitle] = useState("");
  const [coachInstagram, setCoachInstagram] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachCref, setCoachCref] = useState("");
  const [accentColor, setAccentColor] = useState("#4ade80");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("coach_profiles").select("*").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCoachName(data.professional_name || "");
          setCoachTitle(data.bio || "");
          setCoachInstagram(data.specialties?.[0] || "");
          setCoachEmail(typeof data.alert_channels === "object" && data.alert_channels !== null ? (data.alert_channels as any).email || "" : "");
          setCoachCref(data.crn || "");
        }
      });
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("coach_profiles").update({
      professional_name: coachName,
      bio: coachTitle,
      crn: coachCref,
    }).eq("user_id", userId);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Configurações salvas!");
    setSaving(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "#f0fdf4" }}>⚙️ Configurações do Coach</h3>

        <div className="space-y-3">
          <Field label="Nome completo">
            <Input value={coachName} onChange={e => setCoachName(e.target.value)} placeholder="Seu nome" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>
          <Field label="Título profissional">
            <Input value={coachTitle} onChange={e => setCoachTitle(e.target.value)} placeholder="Especialista em Hipertrofia | CREF..." className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram">
              <Input value={coachInstagram} onChange={e => setCoachInstagram(e.target.value)} placeholder="@seu_insta" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
            </Field>
            <Field label="CREF">
              <Input value={coachCref} onChange={e => setCoachCref(e.target.value)} placeholder="123456-G/RJ" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
            </Field>
          </div>
          <Field label="E-mail profissional">
            <Input value={coachEmail} onChange={e => setCoachEmail(e.target.value)} placeholder="coach@email.com" className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] placeholder:text-[#6b7280] text-sm" />
          </Field>

          <Button onClick={save} disabled={saving} className="w-full font-bold text-sm" style={{ background: "#4ade80", color: "#0a0f0a" }}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl p-4 text-center" style={{ background: "#0a0f0a", border: "1px solid rgba(74,222,128,0.2)" }}>
        <p className="text-[10px] mb-1" style={{ color: "#6b7280" }}>Preview da capa do PDF</p>
        <div className="py-6 rounded-lg" style={{ background: "#050805" }}>
          <p className="text-lg font-bold" style={{ color: accentColor, fontFamily: "'Space Grotesk', sans-serif" }}>nutriON</p>
          <p className="text-xs mt-2" style={{ color: "#f0fdf4" }}>PROTOCOLO DE TREINO CIENTÍFICO</p>
          <p className="text-sm mt-1" style={{ color: accentColor }}>{coachName || "Nome do Coach"}</p>
          <p className="text-[10px] mt-1" style={{ color: "#6b7280" }}>{coachTitle || "Título profissional"}</p>
          <p className="text-[10px]" style={{ color: "#6b7280" }}>{coachCref && `CREF: ${coachCref}`}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-medium mb-1 block" style={{ color: "#9ca3af" }}>{label}</label>
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
      <SelectTrigger className="bg-transparent border-[rgba(74,222,128,0.12)] text-[#f0fdf4] text-sm h-9">
        <SelectValue placeholder={placeholder || "Selecione"} />
      </SelectTrigger>
      <SelectContent className="bg-[#111] border-[rgba(74,222,128,0.15)]">
        {options.map(o => (
          <SelectItem key={o.value} value={o.value} className="text-[#f0fdf4] text-sm focus:bg-[rgba(74,222,128,0.1)] focus:text-[#4ade80]">{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
