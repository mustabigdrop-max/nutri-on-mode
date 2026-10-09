import { VERIFICADOR_REGRAS } from "../../../supabase/functions/_shared/reelVerifier";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ENGINE_LABEL, ENGINE_PROMPT_KEYS, rowState, saveInstruction, validateInstruction, type EngineRow, type EnginePromptKey } from "@/lib/engineInstructions";
import { runGerarReel } from "@/lib/retentionEngine";

const C = { cyan: "#00D4FF", gold: "#B8922A", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340", green: "#5DCAA5", blue: "#AFA9EC", red: "#EF4444" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const btn = (c: string): React.CSSProperties => ({ fontFamily: F.m, fontSize: 10, color: c, background: "none", border: `1px solid ${c}60`, padding: "5px 10px", cursor: "pointer", borderRadius: 0 });
const STATE_COLOR = { Ativa: C.green, Editada: C.blue, Vazia: C.red };

function Card({ row, userId, onChanged }: { row: EngineRow; userId: string; onChanged: () => void }) {
  const [text, setText] = useState(row.conteudo);
  const [saving, setSaving] = useState(false);
  const [hist, setHist] = useState<any[] | null>(null);
  const state = rowState(row);
  const save = async (value = text) => {
    const v = validateInstruction(row.chave, value);
    if (v.erro) return toast.error(v.erro);
    v.avisos.forEach(a => toast.warning(a));
    setSaving(true);
    try { await saveInstruction(userId, row, value); toast.success(`${ENGINE_LABEL[row.chave]} salvo`); setText(value); setHist(null); onChanged(); }
    catch { toast.error("Não foi possível salvar."); } finally { setSaving(false); }
  };
  const openHist = async () => {
    if (hist) return setHist(null);
    const { data } = await supabase.from("engine_prompt_versions").select("id, conteudo, versao, created_at").eq("prompt_id", row.id).order("created_at", { ascending: false }).limit(10);
    setHist(data ?? []);
  };
  return (
    <div style={{ border: `1px solid ${C.cyan}22`, padding: 10, background: "#05050c" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.white, letterSpacing: 1 }}>{ENGINE_LABEL[row.chave]}</span>
        <span style={{ fontFamily: F.m, fontSize: 9, color: STATE_COLOR[state], border: `1px solid ${STATE_COLOR[state]}60`, padding: "2px 6px" }}>{state.toUpperCase()}</span>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
        style={{ width: "100%", marginTop: 8, fontFamily: F.m, fontSize: 11, lineHeight: 1.5, color: C.text, background: "#020205", border: `1px solid ${C.dim}`, padding: 8, borderRadius: 0, resize: "vertical" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 6 }}>
        <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginRight: "auto" }}>{text.length} caracteres · v{row.versao}</span>
        <button type="button" disabled={saving} onClick={() => save()} style={btn(C.cyan)}>{saving ? "Salvando..." : "Salvar"}</button>
        <button type="button" onClick={() => { if (confirm("Voltar ao texto padrão desta instrução?")) save(row.padrao); }} style={btn(C.gold)}>Restaurar padrão</button>
        <button type="button" onClick={openHist} style={btn(C.muted)}>Histórico</button>
      </div>
      {hist && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {hist.length === 0 && <span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>Nenhuma versão salva ainda.</span>}
          {hist.map(h => (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, borderTop: `1px solid ${C.dim}`, paddingTop: 4 }}>
              <span style={{ fontFamily: F.m, fontSize: 10, color: C.text }}>v{h.versao} · {new Date(h.created_at).toLocaleString("pt-BR")}</span>
              <button type="button" onClick={() => save(h.conteudo)} style={btn(C.cyan)}>Restaurar esta</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EngineInstructionsPanel({ rows, userId, open, onToggle, onChanged }: { rows: EngineRow[]; userId: string; open: boolean; onToggle: () => void; onChanged: () => void }) {
  const [tema, setTema] = useState("");
  const [testing, setTesting] = useState<string | null>(null);
  const [result, setResult] = useState<{ passe: string; ok: boolean; ms: number; erro?: string }[] | null>(null);
  const test = async () => {
    if (!tema.trim()) return toast.error("Escreva um tema para testar");
    setResult(null);
    try { setResult(await runGerarReel({ tema: tema.trim(), objetivo: "alcance", tom: "direto", teste: true } as any, setTesting)); }
    catch (e: any) { toast.error(e.message); } finally { setTesting(null); }
  };
  const [ouro, setOuro] = useState<number | null>(null);
  useEffect(() => { supabase.from("retention_scripts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("exemplo_ouro", true).then(({ count }) => setOuro(count ?? 0)); }, [userId]);
  const ordered = ENGINE_PROMPT_KEYS.map((k: EnginePromptKey) => rows.find(r => r.chave === k)).filter(Boolean) as EngineRow[];
  return (
    <div id="cc-instrucoes" style={{ scrollMarginTop: 80 }}>
      <button type="button" onClick={onToggle} style={{ width: "100%", display: "flex", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, letterSpacing: 2, color: C.cyan }}>INSTRUÇÕES DO MOTOR</span>
        <span style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>{open ? "▲ recolher" : "▼ abrir"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontFamily: F.m, fontSize: 10, color: C.gold, margin: 0 }}>Alterar estas instruções muda como os reels são gerados. Use 'Restaurar padrão' se algo piorar.</p>
          <div style={{ border: `1px solid ${C.gold}40`, padding: 10 }}>
            <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.white }}>Testar com um tema</span>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: creatina"
                style={{ flex: 1, minWidth: 0, fontFamily: F.m, fontSize: 11, color: C.text, background: "#020205", border: `1px solid ${C.dim}`, padding: "6px 8px", borderRadius: 0 }} />
              <button type="button" disabled={!!testing} onClick={test} style={btn(C.cyan)}>{testing ? `${ENGINE_LABEL[testing as EnginePromptKey] ?? "Testando"}...` : "Testar"}</button>
            </div>
            <p style={{ fontFamily: F.m, fontSize: 9, color: C.muted, margin: "6px 0 0" }}>Roda os 3 passes sem salvar o reel.</p>
            {result && result.map(r => (
              <div key={r.passe} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.m, fontSize: 10, marginTop: 4, color: r.ok ? C.green : C.red }}>
                <span>{ENGINE_LABEL[r.passe as EnginePromptKey]} · {r.ok ? "JSON válido" : `falhou${r.erro ? `: ${r.erro}` : ""}`}</span>
                <span>{(r.ms / 1000).toFixed(1)}s</span>
              </div>
            ))}
          </div>
          {ouro === 0 && <p style={{ fontFamily: F.m, fontSize: 10, color: C.gold, margin: 0 }}>Sem reels de referência cadastrados</p>}
          {ordered.map(r => <Card key={r.id + r.versao} row={r} userId={userId} onChanged={onChanged} />)}
          <div style={{ border: `1px solid ${C.dim}`, padding: 10 }}>
            <span style={{ fontFamily: F.t, fontSize: 14, fontWeight: 700, color: C.white }}>Verificador (regras em código)</span>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginLeft: 8 }}>SOMENTE LEITURA</span>
            <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>{VERIFICADOR_REGRAS.map(t => <li key={t} style={{ fontFamily: F.m, fontSize: 10, color: C.text, lineHeight: 1.6 }}>{t}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
