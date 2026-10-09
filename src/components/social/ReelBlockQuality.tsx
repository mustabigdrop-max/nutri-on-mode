import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const C = { cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", amber: "#EF9F27", red: "#EF4444", purple: "#AFA9EC", muted: "#888", text: "#E8E8F0", s2: "#111118" };
const FM = "'Space Mono',monospace";

const MARK_COLOR = (m: string) => /ÊNFASE|ENFASE/i.test(m) ? C.gold : /PAUSA/i.test(m) ? C.cyan : /RÁPIDO|RAPIDO/i.test(m) ? C.amber : /LENTO/i.test(m) ? C.purple : /QUEDA/i.test(m) ? C.green : C.muted;

/** Renders voice marks like [ÊNFASE] as small coloured tags instead of loose brackets. */
export function VoiceText({ text }: { text: string }) {
  const parts = String(text ?? "").split(/(\[[^\]]{1,30}\])/g).filter(Boolean);
  return <>{parts.map((p, i) => /^\[[^\]]+\]$/.test(p)
    ? <span key={i} style={{ fontFamily: FM, fontSize: 8, letterSpacing: 0.5, color: MARK_COLOR(p), border: `1px solid ${MARK_COLOR(p)}60`, padding: "0 4px", margin: "0 3px", verticalAlign: "middle", whiteSpace: "nowrap" }}>{p.slice(1, -1)}</span>
    : <span key={i}>{p}</span>)}</>;
}

export function QualitySeal({ status, nota, motivo }: { status?: string | null; nota?: number | null; motivo?: string }) {
  if (!status) return null;
  const ok = status === "aprovado";
  return <span title={motivo} style={{ fontFamily: FM, fontSize: 9, color: ok ? C.green : C.amber, border: `1px solid ${ok ? C.green : C.amber}60`, padding: "2px 8px" }}>
    {ok ? `APROVADO · NOTA ${nota ?? "—"}` : `PRECISA DE REVISÃO${motivo ? ` · ${motivo}` : ""}`}</span>;
}

export const sealReason = (script: any) => {
  const riscos = script?.notas?.riscos_de_conteudo ?? [];
  if (riscos.length) return `${riscos[0].risco} no bloco ${riscos[0].id}`;
  if (script?.nota_geral != null && Number(script.nota_geral) < 8) return `nota ${script.nota_geral} abaixo de 8`;
  return "";
};

/** "Por que essa nota" + "Reescrever este bloco" for one block. */
export function BlockQuality({ scriptId, blocoId, motivo, onUpdated }: { scriptId?: string; blocoId: number; motivo?: any; onUpdated?: (s: any) => void }) {
  const [open, setOpen] = useState(false); const [rw, setRw] = useState(false); const [inst, setInst] = useState(""); const [busy, setBusy] = useState(false);
  const rewrite = async () => {
    if (!scriptId) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("gerar_reel", { body: { modo: "reescrever_bloco", script_id: scriptId, bloco_id: blocoId, instrucao: inst.trim() || undefined } });
    setBusy(false);
    const err = (data as any)?.error ?? (error ? "Não foi possível reescrever o bloco." : null);
    if (err) return toast.error(err);
    toast.success(`Bloco ${blocoId} reescrito`); setRw(false); setInst(""); onUpdated?.((data as any).script);
  };
  const btn: React.CSSProperties = { fontFamily: FM, fontSize: 9, color: C.cyan, background: "none", border: `1px solid ${C.cyan}40`, padding: "2px 8px", cursor: "pointer", borderRadius: 0 };
  return <div style={{ marginTop: 4 }}>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button type="button" style={btn} onClick={() => setOpen(o => !o)}>{open ? "▲" : "▼"} Por que essa nota</button>
      {scriptId && <button type="button" style={btn} onClick={() => setRw(o => !o)}>Reescrever este bloco</button>}
    </div>
    {open && <div style={{ background: C.s2, padding: 8, marginTop: 4, fontFamily: FM, fontSize: 10, color: C.text, lineHeight: 1.6 }}>
      {!motivo ? <span style={{ color: C.muted }}>Sem detalhamento salvo para este bloco.</span> : <>
        <div>Nota final {motivo.nota ?? "—"} · Crítico 1 {motivo.nota_critico ?? "—"} · Crítico 2 {motivo.nota_critico2 ?? "—"} · teto do Verificador {motivo.teto ?? "—"}</div>
        {(motivo.regras ?? []).map((t: string) => <div key={t} style={{ color: C.amber }}>• {t}</div>)}
        {(motivo.riscos ?? []).map((t: string) => <div key={t} style={{ color: C.red }}>• Risco: {t}</div>)}
        {(motivo.avisos ?? []).map((t: string) => <div key={t} style={{ color: C.muted }}>• Aviso: {t}</div>)}
        {(motivo.frases_fracas ?? []).map((f: any, i: number) => <div key={i}>• Frase fraca: “{f.frase}” → {f.correcao}</div>)}
        {!(motivo.regras?.length || motivo.frases_fracas?.length) && motivo.comentario && <div>• {motivo.comentario}</div>}
      </>}
    </div>}
    {rw && <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
      <input value={inst} onChange={e => setInst(e.target.value)} placeholder="Instrução (opcional)" style={{ flex: 1, minWidth: 0, fontFamily: FM, fontSize: 10, color: C.text, background: "#020205", border: "1px solid #333340", padding: "4px 6px", borderRadius: 0 }} />
      <button type="button" disabled={busy} onClick={rewrite} style={btn}>{busy ? "Reescrevendo..." : "Reescrever"}</button>
    </div>}
  </div>;
}

/** "Pontos fracos (Crítico 2)": adversarial editor that saw only the final script. */
export function Critico2Panel({ c2 }: { c2?: any }) {
  if (!c2) return null;
  const pts: any[] = Array.isArray(c2.pontos_fracos) ? c2.pontos_fracos : [];
  return <div style={{ background: C.s2, padding: 8, marginTop: 8, fontFamily: FM, fontSize: 10, color: C.text, lineHeight: 1.6 }}>
    <div style={{ color: C.red, letterSpacing: 1 }}>PONTOS FRACOS (CRÍTICO 2)</div>
    {c2.aviso && <div style={{ color: C.amber }}>⚠ {c2.aviso}</div>}
    {!pts.length ? <div style={{ color: C.muted }}>Nenhum ponto fraco apontado.</div> : pts.map((p, i) => <div key={i}>• Bloco {p.bloco}: {p.frase ? `“${p.frase}” — ` : ""}{p.problema}</div>)}
  </div>;
}
