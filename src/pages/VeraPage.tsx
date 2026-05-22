import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Send, Loader2, AlertTriangle, Heart, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VERA_AGENT_SYSTEM } from "@/utils/veraAgentPrompt";

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
  const [phase, setPhase] = useState<"intake" | "chat">("intake");
  const [anamnese, setAnamnese] = useState<AnamneseFeminina>(EMPTY);
  const [loadingExisting, setLoadingExisting] = useState(true);

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
    <div className="min-h-screen" style={{ background: BG, color: "rgba(255,255,255,0.85)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `0.5px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-white/5" aria-label="Voltar">
            <ArrowLeft className="w-4 h-4" style={{ color: PURPLE }} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em" }}>VERA</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: PURPLE, background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)", borderRadius: 8, padding: "2px 8px", letterSpacing: "0.1em" }}>FEMININO</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>Visão Estratégica de Resultados Avançados</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {anamnese.fase_atual !== "NAO_INFORMADO" && phase === "chat" && (
            <CicloIndicator fase={anamnese.fase_atual} />
          )}
        </div>
      </div>

      {/* Body */}
      {loadingExisting ? (
        <div className="flex items-center justify-center p-10" style={{ color: PURPLE }}>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : phase === "intake" ? (
        <AnamneseFemininaForm initial={anamnese} onComplete={handleAnamneseComplete} />
      ) : (
        <VeraChat anamnese={anamnese} onEditAnamnese={() => setPhase("intake")} />
      )}
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

  return (
    <div style={{ padding: "20px", maxWidth: 640, margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          {steps.map((s, i) => (
            <span key={i} style={{ fontSize: 9, fontWeight: 500, color: i + 1 === step ? PURPLE : i + 1 < step ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s}</span>
          ))}
        </div>
        <div style={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(step / steps.length) * 100}%`, background: PURPLE, borderRadius: 1, transition: "width .3s" }} />
        </div>
      </div>

      {/* STEP 1 — Ciclo */}
      {step === 1 && (
        <div>
          <SectionTitle>Ciclo menstrual</SectionTitle>
          <FieldLabel>Dia atual do ciclo (1-28)</FieldLabel>
          <input
            type="number" min={1} max={28} placeholder="Ex: 8"
            value={data.dia_ciclo_atual ?? ""}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (isNaN(v)) { setField("dia_ciclo_atual", null); setField("fase_atual", "NAO_INFORMADO"); return; }
              setField("dia_ciclo_atual", v);
              setField("fase_atual", detectFase(v));
            }}
            style={inputStyle}
          />
          {data.fase_atual !== "NAO_INFORMADO" && (
            <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.2)", borderRadius: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: PURPLE }}>Fase detectada:</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: PURPLE }}>{data.fase_atual}</span>
            </div>
          )}

          <FieldLabel className="mt-4">Ciclo regular?</FieldLabel>
          <YesNo value={data.ciclo_regular} onChange={(v) => setField("ciclo_regular", v)} />

          <FieldLabel className="mt-4">Duração média do ciclo (dias)</FieldLabel>
          <input type="number" min={20} max={45} value={data.duracao_ciclo}
            onChange={(e) => setField("duracao_ciclo", parseInt(e.target.value) || 28)}
            style={inputStyle} />
        </div>
      )}

      {/* STEP 2 — Anticoncepcional */}
      {step === 2 && (
        <div>
          <SectionTitle>Anticoncepcionais</SectionTitle>
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
          <SectionTitle>Histórico</SectionTitle>
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
          <SectionTitle>Farmacologia</SectionTitle>
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
          <SectionTitle>Objetivos</SectionTitle>
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

      {/* Nav buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} style={{ flex: 1, padding: 10, background: "transparent", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10, cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>← Voltar</button>
        )}
        <button
          onClick={() => { if (step < steps.length) setStep((s) => s + 1); else onComplete(data); }}
          style={{ flex: 2, padding: 10, background: "rgba(167,139,250,0.2)", border: "0.5px solid rgba(167,139,250,0.4)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: PURPLE }}
        >
          {step < steps.length ? "Continuar →" : "Iniciar VERA →"}
        </button>
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
