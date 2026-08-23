import { useEffect, useState } from "react";
import { Award, Copy, RefreshCw, Save, Trash2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReelExportData } from "@/lib/reelsExport";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22", gold: "#B8922A",
  green: "#00C896", cyan: "#00D4FF", red: "#ff4444",
  text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

type Variation = {
  id: string;
  kind: "hook" | "cta";
  label: string | null;
  content: string;
  is_winner: boolean;
  views: number | null;
  likes: number | null;
  created_at: string;
};

const clean = (s: string) => s.trim().replace(/^["“”]|["“”]$/g, "");

/** Gera 3 ângulos de hook a partir do hook original. */
function hookVariants(hook: string): { label: string; content: string }[] {
  const h = clean(hook || "Transformação é sistema");
  const core = h.replace(/[.?!]$/, "");
  return [
    { label: "A · DIRETO", content: `${core}.` },
    { label: "B · PERGUNTA", content: `E se eu te disser que ${core.charAt(0).toLowerCase()}${core.slice(1)}?` },
    { label: "C · TENSÃO", content: `Ninguém te contou isso: ${core.charAt(0).toLowerCase()}${core.slice(1)}.` },
  ];
}

/** Gera 3 CTAs com níveis de compromisso diferentes. */
function ctaVariants(cta: string, produto?: string): { label: string; content: string }[] {
  const p = produto || "nutriON";
  const base = clean(cta || `Entra no ${p}.`);
  return [
    { label: "A · BAIXO ATRITO", content: `Comenta SISTEMA que eu te mando o caminho.` },
    { label: "B · DIRETO", content: base.match(/link|bio|clica/i) ? base : `${base} Link na bio.` },
    { label: "C · ESCASSEZ", content: `${p}: 14 dias grátis. Só faz sentido se você for até o fim.` },
  ];
}

export default function ReelsVariationsPanel({ result, analysisId }: { result: ReelExportData; analysisId?: string }) {
  const [hooks, setHooks] = useState(() => hookVariants(result.hook || ""));
  const [ctas, setCtas] = useState(() => ctaVariants(result.roteiro?.cta_28_35s || "", result.produto_sugerido));
  const [saved, setSaved] = useState<Variation[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("reels_variations")
      .select("id, kind, label, content, is_winner, views, likes, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    setSaved((data as Variation[]) || []);
  };

  useEffect(() => { load(); }, []);

  const regenerate = () => {
    setHooks(hookVariants(result.hook || ""));
    setCtas(ctaVariants(result.roteiro?.cta_28_35s || "", result.produto_sugerido));
  };

  const saveAll = async () => {
    if (busy) return;
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const coach_id = userData.user?.id;
    if (!coach_id) { toast.error("Você precisa estar logado"); setBusy(false); return; }
    const payload = [
      ...hooks.map((h) => ({ coach_id, analysis_id: analysisId ?? null, kind: "hook", label: h.label, content: h.content })),
      ...ctas.map((c) => ({ coach_id, analysis_id: analysisId ?? null, kind: "cta", label: c.label, content: c.content })),
    ];
    const { error } = await supabase.from("reels_variations").insert(payload as never);
    if (error) toast.error("Erro ao salvar variações");
    else { toast.success("Variações salvas para comparar depois"); await load(); }
    setBusy(false);
  };

  const update = async (id: string, patch: Partial<Variation>) => {
    setSaved((p) => p.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    const { error } = await supabase.from("reels_variations").update(patch as never).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reels_variations").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover");
    setSaved((p) => p.filter((v) => v.id !== id));
  };

  const edit = (kind: "hook" | "cta", i: number, value: string) => {
    const setter = kind === "hook" ? setHooks : setCtas;
    setter((p) => p.map((v, idx) => (idx === i ? { ...v, content: value } : v)));
  };

  const Group = ({ kind, items }: { kind: "hook" | "cta"; items: { label: string; content: string }[] }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>
        {kind === "hook" ? "3 VARIAÇÕES DE HOOK" : "3 VARIAÇÕES DE CTA"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((v, i) => (
          <div key={v.label} style={{ background: C.card, border: `1px solid ${C.border}`, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ ...fM, fontSize: 12, color: kind === "hook" ? C.gold : C.green }}>{v.label}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(v.content); toast.success("Copiado"); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.textMid, display: "flex", alignItems: "center", gap: 4, ...fM, fontSize: 12 }}
              ><Copy size={12} /> COPIAR</button>
            </div>
            <textarea
              value={v.content}
              onChange={(e) => edit(kind, i, e.target.value)}
              rows={2}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, ...fM, fontSize: 14, padding: 10, resize: "none", boxSizing: "border-box", lineHeight: 1.6 }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ ...fT, fontSize: 22, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color={C.gold} /> MODO VARIAÇÕES
          </div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>Teste A/B/C de hook e CTA · marque a vencedora depois</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={regenerate} style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 12, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> REGERAR
          </button>
          <button onClick={saveAll} disabled={busy} style={{ padding: "9px 16px", background: C.gold, border: "none", ...fT, fontSize: 15, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={14} /> SALVAR PARA COMPARAR
          </button>
        </div>
      </div>

      <Group kind="hook" items={hooks} />
      <Group kind="cta" items={ctas} />

      <div style={{ ...fM, fontSize: 11, color: C.textMuted, letterSpacing: "0.1em", margin: "18px 0 8px" }}>HISTÓRICO DE TESTES</div>
      {saved.length === 0 ? (
        <div style={{ ...fM, fontSize: 13, color: C.textMid }}>Nenhuma variação salva ainda.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 340, overflowY: "auto" }}>
          {saved.map((v) => (
            <div key={v.id} style={{ background: C.card, border: `1px solid ${v.is_winner ? `${C.green}55` : C.border}`, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ ...fM, fontSize: 11, color: v.kind === "hook" ? C.gold : C.green }}>{v.kind.toUpperCase()} · {v.label}</span>
                  <div style={{ ...fM, fontSize: 13, color: C.textMid, marginTop: 4, lineHeight: 1.6 }}>{v.content}</div>
                </div>
                <button onClick={() => remove(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red }}><Trash2 size={13} /></button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                {(["views", "likes"] as const).map((f) => (
                  <input
                    key={f}
                    type="number"
                    value={v[f] ?? ""}
                    placeholder={f === "views" ? "views" : "likes"}
                    onChange={(e) => update(v.id, { [f]: e.target.value ? Number(e.target.value) : null } as Partial<Variation>)}
                    style={{ width: 100, background: C.bg, border: `1px solid ${C.border}`, color: C.text, ...fM, fontSize: 12, padding: "6px 8px" }}
                  />
                ))}
                <button
                  onClick={() => update(v.id, { is_winner: !v.is_winner })}
                  style={{ padding: "6px 12px", background: v.is_winner ? `${C.green}18` : "transparent", border: `1px solid ${v.is_winner ? `${C.green}66` : C.border}`, ...fM, fontSize: 12, color: v.is_winner ? C.green : C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Award size={12} /> {v.is_winner ? "VENCEDORA" : "MARCAR VENCEDORA"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
