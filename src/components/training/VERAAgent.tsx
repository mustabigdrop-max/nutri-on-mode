import { useState, useEffect, useRef } from "react";
import { Flower2, Send, Sparkles, Loader2, AlertTriangle, Heart, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { VERA_AGENT_SYSTEM } from "@/utils/veraAgentPrompt";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  userId?: string;
  apexProtocol?: string | null;
  athleteData?: any;
}

// Feminine identity tokens (rose/pink), still dark-themed
const ROSE = "#f472b6";
const ROSE_DIM = "rgba(244,114,182,0.1)";
const SURFACE = "#120a10";
const BORDER = "rgba(244,114,182,0.18)";

interface FeminineAnamnesis {
  fase_ciclo: string;
  dia_ciclo: string;
  anticoncepcional: string;
  historico_dieta: string;
  gestacao_recente: boolean;
  menopausa: boolean;
  historico_ta: boolean;
  uso_eaa: boolean;
  compostos_em_uso: string;
}

const DEFAULT_ANAMNESIS: FeminineAnamnesis = {
  fase_ciclo: "NAO_INFORMADO",
  dia_ciclo: "",
  anticoncepcional: "nenhum",
  historico_dieta: "normal",
  gestacao_recente: false,
  menopausa: false,
  historico_ta: false,
  uso_eaa: false,
  compostos_em_uso: "",
};

