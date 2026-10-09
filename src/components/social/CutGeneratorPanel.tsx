import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { eligibleCuts, cutFileName, cutsCsv, type CutSuggestion, type CutTipo } from "@/lib/cutGenerator";
import { renderCut, canvasBlob } from "@/lib/cutRender";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", red: "#EF4444", muted: "#888", text: "#E8E8F0", ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const TIPO_LABEL: Record<CutTipo, string> = { dado: "A · CARD DE DADO", texto: "B · CARD DE TEXTO", ilustracao: "C · ILUSTRAÇÃO", diagrama: "D · DIAGRAMA" };
const AVISO_C = "Imagem gerada. Ative o rótulo de conteúdo gerado da plataforma ao postar.";
const btn = (c: string, on = true): React.CSSProperties => ({ background: "none", border: `1px solid ${c}`, color: on ? c : T.muted, borderRadius: 0, fontFamily: T.fm, fontSize: 10, padding: "4px 8px", cursor: on ? "pointer" : "not-allowed", opacity: on ? 1 : .5 });

interface Cut { id: string; bloco: string; tempo: string | null; tipo: CutTipo; texto_tela: string | null; descricao: string | null; url: string | null; status: string; regeneracoes: number }

export default function CutGeneratorPanel({ scriptId, blocks }: { scriptId?: string; blocks: any[] }) {
  const sugg = useMemo(() => eligibleCuts(blocks), [blocks]);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [quota, setQuota] = useState<{ limite: number; restantes: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [aviso, setAviso] = useState(false);

  const byBloco = (b: string) => sugg.find(s => s.bloco === b);
  const nC = sugg.filter(s => s.tipo === "ilustracao").length;

  async function load() {
    if (!scriptId) return;
    const { data: rb } = await supabase.from("reel_bank").select("id").eq("script_id", scriptId).in("status", ["escolhido", "gravado", "postado"]).limit(1);
    setChosen(!!rb?.length);
    const { data } = await supabase.from("cut_assets").select("id,bloco,tempo,tipo,texto_tela,descricao,url,status,regeneracoes").eq("script_id", scriptId).neq("status", "descartado").order("created_at");
    setCuts((data ?? []) as Cut[]);
    if (rb?.length) { const q = await supabase.functions.invoke("gerar_corte", { body: { action: "quota", script_id: scriptId } }); if (q.data) setQuota(q.data); }
  }
  useEffect(() => { load(); }, [scriptId]);

  async function signed(path: string) { const { data } = await supabase.storage.from("cuts").createSignedUrl(path, 3600); return data?.signedUrl ?? null; }
  async function canvasFor(c: Cut) {
    const s = byBloco(c.bloco);
    return renderCut({ tipo: c.tipo, texto: c.texto_tela ?? "", fonte: s?.fonte, itens: s?.itens, tempo: c.tempo ?? "", imageUrl: c.tipo === "ilustracao" && c.url ? await signed(c.url) : null });
  }
  useEffect(() => { (async () => {
    const out: Record<string, string> = {};
    for (const c of cuts) { try { out[c.id] = (await canvasFor(c)).toDataURL("image/jpeg", .6); } catch { /* sem preview */ } }
    setPreviews(out);
  })(); }, [cuts]);

  async function codeCut(s: CutSuggestion) {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) throw new Error("Faça login.");
    const cv = await renderCut({ tipo: s.tipo, texto: s.texto, fonte: s.fonte, itens: s.itens, tempo: s.tempo });
    const path = `${u.user.id}/${s.tipo}/${scriptId}_${s.bloco}.png`;
    await supabase.storage.from("cuts").upload(path, await canvasBlob(cv), { contentType: "image/png", upsert: true });
    const { error } = await supabase.from("cut_assets").insert({ user_id: u.user.id, script_id: scriptId!, bloco: s.bloco, tempo: s.tempo, tipo: s.tipo, descricao: s.descricao, texto_tela: s.texto, url: path, modelo: "codigo", custo: 0 });
    if (error) throw error;
  }
  async function illusCut(s: CutSuggestion, cut_id?: string) {
    const { data, error } = await supabase.functions.invoke("gerar_corte", { body: { script_id: scriptId, bloco: s.bloco, tempo: s.tempo, descricao: s.descricao, texto_tela: s.texto, cut_id } });
    const e = (data as any)?.error ?? (error ? await (error as any).context?.json?.().then((j: any) => j?.error).catch(() => null) ?? "Falha ao gerar." : null);
    if (e) throw new Error(`Bloco ${s.bloco}: ${e}`);
  }

  async function generateAll() {
    if (nC && !confirm(`Estimativa: ${sugg.length - nC} cortes por código (sem custo de imagem) e ${nC} ilustração(ões) usando o seu limite diário (${quota?.restantes ?? "—"} restantes de ${quota?.limite ?? 30}). Imagens repetidas saem do cache. Gerar?`)) return;
    setBusy("all"); setMsg(null); const errs: string[] = [];
    const have = new Set(cuts.map(c => c.bloco));
    for (const s of sugg) { if (have.has(s.bloco)) continue; try { s.tipo === "ilustracao" ? await illusCut(s) : await codeCut(s); } catch (e: any) { errs.push(e.message); } }
    setMsg(errs.length ? errs.join(" · ") : null); setBusy(null); load();
  }
  async function regen(c: Cut) {
    const s = byBloco(c.bloco); if (!s) return;
    setBusy(c.id); setMsg(null);
    try {
      if (c.tipo === "ilustracao") await illusCut(s, c.id);
      else { if (c.regeneracoes >= 2) throw new Error("Limite de 2 regerações."); await supabase.from("cut_assets").delete().eq("id", c.id); await codeCut(s);
        await supabase.from("cut_assets").update({ regeneracoes: c.regeneracoes + 1 }).eq("script_id", scriptId!).eq("bloco", c.bloco).eq("status", "novo"); }
    } catch (e: any) { setMsg(e.message); }
    setBusy(null); load();
  }
  async function setStatus(c: Cut, status: string) { await supabase.from("cut_assets").update({ status }).eq("id", c.id); load(); }
  async function downloadOne(c: Cut, i: number) {
    const blob = await canvasBlob(await canvasFor(c)); const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = cutFileName(i, c.tempo ?? ""); a.click();
    if (c.tipo === "ilustracao") setAviso(true);
  }
  async function downloadZip() {
    setBusy("zip"); const zip = new JSZip(); const rows: any[] = [];
    const sorted = [...cuts].sort((a, b) => Number(a.bloco) - Number(b.bloco));
    for (const [i, c] of sorted.entries()) { const file = cutFileName(i, c.tempo ?? ""); zip.file(file, await canvasBlob(await canvasFor(c)));
      rows.push({ file, bloco: c.bloco, tempo: c.tempo ?? "", tipo: c.tipo, duracao: byBloco(c.bloco)?.duracao ?? 3, texto: c.texto_tela ?? "" }); }
    zip.file("posicoes_na_edicao.csv", cutsCsv(rows));
    const a = document.createElement("a"); a.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" })); a.download = "cortes_do_reel.zip"; a.click();
    if (sorted.some(c => c.tipo === "ilustracao")) setAviso(true); setBusy(null);
  }

  return <div style={{ background: T.s1, border: "1px solid #ffffff10", padding: 16, marginTop: 12 }}>
    <div style={{ fontFamily: T.fm, fontSize: 10, letterSpacing: 1, color: T.muted, marginBottom: 6 }}>GERADOR DE CORTES · SUGESTÃO POR BLOCO</div>
    {sugg.length === 0 && <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Nenhum bloco com texto aproveitável para corte.</p>}
    {sugg.map(s => <div key={s.bloco} style={{ background: T.s2, padding: 8, marginBottom: 4, fontSize: 12 }}>
      <b style={{ color: T.cyan, fontFamily: T.fm, fontSize: 10 }}>BLOCO {s.bloco} · {s.tempo} · {TIPO_LABEL[s.tipo]} · {s.duracao}s</b>
      <div>{s.texto}</div>{s.tipo === "texto" && /\d/.test(s.texto) && !s.fonte && <div style={{ color: T.muted, fontSize: 10 }}>Sem fonte no roteiro: fica como card de texto, não de dado.</div>}
    </div>)}

    {chosen === false && <p style={{ fontSize: 12, color: T.gold, marginTop: 10 }}>Cortes só para reels marcados em "Escolher pra hoje".</p>}
    {chosen && <>
      <button onClick={generateAll} disabled={!!busy || !sugg.length} style={{ marginTop: 10, width: "100%", padding: 12, background: T.s2, color: T.cyan, border: `1px solid ${T.cyan}`, borderRadius: 0, fontFamily: T.ft, fontWeight: 700, fontSize: 16, letterSpacing: 1, cursor: "pointer" }}>
        {busy === "all" ? "GERANDO CORTES..." : "GERAR CORTES DO REEL"}</button>
      {quota && <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, margin: "6px 0 0" }}>Ilustrações hoje: {quota.limite - quota.restantes}/{quota.limite}</p>}
    </>}
    {msg && <p style={{ fontSize: 12, color: T.red }}>{msg}</p>}

    {cuts.length > 0 && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8, marginTop: 12 }}>
        {cuts.map((c, i) => <div key={c.id} style={{ background: T.s2, border: `1px solid ${c.status === "aprovado" ? T.green : "#ffffff10"}`, padding: 6 }}>
          {previews[c.id] ? <img src={previews[c.id]} alt={`Corte do bloco ${c.bloco}`} style={{ width: "100%", aspectRatio: "9/16", objectFit: "cover", display: "block" }} />
            : <div style={{ aspectRatio: "9/16", background: T.bg }} />}
          <div style={{ fontFamily: T.fm, fontSize: 9, color: T.cyan, margin: "4px 0" }}>{c.tempo} · {TIPO_LABEL[c.tipo]}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <button style={btn(T.green)} onClick={() => setStatus(c, "aprovado")}>{c.status === "aprovado" ? "✓ APROVADO" : "APROVAR"}</button>
            <button style={btn(T.cyan, c.regeneracoes < 2 && !busy)} disabled={c.regeneracoes >= 2 || !!busy} onClick={() => regen(c)}>{busy === c.id ? "..." : `REGERAR ${c.regeneracoes}/2`}</button>
            <button style={btn(T.red)} onClick={() => setStatus(c, "descartado")}>DESCARTAR</button>
            <button style={btn(T.gold)} onClick={() => downloadOne(c, i)}>PNG</button>
          </div>
        </div>)}
      </div>
      <button onClick={downloadZip} disabled={!!busy} style={{ marginTop: 10, width: "100%", padding: 10, background: T.gold, color: T.bg, border: "none", borderRadius: 0, fontFamily: T.ft, fontWeight: 700, fontSize: 15, letterSpacing: 1, cursor: "pointer" }}>
        {busy === "zip" ? "MONTANDO PACOTE..." : "BAIXAR PACOTE"}</button>
    </>}
    {aviso && <p style={{ fontSize: 12, color: T.gold, marginTop: 8, border: `1px solid ${T.gold}`, padding: 8 }}>{AVISO_C}</p>}
  </div>;
}
