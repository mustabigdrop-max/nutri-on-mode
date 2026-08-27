import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Send, Loader2, AlertTriangle, Heart, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VERA_AGENT_SYSTEM, VERA_PHARMA_MODULE } from "@/utils/veraAgentPrompt";
import {
  buildDeterministicDiagnostic,
  formatProtocolForTrainingOn,
  OITO_PILARES,
  type ApexToVERAPackage,
  type VERADiagnostic,
} from "@/utils/apexVeraMap";

const PURPLE = "#A78BFA";
const BG = "#0A0A0F";
const SURFACE = "#11111a";
const BORDER = "rgba(255,255,255,0.08)";

type Msg = { role: "user" | "assistant"; content: string };

type Fase = "FOLICULAR" | "OVULACAO" | "LUTEA" | "MENSTRUACAO" | "NAO_INFORMADO";

interface AnamneseFeminina {
  ciclo_regular: boolean | null;
  dia_ciclo_atual: number | null;
  duracao_ciclo: number;
  fase_atual: Fase;

  usa_anticoncepcional: boolean | null;
  tipo_anticoncepcional: string | null;
  anticoncepcional_nome: string;

  historico_dieta_restritiva: boolean | null;
  anos_restricao: number | null;
  gestacao_recente: boolean | null;
  meses_pos_parto: number | null;
  menopausa: boolean | null;
  perimenopausa: boolean | null;
  historico_ta: boolean | null;

  usa_eaa: boolean | null;
  compostos_em_uso: string;
  ciclos_anteriores: number;

  objetivo_principal: string;
  categoria_competicao: string;
  pontos_fracos: string;
  lesoes: string;
}

const EMPTY: AnamneseFeminina = {
  ciclo_regular: null,
  dia_ciclo_atual: null,
  duracao_ciclo: 28,
  fase_atual: "NAO_INFORMADO",
  usa_anticoncepcional: null,
  tipo_anticoncepcional: null,
  anticoncepcional_nome: "",
  historico_dieta_restritiva: null,
  anos_restricao: null,
  gestacao_recente: null,
  meses_pos_parto: null,
  menopausa: null,
  perimenopausa: null,
  historico_ta: null,
  usa_eaa: null,
  compostos_em_uso: "",
  ciclos_anteriores: 0,
  objetivo_principal: "",
  categoria_competicao: "",
  pontos_fracos: "",
  lesoes: "",
};