export default function VERAAgent({ userId, apexProtocol, athleteData }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnamnesis, setShowAnamnesis] = useState(true);
  const [anamnesis, setAnamnesis] = useState<FeminineAnamnesis>(DEFAULT_ANAMNESIS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear history when athlete changes
  useEffect(() => {
    setMessages([]);
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const buildContext = () => `
CONTEXTO DA ATLETA FEMININA:
Nome: ${athleteData?.nome ?? "Atleta"}
Categoria: ${athleteData?.categoria ?? "—"}
Nível: ${athleteData?.nivel ?? "—"}
BF atual: ${athleteData?.bf_estimado ?? "--"}%
Pontos fracos: ${athleteData?.pontos_fracos ?? "Não informado"}
Lesões: ${athleteData?.lesoes ?? "Nenhuma"}

ANAMNESE FEMININA:
Fase do ciclo: ${anamnesis.fase_ciclo}${anamnesis.dia_ciclo ? ` (dia ${anamnesis.dia_ciclo})` : ""}
Anticoncepcional: ${anamnesis.anticoncepcional}
Histórico de dieta: ${anamnesis.historico_dieta}
Gestação recente: ${anamnesis.gestacao_recente ? "SIM" : "não"}
Menopausa/perimenopausa: ${anamnesis.menopausa ? "SIM" : "não"}
Histórico de transtorno alimentar: ${anamnesis.historico_ta ? "SIM — atenção redobrada" : "não"}
Uso de EAAs: ${anamnesis.uso_eaa ? "SIM" : "não"}
${anamnesis.uso_eaa && anamnesis.compostos_em_uso ? `Compostos em uso: ${anamnesis.compostos_em_uso}` : ""}

PROTOCOLO APEX:
${apexProtocol ?? "Não disponível"}
`.trim();

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setShowAnamnesis(false);

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
          athleteContext: buildContext(),
          messages: next,
        }),
      });

      if (resp.status === 429) { toast.error("Limite de requisições — aguarde."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos esgotados no workspace."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Falha na VERA");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let soFar = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              soFar += delta;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: soFar } : m));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro na VERA");
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { label: "Prescrever treino por fase do ciclo", prompt: "Gere o treino da semana considerando a fase atual do ciclo menstrual informada. Adaptar zona, RIR e volume conforme protocolo Darkside Feminino. Retornar JSON com adaptacoes_fase e alertas_femininos." },
    { label: "Avaliar anticoncepcional × resultados", prompt: "Analise o impacto do anticoncepcional em uso nos resultados esperados (massa, retenção, libido, força) e sugira ajustes na expectativa e no protocolo." },
    { label: "Protocolo glúteo + posterior (4 sem)", prompt: "Monte protocolo específico de 4 semanas para desenvolvimento de glúteo e posterior de coxa com biomecânica feminina correta e SMH prioritário em isquiotibiais. Retornar JSON estruturado." },
    { label: "Análise farmacológica feminina", prompt: "Analise o protocolo farmacológico informado com foco em risco virilizante, separar colaterais reversíveis vs irreversíveis e propor alternativas mais seguras para o objetivo." },
    { label: "Diagnóstico falsa magra", prompt: "Com base nos dados da aluna, avaliar se há perfil de falsa magra e prescrever protocolo de recomp adequado (calorias, proteína, expectativa temporal, métricas a monitorar)." },
    { label: "Estratégia de emagrecimento feminino", prompt: "Considerando variáveis fisiológicas femininas (estradiol, leptina, tireoide, cortisol) e o histórico da aluna, montar estratégia de emagrecimento sem perda de massa muscular." },
  ];

  return (
    <div className="rounded-2xl flex flex-col" style={{ background: SURFACE, border: `1px solid ${BORDER}`, minHeight: 560 }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ROSE_DIM, border: `1px solid ${BORDER}` }}>
            <Flower2 className="w-4 h-4" style={{ color: ROSE }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#fdf2f8" }}>VERA</p>
            <p className="text-[10px]" style={{ color: "#9ca3af" }}>Agente de coaching feminino · Darkside × nutriON</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {apexProtocol && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(232,160,32,0.12)", color: "#E8A020", border: "1px solid rgba(232,160,32,0.3)" }}>APEX</span>
          )}
          {anamnesis.fase_ciclo !== "NAO_INFORMADO" && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: ROSE_DIM, color: ROSE, border: `1px solid ${BORDER}` }}>{anamnesis.fase_ciclo}</span>
          )}
          {anamnesis.uso_eaa && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              <ShieldAlert className="w-2.5 h-2.5" /> EAA
            </span>
          )}
          {anamnesis.historico_ta && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>TA</span>
          )}
        </div>
      </div>

      {/* Anamnese feminina */}
      {showAnamnesis && (
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase tracking-widest" style={{ color: "#9ca3af" }}>Anamnese feminina</p>
            <button onClick={() => setShowAnamnesis(false)} className="text-[10px]" style={{ color: ROSE }}>ocultar</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Field label="Fase do ciclo">
              <select value={anamnesis.fase_ciclo} onChange={e => setAnamnesis(s => ({ ...s, fase_ciclo: e.target.value }))} className="w-full text-[11px] px-2 py-1.5 rounded-md outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#fdf2f8" }}>
                <option value="NAO_INFORMADO">não informado</option>
                <option value="FOLICULAR">folicular</option>
                <option value="OVULACAO">ovulação</option>
                <option value="LUTEA">lútea</option>
                <option value="MENSTRUACAO">menstruação</option>
              </select>
            </Field>
            <Field label="Dia do ciclo">
              <input value={anamnesis.dia_ciclo} onChange={e => setAnamnesis(s => ({ ...s, dia_ciclo: e.target.value }))} placeholder="ex: 14" className="w-full text-[11px] px-2 py-1.5 rounded-md outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#fdf2f8" }} />
            </Field>
            <Field label="Anticoncepcional">
              <select value={anamnesis.anticoncepcional} onChange={e => setAnamnesis(s => ({ ...s, anticoncepcional: e.target.value }))} className="w-full text-[11px] px-2 py-1.5 rounded-md outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#fdf2f8" }}>
                <option value="nenhum">nenhum</option>
                <option value="combinado_oral">combinado oral</option>
                <option value="diu_mirena">DIU Mirena</option>
                <option value="diu_cobre">DIU cobre</option>
                <option value="depo_provera">Depo-Provera</option>
                <option value="implante">implante</option>
                <option value="adesivo">adesivo</option>
              </select>
            </Field>
            <Field label="Histórico de dieta">
              <select value={anamnesis.historico_dieta} onChange={e => setAnamnesis(s => ({ ...s, historico_dieta: e.target.value }))} className="w-full text-[11px] px-2 py-1.5 rounded-md outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#fdf2f8" }}>
                <option value="normal">normal</option>
                <option value="restritivo_recente">restritivo recente</option>
                <option value="restritivo_cronico">restritivo crônico</option>
                <option value="reganho">pós-reganho</option>
              </select>
            </Field>
            <Toggle label="Gestação recente" value={anamnesis.gestacao_recente} onChange={v => setAnamnesis(s => ({ ...s, gestacao_recente: v }))} />
            <Toggle label="Menopausa" value={anamnesis.menopausa} onChange={v => setAnamnesis(s => ({ ...s, menopausa: v }))} />
            <Toggle label="Histórico TA" value={anamnesis.historico_ta} onChange={v => setAnamnesis(s => ({ ...s, historico_ta: v }))} />
            <Toggle label="Uso de EAA" value={anamnesis.uso_eaa} onChange={v => setAnamnesis(s => ({ ...s, uso_eaa: v }))} />
            {anamnesis.uso_eaa && (
              <Field label="Compostos em uso">
                <input value={anamnesis.compostos_em_uso} onChange={e => setAnamnesis(s => ({ ...s, compostos_em_uso: e.target.value }))} placeholder="ex: oxandrolona 10mg" className="w-full text-[11px] px-2 py-1.5 rounded-md outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#fdf2f8" }} />
              </Field>
            )}
          </div>
          {anamnesis.historico_ta && (
            <div className="mt-2 p-2 rounded-md flex items-start gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#f87171" }} />
              <p className="text-[10px]" style={{ color: "#fca5a5" }}>Histórico de TA — déficit agressivo contraindicado. Acompanhamento psicológico obrigatório.</p>
            </div>
          )}
        </div>
      )}

      {!showAnamnesis && (
        <div className="px-4 pt-2">
          <button onClick={() => setShowAnamnesis(true)} className="text-[10px]" style={{ color: ROSE }}>+ editar anamnese</button>
        </div>
      )}

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="px-4 py-3">
          <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#9ca3af" }}>Ações rápidas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => sendMessage(a.prompt)}
                disabled={loading}
                className="text-left text-[11px] font-medium px-3 py-2 rounded-lg transition hover:scale-[1.01] disabled:opacity-50"
                style={{ background: "rgba(244,114,182,0.05)", border: `1px solid ${BORDER}`, color: "#e5e7eb" }}
              >
                <Heart className="w-3 h-3 inline mr-1.5" style={{ color: ROSE }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 480 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[88%] px-3 py-2.5 rounded-xl text-[12px] leading-relaxed"
              style={{
                background: m.role === "user" ? ROSE_DIM : "rgba(255,255,255,0.04)",
                border: `1px solid ${m.role === "user" ? BORDER : "rgba(255,255,255,0.06)"}`,
                color: "#f3e8ff",
              }}
            >
              <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_code]:text-[10px]">
                <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: ROSE }}>
            <Loader2 className="w-3 h-3 animate-spin" /> VERA analisando…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 flex gap-2" style={{ borderTop: `1px solid ${BORDER}` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Pergunte sobre ciclo, ACO, EAAs, biomecânica feminina, adesão…"
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#fdf2f8" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-3 rounded-lg disabled:opacity-40"
          style={{ background: "rgba(244,114,182,0.2)", border: `1px solid ${BORDER}`, color: ROSE }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "#6b7280" }}>{label}</p>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="text-left px-2 py-1.5 rounded-md text-[11px] font-medium transition"
      style={{
        background: value ? ROSE_DIM : "rgba(255,255,255,0.03)",
        border: `1px solid ${value ? BORDER : "rgba(255,255,255,0.06)"}`,
        color: value ? ROSE : "#9ca3af",
      }}
    >
      {value ? "✓" : "○"} {label}
    </button>
  );
}
