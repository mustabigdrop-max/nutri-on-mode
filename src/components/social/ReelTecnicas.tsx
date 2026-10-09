// Técnicas do reel (detectadas por regras, confirmadas pelo usuário) e tabela Técnicas × retenção.
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TECNICAS, detectarTecnicas, comparativoTecnica } from "../../../supabase/functions/_shared/academyRules";

const C = { cyan: "#00D4FF", gold: "#B8922A", amber: "#EF9F27", green: "#5DCAA5", text: "#C8C8D8", white: "#F0F0F8", muted: "#6b6b80", line: "#1a1a26" };
const FM = "'Space Mono',monospace";

export function ReelTecnicas({ reel, onSaved }: { reel: any; onSaved?: () => void }) {
  const detect = detectarTecnicas(reel?.roteiro?.blocos ?? [], reel?.estrutura?.formula_nome);
  const salvo: string[] | null = Array.isArray(reel?.tecnicas) ? reel.tecnicas : null;
  const [sel, setSel] = useState<string[]>(salvo ?? detect);
  const [dirty, setDirty] = useState(false);
  const toggle = (t: string) => { setSel(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]); setDirty(true); };
  const salvar = async () => {
    const { error } = await supabase.from("retention_scripts").update({ tecnicas: sel }).eq("id", reel.id);
    if (error) return toast.error("Não salvou as técnicas.");
    setDirty(false); toast.success("Técnicas confirmadas"); onSaved?.();
  };
  return <div style={{ marginTop: 8, fontFamily: FM, fontSize: 10, color: C.text }}>
    <div style={{ letterSpacing: 1, color: C.cyan, marginBottom: 4 }}>TÉCNICAS USADAS {salvo ? "· CONFIRMADAS" : "· DETECTADAS, CONFIRME"}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {TECNICAS.map(t => { const on = sel.includes(t); return <button key={t} type="button" onClick={() => toggle(t)} aria-pressed={on}
        style={{ fontFamily: FM, fontSize: 9, padding: "2px 6px", borderRadius: 0, cursor: "pointer", background: on ? `${C.cyan}22` : "transparent", color: on ? C.cyan : C.muted, border: `1px solid ${on ? C.cyan : C.line}` }}>{t}{detect.includes(t) ? " •" : ""}</button>; })}
    </div>
    {(dirty || !salvo) && <button type="button" onClick={salvar} style={{ marginTop: 6, fontFamily: FM, fontSize: 9, color: C.gold, background: "none", border: `1px solid ${C.gold}60`, padding: "2px 8px", cursor: "pointer", borderRadius: 0 }}>CONFIRMAR TÉCNICAS</button>}
    <div style={{ color: C.muted, fontSize: 9, marginTop: 2 }}>• = detectada no texto</div>
  </div>;
}

export function TecnicasRetencao({ scripts, results }: { scripts: any[]; results: any[] }) {
  const rows = TECNICAS.map(t => ({ t, ...comparativoTecnica(t, scripts, results) }));
  const algum = rows.some(r => r.reels > 0);
  return <div style={{ fontFamily: FM, fontSize: 10, color: C.text }}>
    {!algum ? <div style={{ color: C.muted }}>Sem dados ainda. Confirme as técnicas dos reels e lance os resultados.</div> :
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ color: C.muted, textAlign: "left" }}><th>Técnica</th><th>Reels</th><th>Com</th><th>Sem</th><th>Selo</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.t} style={{ borderTop: `1px solid ${C.line}` }}>
          <td style={{ padding: "3px 0", color: C.white }}>{r.t}</td><td>{r.reels}</td><td>{r.com ?? "—"}{r.com != null ? "%" : ""}</td><td>{r.sem ?? "—"}{r.sem != null ? "%" : ""}</td>
          <td style={{ color: r.selo === "Confirmado nos seus dados" ? C.green : C.amber }}>{r.selo ?? "—"}</td></tr>)}</tbody>
      </table>}
    <div style={{ color: C.muted, fontSize: 9, marginTop: 4 }}>Retenção = % que passou dos 3s. Indício: menos de 3 reels. Comparação simples, sem controle de outros fatores.</div>
  </div>;
}
