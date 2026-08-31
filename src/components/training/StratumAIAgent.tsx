import { useState, useEffect, useRef } from "react";
import { Brain, Send, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PERIODIZATION_AGENT_SYSTEM } from "@/utils/periodizationAgentPrompt";
import {
  fetchSupercompWindows,
  SupercompWindow,
} from "@/utils/supercompensation";
import { fetchRBEStatuses, RBEStatus } from "@/utils/repeatedBoutEffect";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  userId?: string;
  currentWeek?: number;
  totalWeeks?: number;
  apexProtocol?: string | null;
  athleteData?: any;
  recentExercises?: Array<{ name?: string; nome?: string }>;
}

const GREEN = "#4ade80";
const SURFACE = "#0c120c";
const BORDER = "rgba(74,222,128,0.15)";

export default function StratumAIAgent({
  userId,
  currentWeek = 1,
  totalWeeks = 8,
  apexProtocol,
  athleteData,
  recentExercises = [],
}: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [supercomp, setSupercomp] = useState<SupercompWindow[]>([]);
  const [rbe, setRbe] = useState<RBEStatus[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load contextual signals
  useEffect(() => {
    if (!userId) return;
    const muscles = ["peito", "costas", "ombro", "biceps", "triceps", "quadriceps", "posterior", "gluteo"];
    fetchSupercompWindows(userId, muscles).then(setSupercomp);
    if (recentExercises.length) {
      const mesoStart = new Date(); mesoStart.setDate(mesoStart.getDate() - 28);
      fetchRBEStatuses(userId, recentExercises, mesoStart.toISOString()).then(setRbe);
    }
  }, [userId, recentExercises.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const buildAthleteContext = () => `
CONTEXTO DO ATLETA:
Nome: ${athleteData?.nome ?? "Atleta"}
Categoria: ${athleteData?.categoria ?? "Classic Physique"}
Nível: ${athleteData?.nivel ?? "Avançado"}
BF atual: ${athleteData?.bf_estimado ?? "--"}%
BF meta: ${athleteData?.bf_meta ?? "--"}%
Semanas para show: ${athleteData?.semanas_show ?? "--"}
Semana do mesociclo: ${currentWeek} de ${totalWeeks}
Divisão atual: ${athleteData?.divisao ?? "PPL"}
Pontos fracos: ${athleteData?.pontos_fracos ?? "Não informado"}
Histórico de lesões: ${athleteData?.lesoes ?? "Nenhum"}
Estresse/recuperação: ${athleteData?.recuperacao ?? "Bom"}

PROTOCOLO CORRETIVO APEX:
${apexProtocol ?? "Não disponível — realizar análise APEX"}

SUPERCOMPENSAÇÃO:
${supercomp.filter(w => w.pronto).map(w => `• ${w.musculo}: janela aberta`).join("\n") || "Nenhuma janela aberta no momento"}

RBE ALERTAS:
${rbe.filter(s => s.alerta).map(s => `• ${s.exercicio}: bout ×${s.boutNumber} — estímulo ${s.stimuloEsperado}%`).join("\n") || "Nenhum alerta de RBE"}
`.trim();

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stratum-ai-agent`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          system: PERIODIZATION_AGENT_SYSTEM,
          athleteContext: buildAthleteContext(),
          messages: next,
        }),
      });

      if (resp.status === 429) { toast.error("Limite de requisições — aguarde."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos esgotados no workspace."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Falha no agente");

      // Stream
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
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
              assistantSoFar += delta;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro no STRATUM");
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { label: "Gerar treino de hoje", prompt: `Gere a sessão de treino completa para hoje (formato JSON). Semana ${currentWeek} de ${totalWeeks}. Integrar protocolo APEX e alertas do sistema.` },
    { label: "Analisar mesociclo", prompt: "Analise o mesociclo atual e sugira ajustes para as próximas semanas." },
    { label: "Protocolo para pontos fracos", prompt: "Com base nos pontos fracos e no protocolo APEX, monte um protocolo específico de 4 semanas para os grupos musculares deficientes." },
    { label: "Estratégia de peak week", prompt: `Monte a estratégia de treino das últimas 2 semanas e peak week para Classic Physique.` },
    { label: "Resolver platôs", prompt: "Analise platôs e prescreva os protocolos de quebra adequados." },
    { label: "Ondulação do mesociclo", prompt: `Monte o plano de ondulação de zonas e RIR para as próximas ${Math.max(totalWeeks - currentWeek, 1)} semanas.` },
  ];

  const promptsOpen = supercomp.filter(w => w.pronto).length;
  const rbeAlerts = rbe.filter(s => s.alerta).length;

  return (
    <div className="rounded-2xl flex flex-col" style={{ background: SURFACE, border: `1px solid ${BORDER}`, minHeight: 560 }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,222,128,0.1)", border: `1px solid ${BORDER}` }}>
            <Brain className="w-4 h-4" style={{ color: GREEN }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#f0fdf4" }}>STRATUM</p>
            <p className="text-[10px]" style={{ color: "#64748b" }}>Motor de periodização · Diogo Mello</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {apexProtocol && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(184,146,42,0.15)", color: "#E8A020", border: "1px solid rgba(184,146,42,0.3)" }}>APEX ativo</span>
          )}
          {promptsOpen > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(74,222,128,0.12)", color: GREEN, border: `1px solid ${BORDER}` }}>Supercomp ×{promptsOpen}</span>
          )}
          {rbeAlerts > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>RBE ×{rbeAlerts}</span>
          )}
        </div>
      </div>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="px-4 py-3">
          <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#475569" }}>Ações rápidas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => sendMessage(a.prompt)}
                disabled={loading}
                className="text-left text-[11px] font-medium px-3 py-2 rounded-lg transition hover:scale-[1.01] disabled:opacity-50"
                style={{ background: "rgba(74,222,128,0.04)", border: `1px solid ${BORDER}`, color: "#cbd5e1" }}
              >
                <Sparkles className="w-3 h-3 inline mr-1.5" style={{ color: GREEN }} />
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
                background: m.role === "user" ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${m.role === "user" ? BORDER : "rgba(255,255,255,0.06)"}`,
                color: "#e2e8f0",
              }}
            >
              {m.role === "assistant" && /```json/.test(m.content) ? (
                <PrescriptionRenderer content={m.content} />
              ) : (
                <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: GREEN }}>
            <Loader2 className="w-3 h-3 animate-spin" /> STRATUM analisando…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 flex gap-2" style={{ borderTop: `1px solid ${BORDER}` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Pergunte sobre periodização, prescrição ou ajustes…"
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#f0fdf4" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-3 rounded-lg disabled:opacity-40"
          style={{ background: "rgba(74,222,128,0.18)", border: `1px solid ${BORDER}`, color: GREEN }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Prescription JSON Renderer ─────────────── */
function PrescriptionRenderer({ content }: { content: string }) {
  let prescription: any = null;
  let preface = "";
  try {
    const match = content.match(/```json\s*([\s\S]*?)```/);
    if (match) {
      preface = content.slice(0, match.index).trim();
      prescription = JSON.parse(match[1]);
    } else {
      const m2 = content.match(/\{[\s\S]*\}/);
      if (m2) prescription = JSON.parse(m2[0]);
    }
  } catch {
    prescription = null;
  }

  if (!prescription?.blocos) {
    return (
      <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  const profileCfg: Record<string, { cor: string; icon: string }> = {
    ALONGADO: { cor: "#34D399", icon: "↕" },
    ENCURTADO: { cor: "#FBBF24", icon: "◎" },
    CONSTANTE: { cor: "#38BDF8", icon: "▬" },
    MISTO: { cor: "#A78BFA", icon: "≋" },
  };

  return (
    <div>
      {preface && (
        <div className="prose prose-invert prose-sm max-w-none mb-2 [&_p]:my-1">
          <ReactMarkdown>{preface}</ReactMarkdown>
        </div>
      )}

      {/* Session header */}
      <div className="mb-3">
        <p className="text-[13px] font-bold" style={{ color: "#f0fdf4" }}>{prescription.sessao?.nome}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {[
            { v: prescription.sessao?.semana && `Sem ${prescription.sessao.semana}`, c: "#E8A020" },
            { v: prescription.sessao?.rir_semana != null && `RIR ${prescription.sessao.rir_semana}`, c: "#38BDF8" },
            { v: prescription.sessao?.zona_principal && `Z${prescription.sessao.zona_principal}`, c: "#A78BFA" },
            { v: prescription.sessao?.padrao_ondulacao, c: "#34D399" },
            { v: prescription.sessao?.divisao, c: "#4ade80" },
          ].filter(x => x.v).map((b, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ background: `${b.c}14`, border: `1px solid ${b.c}40`, color: b.c }}>{b.v}</span>
          ))}
        </div>
      </div>

      {/* Blocks */}
      {prescription.blocos.map((bloco: any, bi: number) => (
        <div key={bi} className="mb-3">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#94a3b8" }}>{bloco.nome}</p>
          {bloco.exercicios?.map((ex: any, ei: number) => {
            const pcfg = profileCfg[ex.perfil] ?? { cor: "#9CA3AF", icon: "·" };
            return (
              <div key={ei} className="mb-1.5 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-[12px] font-semibold" style={{ color: "#f0fdf4" }}>{ex.nome}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: pcfg.cor, background: `${pcfg.cor}14`, border: `1px solid ${pcfg.cor}30` }}>{pcfg.icon} {ex.perfil}</span>
                  {ex.zona != null && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: "#E8A020", background: "rgba(232,160,32,0.1)" }}>Z{ex.zona}</span>}
                  {ex.rir != null && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: "#38BDF8", background: "rgba(56,189,248,0.1)" }}>RIR {ex.rir}</span>}
                  {ex.smh && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: "#34D399", background: "rgba(52,211,153,0.1)" }}>SMH {ex.cadencia || ""}</span>}
                  {ex.importancia === "CRITICA" && <span className="text-[10px]" style={{ color: "#E8A020" }}>★</span>}
                </div>
                <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                  {ex.series}×{ex.reps}{ex.intervalo ? ` · ${ex.intervalo}` : ""}{ex.porcao_muscular ? ` · ${ex.porcao_muscular}` : ""}
                </p>
                {ex.justificativa && <p className="text-[10px] italic mt-0.5" style={{ color: "#64748b" }}>{ex.justificativa}</p>}
                {ex.tecnica_especial && <p className="text-[10px] mt-1" style={{ color: "#A78BFA" }}>→ {ex.tecnica_especial}</p>}
              </div>
            );
          })}
        </div>
      ))}

      {/* Analysis */}
      {prescription.analise && (
        <div className="mt-2 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>Análise da sessão</p>
          {prescription.analise.volume_total_series != null && (
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>Volume total: {prescription.analise.volume_total_series} séries</p>
          )}
          {Array.isArray(prescription.analise.alertas) && prescription.analise.alertas.map((a: string, i: number) => (
            <p key={i} className="text-[10px] italic mt-0.5 flex items-start gap-1" style={{ color: "#fbbf24" }}>
              <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0" /> {a}
            </p>
          ))}
          {prescription.analise.proxima_sessao && (
            <p className="text-[10px] mt-1.5" style={{ color: GREEN }}>Próxima sessão: {prescription.analise.proxima_sessao}</p>
          )}
        </div>
      )}
    </div>
  );
}
