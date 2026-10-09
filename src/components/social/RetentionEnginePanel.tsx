import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { copyText } from "./socialUi";
import RetentionResultView from "./RetentionResultView";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444", orange: "#F97316", purple: "#A855F7", muted: "#888", text: "#E8E8F0", white: "#FFF",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const OBJ = [{ id: "alcance", label: "Alcance" }, { id: "autoridade", label: "Autoridade" }, { id: "venda", label: "Venda" }];
const scoreColor = (n: number | null) => n === null ? T.muted : n >= 8 ? T.green : n >= 7 ? T.gold : n >= 5 ? T.orange : T.red;
const span = (t: string) => { const m = t.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/); return m ? Math.max(1, Number(m[2]) - Number(m[1])) : 1; };

type Gen = { id: string; created_at: string; tema: string; objetivo: string; tom: string; roteiro: any; notas: any; nota_geral: number | null; estrutura?: any; angulo?: any; motivos_nota?: any; critico2?: any; status_qualidade?: string | null };
const card: React.CSSProperties = { background: T.s1, border: "1px solid #ffffff10", padding: 16, marginTop: 12 };
const label: React.CSSProperties = { fontFamily: T.fm, fontSize: 10, letterSpacing: 1, color: T.muted, marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", background: T.s2, border: "1px solid #ffffff14", color: T.text, padding: 10, fontSize: 13, borderRadius: 0, boxSizing: "border-box" };
const QUERO = [{ id: "", label: "Tanto faz" }, { id: "comentarios", label: "Comentários" }, { id: "salvamentos", label: "Salvamentos" }, { id: "compartilhamentos", label: "Compartilhamentos" }, { id: "seguidores", label: "Seguidores" }];
const TONS = [{ id: "direto", label: "Direto" }, { id: "bem-humorado", label: "Bem-humorado" }, { id: "intenso", label: "Intenso" }];
const STAGES: Record<string, string> = { arquiteto: "Projetando atenção...", redator: "Projetando atenção...", critico: "Testando o gancho...", reescrita: "Reescrevendo pontos fracos..." };

const Choice = ({ items, value, onChange }: { items: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) =>
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{items.map(o => <button key={o.id} onClick={() => onChange(o.id)} style={{ padding: "8px 16px", borderRadius: 0, cursor: "pointer", fontFamily: T.fm, fontSize: 11,
    background: value === o.id ? `${T.purple}25` : T.s2, color: value === o.id ? T.purple : T.muted, border: `1px solid ${value === o.id ? T.purple : "#ffffff14"}` }}>{o.label}</button>)}</div>;

export default function RetentionEnginePanel() {
  const [tema, setTema] = useState(""); const [objetivo, setObjetivo] = useState("alcance"); const [tom, setTom] = useState("direto"); const [queroMais, setQueroMais] = useState("");
  const [stage, setStage] = useState<string | null>(null); const [gen, setGen] = useState<Gen | null>(null); const [history, setHistory] = useState<Gen[]>([]);
  const busy = stage !== null;

  const loadHistory = async () => {
    const { data } = await supabase.from("retention_scripts").select("id, created_at, tema, objetivo, tom, roteiro, notas, nota_geral, estrutura, angulo, motivos_nota, critico2, status_qualidade").order("created_at", { ascending: false }).limit(20);
    setHistory((data as Gen[]) ?? []);
  };
  useEffect(() => { loadHistory(); }, []);

  const run = async () => {
    if (!tema.trim()) return toast.error("Conte sobre o que é o seu reel");
    setStage("arquiteto");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Entre na sua conta para gerar");
      const res = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/gerar_reel`, {
        method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ tema, objetivo, tom, quero_mais: queroMais || undefined }) });
      if (!res.ok || !res.body) { let msg = "Falha ao gerar reel"; try { msg = (await res.json())?.error || msg; } catch { /* */ } throw new Error(msg); }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ""; let done = false;
      while (!done) {
        const chunk = await reader.read(); if (chunk.done) break;
        buf += dec.decode(chunk.value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.etapa === "erro") throw new Error(ev.error);
          if (ev.etapa === "pronto") { setGen(ev.script); done = true; } else setStage(ev.etapa);
        }
      }
      if (!done) throw new Error("A geração foi interrompida. Tente novamente.");
      loadHistory();
    } catch (e: any) { toast.error(e.message); } finally { setStage(null); }
  };

  const r = gen ? { ...gen.roteiro, ...gen.notas, nota_geral: gen.nota_geral, formula_nome: gen.estrutura?.formula_nome, formula_motivo: gen.estrutura?.formula_motivo, formula_modo: gen.estrutura?.formula_modo, angulo: gen.angulo, motivos_nota: gen.motivos_nota, critico2: gen.critico2, status_qualidade: gen.status_qualidade } : null;
  const blocks: any[] = Array.isArray(r?.blocos) ? r.blocos.map((b: any) => ({ ...b, ...(gen?.notas?.notas_por_bloco ?? []).find((n: any) => n.id === b.id), fala: b.fala })) : [];
  const total = blocks.reduce((n, b) => n + span(String(b.tempo)), 0) || 1;

  return <div style={{ background: T.bg, color: T.text, border: "1px solid #ffffff08", padding: 20, marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ color: T.purple }}>⚡</span>
      <h2 style={{ fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>MOTOR DE RETENÇÃO</h2>
      <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted }}>Estrutura → Roteiro → Feedback</span>
    </div>
    <div style={label}>SOBRE O QUE É O SEU REEL?</div>
    <input style={input} value={tema} onChange={e => setTema(e.target.value)} placeholder='Ex: "Por que você desiste da dieta na segunda semana"' />
    <div style={{ ...label, marginTop: 12 }}>OBJETIVO</div>
    <Choice items={OBJ} value={objetivo} onChange={setObjetivo} />
    <div style={{ ...label, marginTop: 12 }}>TOM</div>
    <Choice items={TONS} value={tom} onChange={setTom} />
    <div style={{ ...label, marginTop: 12 }}>QUERO MAIS (OPCIONAL)</div>
    <Choice items={QUERO} value={queroMais} onChange={setQueroMais} />
    <button onClick={run} disabled={busy} style={{ marginTop: 16, width: "100%", padding: 16, borderRadius: 0, border: "none", cursor: busy ? "wait" : "pointer", background: T.purple, color: T.bg, fontFamily: T.ft, fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
      {busy ? STAGES[stage!] ?? "Projetando atenção..." : "GERAR REEL"}</button>

    {r && <RetentionResultView key={gen?.id} r={r} blocks={blocks} scriptId={gen?.id} onUpdated={s => { setGen(s); loadHistory(); }} />}

    {history.length > 0 && <div style={card}>
      <div style={label}>HISTÓRICO</div>
      {history.map(h => <button key={h.id} onClick={() => setGen(h)} style={{ display: "flex", justifyContent: "space-between", width: "100%", background: gen?.id === h.id ? T.s2 : "transparent", border: "none", borderBottom: "1px solid #ffffff08", color: T.text, padding: "8px 4px", cursor: "pointer", textAlign: "left", fontSize: 12 }}>
        <span>{h.tema} · {h.objetivo} · {h.tom}</span><span style={{ color: scoreColor(h.nota_geral ?? null), fontFamily: T.fm }}>{h.nota_geral ?? "—"} · {new Date(h.created_at).toLocaleDateString("pt-BR")}</span>
      </button>)}
    </div>}
  </div>;
}
