// P3 — "Gerar cards do reel" no padrão Pro: prévia COM × SEM imagem, verificador e substituição sem duplicar.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FORMATOS, type Formato } from "@/lib/cardStudio";
import type { Topic, Subtema } from "@/lib/cardKits";
import { cardsProDoReel, verificarReelCards, temaDoReel, subtemaDoReel, ehAutoDoReel, tipoColuna, type FonteReel, type ReelIn, type CardSalvo } from "@/lib/reelCards";
import { KitMini } from "./KitAgente";
import type { Variante } from "./KitCardView";
import type { Brand } from "./CardTemplate";
import seed from "@/data/cardTopics.json";

const T = { bg: "#020205", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", red: "#EF4444", amber: "#EF9F27", muted: "#888", text: "#E8E8F0", ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const btn = (c: string, solid = false): React.CSSProperties => ({ background: solid ? c : "none", border: `1px solid ${c}`, color: solid ? T.bg : c, borderRadius: 0, fontFamily: T.fm, fontSize: 10, padding: "6px 10px", cursor: "pointer", letterSpacing: .5 });
const NIV = { ok: T.green, aviso: T.amber, bloqueio: T.red } as const;

export function ReelCards({ uid, reel, brand, rows, onSaved }: { uid: string | null; reel: (ReelIn & { id: string }) | null; brand: Brand; rows: CardSalvo[]; onSaved: (reelId: string, msg: string) => void }) {
  const [fontes, setFontes] = useState<FonteReel[]>([]);
  const [temas, setTemas] = useState<Topic[]>(seed as unknown as Topic[]);
  const [usarTema, setUsarTema] = useState(false);
  const [formato, setFormato] = useState<Formato>("9:16");
  const [variantes, setVariantes] = useState<Record<number, Variante>>({});
  const [zoom, setZoom] = useState<number | null>(null);
  const [confirmar, setConfirmar] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => { if (!uid) return; supabase.from("card_topics").select("*").eq("user_id", uid).then(({ data }) => { if (data?.length) setTemas(data as unknown as Topic[]); }); }, [uid]);
  useEffect(() => { setUsarTema(false); setAberto(false); setVariantes({}); if (!reel) { setFontes([]); return; }
    supabase.from("script_sources").select("*").eq("script_id", reel.id).order("ordem").then(({ data }) => setFontes((data ?? []) as unknown as FonteReel[])); }, [reel?.id]);

  const tema = reel ? temaDoReel(reel, temas) : null;
  const sub: Subtema | null = tema && reel ? subtemaDoReel(tema, reel) ?? tema.subtemas[0] ?? null : null;
  const cards = useMemo(() => reel ? cardsProDoReel(reel, { fontes, subtema: usarTema ? sub : null, formato }) : [], [reel, fontes, usarTema, sub, formato]);
  const ver = useMemo(() => verificarReelCards(cards, usarTema ? sub : null, formato), [cards, usarTema, sub, formato]);
  const varDe = (i: number): Variante => variantes[i] ?? "ilustracao";
  const existentes = reel ? rows.filter(r => r.script_id === reel.id) : [];
  const auto = reel ? existentes.filter(r => ehAutoDoReel(r, reel.id)) : [];

  async function salvar() {
    if (!uid || !reel) return; setBusy(true); setConfirmar(null);
    if (auto.length) { const { error } = await supabase.from("studio_cards").delete().in("id", auto.map(r => r.id)); if (error) { setBusy(false); onSaved(reel.id, "Não consegui substituir os cards antigos."); return; } }
    const { error } = await supabase.from("studio_cards").insert(cards.map((c, i) => ({
      user_id: uid, script_id: reel.id, bloco_ref: c.blocoRef, tipo: tipoColuna(c.papel), template: c.papel, formato, nome: c.rotulo,
      conteudo: { kit: true, origem: "reel_auto", editado: false, card: c, variante: varDe(i), titulo: c.principal, rotulo: c.rotulo } as any,
      ilustracao_origem: varDe(i) === "ilustracao" ? "codigo" : null, variante_imagem: varDe(i), verif_status: ver.nivelCard[i],
      topic_slug: usarTema ? tema?.slug ?? null : null, subtema_slug: usarTema ? sub?.slug ?? null : null, pacote: "reel", selo: c.selo ?? null, prova_ref: (c.prova ?? null) as any, alt_texto: c.alt,
    })) as any);
    setBusy(false); setAberto(false);
    onSaved(reel.id, error ? "Não salvou os cards." : `${cards.length} cards criados${auto.length ? ` (substituíram ${auto.length})` : ""}. Revise em Meus cards.`);
  }
  function pedirSalvar() { if (auto.length || existentes.length) setConfirmar(auto.length); else salvar(); }

  if (!reel) return null;
  return <div style={{ marginTop: 8 }}>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button style={btn(T.gold, true)} disabled={busy} onClick={() => setAberto(true)}>GERAR CARDS DO REEL</button>
      {tema && <button style={btn(usarTema ? T.green : T.cyan, usarTema)} onClick={() => { setUsarTema(u => !u); setAberto(true); }}>{usarTema ? "✓ " : ""}Usar provas e ilustração do tema '{tema.titulo}'</button>}
    </div>
    {aberto && <div style={{ background: T.s2, padding: 10, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <div style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan }}>{cards.length} CARDS · VERIFICADOR <span style={{ color: NIV[ver.geral] }}>{ver.geral.toUpperCase()}</span>{usarTema && sub ? ` · TEMA ${tema!.titulo.toUpperCase()} / ${sub.titulo}` : ""}</div>
        <div style={{ display: "flex", gap: 4 }}>{(["9:16", "4:5", "1:1"] as Formato[]).map(f => <button key={f} style={btn(T.cyan, formato === f)} onClick={() => setFormato(f)}>{f}</button>)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
        {cards.map((c, i) => <div key={i} style={{ borderTop: "1px solid #ffffff12", paddingTop: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontFamily: T.fm, fontSize: 10, color: T.text }}>{c.rotulo}</span>
            <span style={{ fontFamily: T.fm, fontSize: 9, border: `1px solid ${T.muted}`, color: T.muted, padding: "1px 5px" }}>{formato}</span>
            <span style={{ fontFamily: T.fm, fontSize: 9, color: NIV[ver.nivelCard[i]] }}>● {ver.nivelCard[i].toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>{(["ilustracao", "sem"] as Variante[]).map(v => <div key={v} style={{ textAlign: "center" }}>
            <KitMini c={c} formato={formato} brand={brand} variante={v} width={220} total={cards.length} onClick={() => setZoom(i)} />
            <button style={{ ...btn(T.cyan, varDe(i) === v), marginTop: 4, width: 220 }} onClick={() => setVariantes(m => ({ ...m, [i]: v }))}>{varDe(i) === v ? "✓ " : ""}{v === "sem" ? "SEM IMAGEM" : "COM IMAGEM"}</button></div>)}</div>
          {c.prova && <div style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, marginTop: 4 }}>Selo: {[c.selo, c.prova.autores, c.prova.organizacao].filter(Boolean).join(" · ")}</div>}
          {ver.porCard[i].map((a, j) => <div key={j} style={{ fontSize: 11, color: NIV[a.nivel] }}>{a.nivel === "bloqueio" ? "Bloqueio" : "Aviso"}: {a.motivo}</div>)}
        </div>)}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button style={btn(T.cyan, true)} disabled={busy || !uid} onClick={pedirSalvar}>{busy ? "SALVANDO..." : "SALVAR EM MEUS CARDS"}</button>
        <button style={btn(T.muted)} onClick={() => setAberto(false)}>FECHAR</button>
      </div>
      <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Cards ficam prontos para revisar; nada é publicado.</div>
    </div>}

    {confirmar != null && <div role="dialog" aria-label="Substituir cards" style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 10003, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.bg, border: `1px solid ${T.gold}`, padding: 16, maxWidth: 380 }}>
        <div style={{ fontSize: 14 }}>Este reel já tem {existentes.length} cards. Substituir pelos novos?</div>
        {existentes.length > confirmar && <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{existentes.length - confirmar} editados à mão ou duplicados ficam como estão.</div>}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}><button style={btn(T.gold, true)} onClick={salvar}>SUBSTITUIR</button><button style={btn(T.muted)} onClick={() => setConfirmar(null)}>CANCELAR</button></div>
      </div>
    </div>}

    {zoom != null && cards[zoom] && <div role="dialog" aria-label="Card em tela cheia" onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "#000e", zIndex: 10002, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
      {(["ilustracao", "sem"] as Variante[]).map(v => <KitMini key={v} c={cards[zoom]} formato={formato} brand={brand} variante={v} total={cards.length}
        width={Math.min(window.innerWidth > 700 ? (window.innerWidth - 60) / 2 : window.innerWidth - 40, (window.innerHeight - 60) * FORMATOS[formato].w / FORMATOS[formato].h)} />)}
    </div>}
  </div>;
}