const FASE_CONFIG: Record<Fase, { cor: string; bg: string; border: string; label: string; instrucao: string }> = {
  FOLICULAR: { cor: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", label: "Fase folicular", instrucao: "Intensidade alta · cargas máximas" },
  OVULACAO:  { cor: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", label: "Ovulação", instrucao: "Força disponível · evitar explosivo" },
  LUTEA:     { cor: "#FB923C", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.25)", label: "Fase lútea", instrucao: "Volume moderado · Z3-Z4" },
  MENSTRUACAO:{ cor: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", label: "Menstruação", instrucao: "Mobilidade · corretivos · Z4-Z5" },
  NAO_INFORMADO:{ cor: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", label: "Fase não informada", instrucao: "Informar dia do ciclo para adaptar prescrição" },
};

function detectFase(dia: number): Fase {
  if (dia >= 1 && dia <= 5) return "MENSTRUACAO";
  if (dia >= 6 && dia <= 13) return "FOLICULAR";
  if (dia >= 14 && dia <= 16) return "OVULACAO";
  if (dia >= 17 && dia <= 28) return "LUTEA";
  return "NAO_INFORMADO";
}

export default function VeraPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const apexFlag = searchParams.get("avaliacao") === "apex";
  const apexAtletaId = searchParams.get("atleta");

  const [phase, setPhase] = useState<"intake" | "chat" | "apex">(apexFlag ? "apex" : "intake");
  const [anamnese, setAnamnese] = useState<AnamneseFeminina>(EMPTY);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [apexPackage, setApexPackage] = useState<ApexToVERAPackage | null>(null);
  const [apexDiagnostic, setApexDiagnostic] = useState<VERADiagnostic | null>(null);
  const [apexLoading, setApexLoading] = useState(false);

  // Load APEX bridge package
  useEffect(() => {
    if (!apexFlag || !apexAtletaId) return;
    setApexLoading(true);
    (async () => {
      const { data } = await supabase
        .from("apex_vera_bridge" as any)
        .select("*")
        .eq("atleta_id", apexAtletaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const pkg = (data as any).package as ApexToVERAPackage;
        setApexPackage(pkg);
        setApexDiagnostic(buildDeterministicDiagnostic(pkg));
      }
      setApexLoading(false);
    })();
  }, [apexFlag, apexAtletaId]);

  // Load most recent anamnese for this coach
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("vera_anamnese" as any)
        .select("*")
        .eq("coach_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const d: any = data;
        setAnamnese({
          ...EMPTY,
          ciclo_regular: d.ciclo_regular,
          dia_ciclo_atual: d.dia_ciclo_atual,
          duracao_ciclo: d.duracao_ciclo ?? 28,
          fase_atual: (d.fase_atual as Fase) ?? "NAO_INFORMADO",
          usa_anticoncepcional: d.usa_anticoncepcional,
          tipo_anticoncepcional: d.tipo_anticoncepcional,
          anticoncepcional_nome: d.anticoncepcional_nome ?? "",
          historico_dieta_restritiva: d.historico_dieta_restritiva,
          anos_restricao: d.anos_restricao,
          gestacao_recente: d.gestacao_recente,
          meses_pos_parto: d.meses_pos_parto,
          menopausa: d.menopausa,
          perimenopausa: d.perimenopausa,
          historico_ta: d.historico_ta,
          usa_eaa: d.usa_eaa,
          compostos_em_uso: d.compostos_em_uso ?? "",
          ciclos_anteriores: d.ciclos_anteriores ?? 0,
          objetivo_principal: d.objetivo_principal ?? "",
          categoria_competicao: d.categoria_competicao ?? "",
          pontos_fracos: d.pontos_fracos ?? "",
          lesoes: d.lesoes ?? "",
        });
      }
      setLoadingExisting(false);
    })();
  }, [user?.id]);

  const handleAnamneseComplete = useCallback(async (data: AnamneseFeminina) => {
    setAnamnese(data);
    if (user?.id) {
      const payload = { ...data, coach_id: user.id, athlete_id: user.id };
      const { error } = await supabase.from("vera_anamnese" as any).insert(payload as any);
      if (error) console.error("save anamnese", error);
    }
    setPhase("chat");
  }, [user?.id]);

  return (
    <div className="min-h-screen" style={{ background: BG, color: "rgba(255,255,255,0.9)" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "12px 24px 0", fontSize: 11, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={() => navigate("/coach")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", padding: 0, fontSize: 11 }}>nutriON</button>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <button onClick={() => navigate("/coach")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", padding: 0, fontSize: 11 }}>Coach Hub</button>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ color: PURPLE }}>VERA</span>
      </div>

      {/* Header principal — padrão APEX */}
      <div style={{ padding: "16px 24px 20px", borderBottom: "0.5px solid rgba(167,139,250,0.12)", background: "linear-gradient(180deg, rgba(167,139,250,0.06) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => navigate("/coach/dashboard")} aria-label="Voltar" style={{ width: 36, height: 36, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "rgba(255,255,255,0.55)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div style={{ width: 52, height: 52, background: "rgba(167,139,250,0.1)", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: PURPLE, flexShrink: 0 }}>✦</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.95)", margin: 0, letterSpacing: "0.06em", lineHeight: 1 }}>VERA</h1>
                <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE, background: "rgba(167,139,250,0.15)", border: "0.5px solid rgba(167,139,250,0.4)", borderRadius: 6, padding: "3px 10px", letterSpacing: "0.1em" }}>FEMININO</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>v2.0</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "0 0 8px", letterSpacing: "0.04em" }}>
                Visão Estratégica de Resultados Avançados &nbsp;·&nbsp; Fisiologia Feminina &nbsp;·&nbsp; Diagnóstico Postural &nbsp;·&nbsp; Farmacologia Expert
              </p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["Ciclo Menstrual", "Pontos Fracos", "EAAs Femininos", "APEX Integrado", "TrainingON Sync"].map((chip, i) => (
                  <span key={i} style={{ fontSize: 9, padding: "2px 7px", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 20, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{chip}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(52,211,153,0.1)", border: "0.5px solid rgba(52,211,153,0.3)", borderRadius: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#34D399", letterSpacing: "0.06em" }}>SISTEMA ATIVO</span>
            </div>
            {anamnese.fase_atual !== "NAO_INFORMADO" && (
              <CicloIndicator fase={anamnese.fase_atual} />
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      {loadingExisting ? (
        <div className="flex items-center justify-center p-10" style={{ color: PURPLE }}>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : phase === "apex" ? (
        <ApexDiagnosticPanel
          loading={apexLoading}
          pkg={apexPackage}
          diagnostic={apexDiagnostic}
          onSendToTrainingOn={async () => {
            if (!apexDiagnostic || !apexPackage) return;
            const text = formatProtocolForTrainingOn(apexDiagnostic, apexPackage.atleta_nome);
            await supabase.from("apex_vera_bridge" as any).update({
              status: "ENVIADO_TRAININGON",
              resultado: { protocolo_texto: text, exercicios: apexDiagnostic.pontos_fracos.flatMap(p => p.protocolo), pilares: apexDiagnostic.pilares_ativos, timeline: apexDiagnostic.timeline_semanas },
            } as any).eq("atleta_id", apexPackage.atleta_id);
            toast.success("Protocolo enviado ao TrainingON");
            navigate(`/training?vera_protocolo=true&atleta=${apexPackage.atleta_id}`);
          }}
          onOpenAnamnese={() => setPhase("intake")}
        />
      ) : phase === "intake" ? (
        <AnamneseFemininaForm initial={anamnese} onComplete={handleAnamneseComplete} />
      ) : (
        <VeraChatTabs anamnese={anamnese} onEditAnamnese={() => setPhase("intake")} />
      )}
    </div>
  );
}

/* ───────────────────────── APEX DIAGNOSTIC PANEL ───────────────────────── */
function ApexDiagnosticPanel({
  loading, pkg, diagnostic, onSendToTrainingOn, onOpenAnamnese,
}: {
  loading: boolean;
  pkg: ApexToVERAPackage | null;
  diagnostic: VERADiagnostic | null;
  onSendToTrainingOn: () => void;
  onOpenAnamnese: () => void;
}) {
  if (loading) {
    return <div className="flex items-center justify-center p-10" style={{ color: PURPLE }}><Loader2 className="w-4 h-4 animate-spin" /></div>;
  }
  if (!pkg || !diagnostic) {
    return <div style={{ padding: 24, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Nenhuma análise APEX vinculada encontrada.</div>;
  }
  return (
    <div style={{ padding: "16px 20px", maxWidth: 820, margin: "0 auto" }}>
      <div style={{ padding: "10px 14px", marginBottom: 16, background: "rgba(184,146,42,0.07)", border: "0.5px solid rgba(184,146,42,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, color: "#B8922A", letterSpacing: "0.08em", margin: "0 0 3px" }}>ANÁLISE APEX IMPORTADA</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", margin: 0 }}>
            {pkg.atleta_nome} · {pkg.achados.length} achados · SRI {pkg.sri ?? "--"} · {Math.round(pkg.qualidade * 100)}% qualidade
          </p>
        </div>
        <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(184,146,42,0.15)", border: "0.5px solid rgba(184,146,42,0.3)", borderRadius: 8, color: "#B8922A" }}>APEX ✓</span>
      </div>

      <p style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: "0.08em", margin: "0 0 10px", textTransform: "uppercase" }}>
        Pontos fracos identificados — {diagnostic.pontos_fracos.length}
      </p>

      {diagnostic.pontos_fracos.map((pf, i) => {
        const isCrit = pf.severidade === "CRITICO";
        return (
          <div key={i} style={{ marginBottom: 12, background: "rgba(255,255,255,.03)", border: `0.5px solid ${isCrit ? "rgba(239,68,68,.25)" : "rgba(251,191,36,.2)"}`, borderLeft: `2px solid ${isCrit ? "#EF4444" : "#FBBF24"}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "rgba(255,255,255,.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.9)", margin: 0 }}>{pf.nome}</p>
                <span style={{ fontSize: 9, padding: "1px 7px", background: isCrit ? "rgba(239,68,68,.12)" : "rgba(251,191,36,.12)", border: `0.5px solid ${isCrit ? "rgba(239,68,68,.3)" : "rgba(251,191,36,.3)"}`, borderRadius: 7, color: isCrit ? "#EF4444" : "#FBBF24" }}>{pf.severidade}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Impacto visual</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.55)", margin: 0, lineHeight: 1.4 }}>{pf.impacto_visual}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Causa raiz</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.55)", margin: 0, lineHeight: 1.4 }}>{pf.causa_raiz}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: "8px 14px", borderTop: "0.5px solid rgba(255,255,255,.06)" }}>
              <p style={{ fontSize: 9, color: "rgba(167,139,250,.6)", margin: "0 0 5px", letterSpacing: "0.06em" }}>PILARES DARKSIDE ATIVOS</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {pf.pilares.map((num, j) => {
                  const pilar = OITO_PILARES.find((p) => p.numero === num);
                  return pilar ? (
                    <span key={j} title={pilar.aplicacao} style={{ fontSize: 9, padding: "1px 7px", background: "rgba(167,139,250,.1)", border: "0.5px solid rgba(167,139,250,.2)", borderRadius: 7, color: "#A78BFA", cursor: "help" }}>{num}. {pilar.nome}</span>
                  ) : null;
                })}
              </div>
            </div>
            <div style={{ padding: "8px 14px", borderTop: "0.5px solid rgba(255,255,255,.06)" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", margin: "0 0 6px", letterSpacing: "0.06em" }}>PROTOCOLO DE TREINO</p>
              {pf.protocolo.map((ex, k) => {
                const pColor = ({ ALONGADO: "#34D399", ENCURTADO: "#FBBF24", CONSTANTE: "#38BDF8" } as const)[ex.perfil];
                return (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: k < pf.protocolo.length - 1 ? "0.5px solid rgba(255,255,255,.05)" : "none" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.8)", margin: "0 0 2px" }}>
                        {ex.exercicio}
                        {ex.smh && <span style={{ fontSize: 9, color: "#34D399", marginLeft: 5 }}>SMH</span>}
                        {ex.prioridade === "CRITICA" && <span style={{ fontSize: 9, color: "#B8922A", marginLeft: 4 }}>★</span>}
                      </p>
                      <div style={{ display: "flex", gap: 4 }}>
                        <span style={{ fontSize: 9, color: pColor, background: `${pColor}12`, borderRadius: 4, padding: "0 4px" }}>{ex.perfil}</span>
                        <span style={{ fontSize: 9, color: "rgba(184,146,42,.7)", background: "rgba(184,146,42,.1)", borderRadius: 4, padding: "0 4px" }}>Z{ex.zona}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", whiteSpace: "nowrap" }}>{ex.series}×{ex.reps}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={onOpenAnamnese} style={{ flex: 1, padding: "10px", background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: PURPLE }}>
          Refinar com anamnese feminina
        </button>
        <button onClick={onSendToTrainingOn} style={{ flex: 2, padding: "12px", background: "rgba(52,211,153,0.15)", border: "0.5px solid rgba(52,211,153,0.35)", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>⬡</span> Enviar protocolo para o TrainingON
        </button>
      </div>

      <p style={{ marginTop: 16, fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
        Timeline esperada de desenvolvimento: <strong style={{ color: PURPLE }}>{diagnostic.timeline_semanas} semanas</strong>
      </p>
    </div>
  );
}

/* ───────────────────────── CICLO INDICATOR ───────────────────────── */
function CicloIndicator({ fase }: { fase: Fase }) {
  const cfg = FASE_CONFIG[fase];
  return (
    <div style={{ padding: "6px 12px", background: cfg.bg, border: `0.5px solid ${cfg.border}`, borderRadius: 10, display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.cor, flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: cfg.cor, margin: 0 }}>{cfg.label}</p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: 0 }}>{cfg.instrucao}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── ANAMNESE FORM ───────────────────────── */
function AnamneseFemininaForm({ initial, onComplete }: { initial: AnamneseFeminina; onComplete: (d: AnamneseFeminina) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AnamneseFeminina>(initial);
  const steps = ["Ciclo", "Anticoncepcional", "Histórico", "Farmacologia", "Objetivos"];

  const setField = <K extends keyof AnamneseFeminina>(k: K, v: AnamneseFeminina[K]) =>
    setData((s) => ({ ...s, [k]: v }));

  const stepTitles = ["Ciclo menstrual", "Anticoncepcionais", "Histórico", "Farmacologia", "Objetivos"];

  return (
    <div style={{ padding: "20px 0 40px", maxWidth: 720, margin: "0 auto" }}>
      {/* Barras superiores de progresso */}
      <div style={{ padding: "0 24px 18px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {steps.map((s, i) => {
            const idx = i + 1;
            const active = idx === step;
            const done = idx < step;
            return (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 2, borderRadius: 1, background: done || active ? PURPLE : "rgba(255,255,255,0.08)", transition: "background .3s" }} />
                <p style={{ fontSize: 9, marginTop: 5, color: active ? PURPLE : done ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 0 }}>{s}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card do step atual */}
      <div style={{ padding: "0 24px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", background: "rgba(167,139,250,0.04)" }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(167,139,250,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px" }}>{`0${step} / 0${steps.length}`}</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.9)", margin: 0 }}>{stepTitles[step - 1]}</p>
          </div>

          <div style={{ padding: 20 }}>
            {/* STEP 1 — Ciclo */}
            {step === 1 && (
              <div>
                <FieldLabel>Dia atual do ciclo (1-28)</FieldLabel>
                <input type="number" min={1} max={28} placeholder="Ex: 8" value={data.dia_ciclo_atual ?? ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (isNaN(v)) { setField("dia_ciclo_atual", null); setField("fase_atual", "NAO_INFORMADO"); return; }
                    setField("dia_ciclo_atual", v);
                    setField("fase_atual", detectFase(v));
                  }} style={inputStyle} />
                {data.fase_atual !== "NAO_INFORMADO" && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: FASE_CONFIG[data.fase_atual].bg, border: `0.5px solid ${FASE_CONFIG[data.fase_atual].border}`, borderRadius: 8, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: FASE_CONFIG[data.fase_atual].cor, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: FASE_CONFIG[data.fase_atual].cor }}>Fase detectada: {FASE_CONFIG[data.fase_atual].label}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{FASE_CONFIG[data.fase_atual].instrucao}</span>
                  </div>
                )}

                <FieldLabel className="mt-4">Ciclo regular?</FieldLabel>
                <YesNo value={data.ciclo_regular} onChange={(v) => setField("ciclo_regular", v)} />

                <FieldLabel className="mt-4">Duração média do ciclo (dias)</FieldLabel>
                <input type="number" min={20} max={45} value={data.duracao_ciclo}
                  onChange={(e) => setField("duracao_ciclo", parseInt(e.target.value) || 28)} style={inputStyle} />
              </div>
            )}

            {/* STEP 2 — Anticoncepcional */}
            {step === 2 && (
              <div>
                <FieldLabel>Usa anticoncepcional?</FieldLabel>
                <YesNo value={data.usa_anticoncepcional} onChange={(v) => setField("usa_anticoncepcional", v)} />
                {data.usa_anticoncepcional && (
                  <>
                    <FieldLabel className="mt-4">Tipo</FieldLabel>
                    {[
                      { v: "COMBINADO_ORAL", l: "Pílula combinada" },
                      { v: "DIU_HORMONAL", l: "DIU hormonal (Mirena)" },
                      { v: "DIU_COBRE", l: "DIU de cobre" },
                      { v: "INJETAVEL", l: "Injetável (Depo-Provera)" },
                      { v: "IMPLANTE", l: "Implante subdérmico" },
                      { v: "OUTRO", l: "Outro" },
                    ].map((opt) => (
                      <OptionButton key={opt.v} selected={data.tipo_anticoncepcional === opt.v} onClick={() => setField("tipo_anticoncepcional", opt.v)}>{opt.l}</OptionButton>
                    ))}
                    <FieldLabel className="mt-4">Nome comercial (opcional)</FieldLabel>
                    <input type="text" placeholder="Ex: Yasmin, Mirena…" value={data.anticoncepcional_nome}
                      onChange={(e) => setField("anticoncepcional_nome", e.target.value)} style={inputStyle} />
                  </>
                )}
              </div>
            )}

            {/* STEP 3 — Histórico */}
            {step === 3 && (
              <div>
                <FieldLabel>Histórico de dieta restritiva?</FieldLabel>
                <YesNo value={data.historico_dieta_restritiva} onChange={(v) => setField("historico_dieta_restritiva", v)} />
                {data.historico_dieta_restritiva && (
                  <>
                    <FieldLabel className="mt-3">Por quantos anos?</FieldLabel>
                    <input type="number" min={0} max={40} value={data.anos_restricao ?? ""} onChange={(e) => setField("anos_restricao", parseInt(e.target.value) || null)} style={inputStyle} />
                  </>
                )}

                <FieldLabel className="mt-4">Gestação recente?</FieldLabel>
                <YesNo value={data.gestacao_recente} onChange={(v) => setField("gestacao_recente", v)} />
                {data.gestacao_recente && (
                  <>
                    <FieldLabel className="mt-3">Quantos meses pós-parto?</FieldLabel>
                    <input type="number" min={0} max={60} value={data.meses_pos_parto ?? ""} onChange={(e) => setField("meses_pos_parto", parseInt(e.target.value) || null)} style={inputStyle} />
                  </>
                )}

                <FieldLabel className="mt-4">Menopausa?</FieldLabel>
                <YesNo value={data.menopausa} onChange={(v) => setField("menopausa", v)} />

                <FieldLabel className="mt-4">Perimenopausa?</FieldLabel>
                <YesNo value={data.perimenopausa} onChange={(v) => setField("perimenopausa", v)} />

                <FieldLabel className="mt-4">Histórico de transtorno alimentar?</FieldLabel>
                <YesNo value={data.historico_ta} onChange={(v) => setField("historico_ta", v)} />
                {data.historico_ta && (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                    <p style={{ fontSize: 10, color: "#fca5a5", margin: 0 }}>Abordagem especial — encaminhar para equipe multidisciplinar antes de qualquer déficit calórico.</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 — Farmacologia */}
            {step === 4 && (
              <div>
                <FieldLabel>Uso de EAAs?</FieldLabel>
                <YesNo value={data.usa_eaa} onChange={(v) => setField("usa_eaa", v)} />
                {data.usa_eaa && (
                  <>
                    <FieldLabel className="mt-3">Compostos em uso</FieldLabel>
                    <textarea rows={3} placeholder="Ex: Oxandrolona 10mg/dia, Primobolan 50mg/sem…" value={data.compostos_em_uso}
                      onChange={(e) => setField("compostos_em_uso", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
                    <FieldLabel className="mt-3">Ciclos anteriores</FieldLabel>
                    <input type="number" min={0} max={50} value={data.ciclos_anteriores}
                      onChange={(e) => setField("ciclos_anteriores", parseInt(e.target.value) || 0)} style={inputStyle} />
                  </>
                )}
              </div>
            )}

            {/* STEP 5 — Objetivos */}
            {step === 5 && (
              <div>
                <FieldLabel>Objetivo principal</FieldLabel>
                {[
                  { v: "EMAGRECIMENTO", l: "Emagrecimento" },
                  { v: "HIPERTROFIA", l: "Hipertrofia" },
                  { v: "RECOMP", l: "Recomposição corporal" },
                  { v: "COMPETICAO", l: "Competição" },
                  { v: "SAUDE", l: "Saúde / longevidade" },
                ].map((opt) => (
                  <OptionButton key={opt.v} selected={data.objetivo_principal === opt.v} onClick={() => setField("objetivo_principal", opt.v)}>{opt.l}</OptionButton>
                ))}

                {data.objetivo_principal === "COMPETICAO" && (
                  <>
                    <FieldLabel className="mt-3">Categoria de competição</FieldLabel>
                    <input type="text" placeholder="Ex: Wellness, Bikini, Figure…" value={data.categoria_competicao}
                      onChange={(e) => setField("categoria_competicao", e.target.value)} style={inputStyle} />
                  </>
                )}

                <FieldLabel className="mt-4">Pontos fracos</FieldLabel>
                <input type="text" placeholder="Ex: glúteo, posterior de coxa…" value={data.pontos_fracos}
                  onChange={(e) => setField("pontos_fracos", e.target.value)} style={inputStyle} />

                <FieldLabel className="mt-4">Lesões / restrições</FieldLabel>
                <input type="text" placeholder="Ex: lombar, joelho direito…" value={data.lesoes}
                  onChange={(e) => setField("lesoes", e.target.value)} style={inputStyle} />
              </div>
            )}
          </div>
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} style={{ flex: 1, padding: 13, background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 12, cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>← Voltar</button>
          )}
          <button
            onClick={() => { if (step < steps.length) setStep((s) => s + 1); else onComplete(data); }}
            style={{ flex: 2, padding: 13, background: "rgba(167,139,250,0.18)", border: "0.5px solid rgba(167,139,250,0.4)", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, color: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.04em", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(167,139,250,0.25)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(167,139,250,0.18)"; e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"; }}
          >
            {step < steps.length ? "Continuar" : "Iniciar VERA"}
            <span style={{ fontSize: 14 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}


const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "0.5px solid rgba(255,255,255,0.12)",
  borderRadius: 10, fontSize: 13,
  color: "rgba(255,255,255,0.85)", outline: "none",
};
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", marginBottom: 14 }}>{children}</p>;
}
function FieldLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={className} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{children}</p>;
}
function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {([["Sim", true], ["Não", false]] as const).map(([l, v]) => {
        const active = value === v;
        return (
          <button key={l} onClick={() => onChange(v)} style={{
            flex: 1, padding: 8,
            background: active ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
            border: `0.5px solid ${active ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8, cursor: "pointer", fontSize: 12,
            color: active ? PURPLE : "rgba(255,255,255,0.5)", transition: "all .15s",
          }}>{l}</button>
        );
      })}
    </div>
  );
}
function OptionButton({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "block", width: "100%", padding: "8px 12px", marginBottom: 5,
      background: selected ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
      border: `0.5px solid ${selected ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 8, cursor: "pointer", fontSize: 12, textAlign: "left",
      color: selected ? PURPLE : "rgba(255,255,255,0.55)", transition: "all .15s",
    }}>{children}</button>
  );
}

/* ───────────────────────── CHAT ───────────────────────── */
function buildVeraContext(a: AnamneseFeminina): string {
  return `
DADOS DA ALUNA:
Objetivo: ${a.objetivo_principal || "Não informado"}
Categoria: ${a.categoria_competicao || "Não informado"}
Pontos fracos: ${a.pontos_fracos || "Não informado"}
Lesões: ${a.lesoes || "Nenhuma"}

CICLO MENSTRUAL:
Dia atual: ${a.dia_ciclo_atual ?? "Não informado"}
Fase: ${a.fase_atual}
Ciclo regular: ${a.ciclo_regular === null ? "Não informado" : a.ciclo_regular ? "Sim" : "Não"}
Duração média: ${a.duracao_ciclo} dias

ANTICONCEPCIONAL:
Em uso: ${a.usa_anticoncepcional ? "Sim" : "Não"}
Tipo: ${a.tipo_anticoncepcional ?? "—"}
Nome: ${a.anticoncepcional_nome || "—"}

HISTÓRICO:
Dieta restritiva: ${a.historico_dieta_restritiva ? `Sim — ${a.anos_restricao ?? "?"} anos` : "Não"}
Pós-parto: ${a.gestacao_recente ? `Sim — ${a.meses_pos_parto ?? "?"} meses` : "Não"}
Menopausa: ${a.menopausa ? "Sim" : "Não"} | Perimenopausa: ${a.perimenopausa ? "Sim" : "Não"}
Histórico TA: ${a.historico_ta ? "SIM — ABORDAGEM ESPECIAL, equipe multidisciplinar obrigatória" : "Não"}

FARMACOLOGIA:
EAA em uso: ${a.usa_eaa ? "Sim" : "Não"}
Compostos: ${a.compostos_em_uso || "Nenhum"}
Ciclos anteriores: ${a.ciclos_anteriores}
  `.trim();
}

function VeraChat({ anamnese, onEditAnamnese }: { anamnese: AnamneseFeminina; onEditAnamnese: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vera-agent`;
      const resp = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          system: VERA_AGENT_SYSTEM,
          athleteContext: buildVeraContext(anamnese),
          messages: next,
        }),
      });
      if (resp.status === 429) { toast.error("Limite de requisições — aguarde."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos esgotados no workspace."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Falha na VERA");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", soFar = "", done = false;
      setMessages((p) => [...p, { role: "assistant", content: "" }]);
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl); buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              soFar += delta;
              setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: soFar } : m));
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e: any) {
      console.error(e); toast.error(e?.message || "Erro na VERA");
    } finally { setLoading(false); }
  }

  const quickActions = [
    "Prescrever treino da semana adaptado à fase do ciclo atual (JSON estruturado).",
    "Avaliar impacto do anticoncepcional nos resultados e ajustar expectativas.",
    "Montar protocolo de 4 semanas para glúteo + posterior com SMH prioritário.",
    "Análise farmacológica feminina com risco virilizante e alternativas seguras.",
    "Diagnóstico de falsa magra e protocolo de recomp adequado.",
    "Estratégia de emagrecimento feminino sem perda de massa muscular.",
  ];

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Context bar */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onEditAnamnese} className="text-[11px] underline" style={{ color: PURPLE }}>+ editar anamnese</button>
        <div className="flex gap-1.5 flex-wrap">
          {anamnese.historico_ta && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertTriangle className="w-2.5 h-2.5" /> Histórico TA
            </span>
          )}
          {anamnese.usa_eaa && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              <ShieldAlert className="w-2.5 h-2.5" /> EAA
            </span>
          )}
        </div>
      </div>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, display: "flex", flexDirection: "column", minHeight: 560 }}>
        {/* Quick actions */}
        {messages.length === 0 && (
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Ações rápidas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickActions.map((p, i) => (
                <button key={i} onClick={() => send(p)} disabled={loading}
                  className="text-left text-[11px] font-medium px-3 py-2 rounded-lg transition hover:scale-[1.01] disabled:opacity-50"
                  style={{ background: "rgba(167,139,250,0.06)", border: `0.5px solid rgba(167,139,250,0.2)`, color: "rgba(255,255,255,0.75)" }}>
                  <Heart className="w-3 h-3 inline mr-1.5" style={{ color: PURPLE }} />{p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 520 }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[88%] px-3 py-2.5 rounded-xl text-[12px] leading-relaxed"
                style={{
                  background: m.role === "user" ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${m.role === "user" ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.06)"}`,
                  color: "rgba(255,255,255,0.9)",
                }}>
                <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_code]:text-[10px]">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-[11px]" style={{ color: PURPLE }}>
              <Loader2 className="w-3 h-3 animate-spin" /> VERA analisando…
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 flex gap-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Pergunte sobre ciclo, ACO, EAA, biomecânica feminina, adesão…"
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(167,139,250,0.2)`, color: "rgba(255,255,255,0.9)" }} />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="px-3 rounded-lg disabled:opacity-40"
            style={{ background: "rgba(167,139,250,0.2)", border: `1px solid rgba(167,139,250,0.4)`, color: PURPLE }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── TABS WRAPPER (Chat + Farmacologia) ───────────────────────── */
function VeraChatTabs({ anamnese, onEditAnamnese }: { anamnese: AnamneseFeminina; onEditAnamnese: () => void }) {
  const [tab, setTab] = useState<"chat" | "farmaco">("chat");
  const tabs: Array<{ id: "chat" | "farmaco"; label: string; icon: string }> = [
    { id: "chat", label: "VERA Chat", icon: "✦" },
    { id: "farmaco", label: "Farmacologia", icon: "✚" },
  ];
  return (
    <div>
      <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.08)", padding: "0 24px", gap: 0, overflowX: "auto" }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 16px", background: "transparent", border: "none",
              borderBottom: active ? "2px solid #A78BFA" : "2px solid transparent",
              cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400,
              color: active ? PURPLE : "rgba(255,255,255,0.4)",
              transition: "all .2s", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
      <div>
        {tab === "chat"
          ? <VeraChat anamnese={anamnese} onEditAnamnese={onEditAnamnese} />
          : <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 0" }}><VeraFarmacoTab anamnese={anamnese} /></div>}
      </div>
    </div>
  );
}


/* ───────────────────────── FARMACOLOGIA TAB ───────────────────────── */
function VeraFarmacoTab({ anamnese }: { anamnese: AnamneseFeminina }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlerta, setShowAlerta] = useState(!anamnese.usa_eaa);

  const quickActions = [
    { label: "Protocolo para o objetivo dela", prompt: `Com base no objetivo "${anamnese.objetivo_principal || "não informado"}" e no uso de anticoncepcional "${anamnese.tipo_anticoncepcional ?? "não informado"}", recomende o protocolo farmacológico feminino mais adequado com doses, timing, farmacocinética e suporte hepático.` },
    { label: "Analisar ciclo atual", prompt: `Analise o protocolo atual: "${anamnese.compostos_em_uso || "nenhum"}". Avalie dose, timing, risco virilizante, interações com o ciclo menstrual (fase ${anamnese.fase_atual}) e com o anticoncepcional em uso.` },
    { label: "TPC feminina completa", prompt: `Monte o protocolo completo de TPC feminina pós-ciclo de "${anamnese.compostos_em_uso || "compostos típicos"}". Incluir compostos, doses, duração e exames de acompanhamento.` },
    { label: "Farmacocinética × ciclo", prompt: `Como a fase ${anamnese.fase_atual} do ciclo menstrual afeta a farmacocinética dos compostos em uso? Qual o melhor momento para aplicar e como adaptar a dose?` },
    { label: "Checklist pré-ciclo", prompt: `Gere o checklist completo de exames e critérios que devem ser cumpridos antes de iniciar o próximo ciclo para esta atleta.` },
    { label: "Identificar sinais de virilização", prompt: `Quais sinais de virilização monitorar semanalmente com o protocolo atual? O que é reversível e o que é irreversível? Quando suspender imediatamente?` },
  ];

  async function consultar(userPrompt: string) {
    if (!userPrompt.trim() || loading) return;
    setLoading(true);
    setResponse("");
    try {
      const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vera-agent`;
      const resp = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          system: VERA_AGENT_SYSTEM + "\n\n" + VERA_PHARMA_MODULE,
          athleteContext: buildVeraContext(anamnese),
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      if (resp.status === 429) { toast.error("Limite de requisições — aguarde."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos esgotados no workspace."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Falha na VERA");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", soFar = "", done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl); buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { soFar += delta; setResponse(soFar); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e: any) {
      console.error(e); toast.error(e?.message || "Erro na VERA");
    } finally { setLoading(false); }
  }

  const contextChips = [
    { label: "Fase", value: anamnese.fase_atual },
    { label: "AC", value: anamnese.usa_anticoncepcional ? (anamnese.tipo_anticoncepcional ?? "Sim") : "Sem AC" },
    { label: "Em uso", value: anamnese.compostos_em_uso || "Nenhum" },
    { label: "Ciclos", value: String(anamnese.ciclos_anteriores) },
  ];

  return (
    <div style={{ padding: "16px 0 32px" }}>
      {showAlerta && (
        <div style={{ margin: "0 0 16px", padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#EF4444", margin: 0 }}>⚠ Leia antes de prosseguir</p>
            <button onClick={() => setShowAlerta(false)} style={{ fontSize: 11, color: "rgba(255,255,255,.3)", background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.55)", margin: "0 0 6px", lineHeight: 1.6 }}>
            O uso de EAAs em mulheres envolve riscos de colaterais IRREVERSÍVEIS — especialmente engrossamento da voz e clitoromegalia avançada.
          </p>
          <p style={{ fontSize: 10, color: "rgba(239,68,68,.7)", margin: 0, fontStyle: "italic" }}>
            A VERA oferece informação técnica expert. Toda decisão de uso é de responsabilidade da atleta e do médico responsável.
          </p>
        </div>
      )}

      <div style={{ margin: "0 0 16px", padding: "8px 14px", background: "rgba(167,139,250,0.07)", border: "0.5px solid rgba(167,139,250,0.2)", borderRadius: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {contextChips.map((item, i) => (
          <div key={i}>
            <span style={{ fontSize: 9, color: "rgba(167,139,250,.5)" }}>{item.label}: </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: PURPLE }}>{item.value}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: "0.08em", margin: "0 0 8px", textTransform: "uppercase" }}>
        Consultas frequentes
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {quickActions.map((action, i) => (
          <button key={i} onClick={() => consultar(action.prompt)} disabled={loading}
            style={{ padding: "8px 10px", background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.15)", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", fontSize: 11, textAlign: "left", color: "rgba(255,255,255,.55)", lineHeight: 1.4 }}>
            {action.label}
          </button>
        ))}
      </div>

      {loading && !response && (
        <div className="flex items-center gap-2 text-[11px]" style={{ color: PURPLE, padding: "12px 0" }}>
          <Loader2 className="w-3 h-3 animate-spin" /> VERA analisando…
        </div>
      )}

      {response && (
        <div style={{ padding: "14px 16px", background: "rgba(255,255,255,.03)", border: "0.5px solid rgba(167,139,250,.15)", borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: PURPLE, letterSpacing: "0.08em" }}>✦ VERA — Análise Farmacológica</span>
            <button onClick={() => { navigator.clipboard.writeText(response); toast.success("Copiado"); }}
              style={{ fontSize: 10, color: "rgba(167,139,250,.5)", background: "transparent", border: "none", cursor: "pointer" }}>
              Copiar
            </button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-[#A78BFA]">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); consultar(query); setQuery(""); } }}
          placeholder="Pergunte sobre doses, timing, interações, TPC feminina…"
          disabled={loading}
          style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,.05)", border: "0.5px solid rgba(167,139,250,.2)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,.8)", outline: "none" }} />
        <button onClick={() => { consultar(query); setQuery(""); }} disabled={loading || !query.trim()}
          style={{ padding: "10px 16px", background: loading || !query.trim() ? "rgba(255,255,255,.04)" : "rgba(167,139,250,.2)", border: `0.5px solid ${loading || !query.trim() ? "rgba(255,255,255,.08)" : "rgba(167,139,250,.4)"}`, borderRadius: 10, cursor: loading || !query.trim() ? "not-allowed" : "pointer", fontSize: 13, color: loading || !query.trim() ? "rgba(255,255,255,.2)" : PURPLE }}>
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p style={{ marginTop: 16, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", fontStyle: "italic" }}>
        Farmacologia feminina exclusiva da VERA — não duplica o Dr. VERTEX (masculino).
      </p>
    </div>
  );
}
