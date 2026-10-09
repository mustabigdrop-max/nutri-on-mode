// Estúdio de Cards — Agente de Cards, editor, biblioteca "Meus cards" e brand kit. Texto sempre desenhado em código.
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import {
  agenteCards, bloqueio, recusaBloqueio, limitarPalavras, palavras, tipoDoTemplate,
  TEMPLATES, ALL_SCENES, FORMATOS, MAX_PALAVRAS, type CardContent, type Formato, type Proposal, type TemplateId, type CardTipo, type SceneId, type FonteCtx,
} from "@/lib/cardStudio";
import { CardTemplate, DEFAULT_BRAND, type Brand } from "./cardStudio/CardTemplate";
import { Scene, SCENE_NAMES } from "./cardStudio/Scenes";
import { KitAgente, KitMini } from "./cardStudio/KitAgente";
import { KitCardView } from "./cardStudio/KitCardView";
import { ReelCards } from "./cardStudio/ReelCards";
import { acharDuplicados, type CardSalvo } from "@/lib/reelCards";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", red: "#EF4444", muted: "#888", text: "#E8E8F0", ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const AVISO_GERADA = "Ilustrações estilizadas e conceituais costumam ficar fora das regras de rótulo, mas confira as regras atuais do Instagram e do TikTok sobre conteúdo gerado antes de publicar.";
const btn = (c: string, solid = false): React.CSSProperties => ({ background: solid ? c : "none", border: `1px solid ${c}`, color: solid ? T.bg : c, borderRadius: 0, fontFamily: T.fm, fontSize: 10, padding: "6px 10px", cursor: "pointer", letterSpacing: .5 });
const input: React.CSSProperties = { width: "100%", background: T.s2, border: "1px solid #ffffff20", color: T.text, borderRadius: 0, padding: 8, fontSize: 13, boxSizing: "border-box" };
const label: React.CSSProperties = { fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: 1, margin: "8px 0 3px", display: "block" };

interface Row { topic_slug?: string | null; subtema_slug?: string | null; pacote?: string | null; variante_imagem?: string | null; verif_status?: string | null; id: string; script_id: string | null; bloco_ref: number | null; tipo: CardTipo; template: TemplateId; formato: Formato; conteudo: CardContent; ilustracao_origem: string | null; imagem_path: string | null; nome: string | null; created_at: string }
interface Reel { id: string; tema: string; titulo: string | null; roteiro: any; fonte_status: string | null; tipo_afirmacao: string | null }

function Thumb({ p, formato, brand, width = 150, fundo, gerada }: { p: Proposal; formato: Formato; brand: Brand; width?: number; fundo?: string | null; gerada?: boolean }) {
  const { w, h } = FORMATOS[formato]; const k = width / w;
  return <div style={{ width, height: h * k, overflow: "hidden", position: "relative", border: "1px solid #ffffff15" }}>
    <div style={{ transform: `scale(${k})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0, width: w, height: h, maxWidth: "none" }}><CardTemplate template={p.template} conteudo={p.conteudo} formato={formato} brand={brand} fundoUrl={fundo} gerada={gerada} /></div>
  </div>;
}

export default function CardStudioPanel() {
  const [uid, setUid] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);
  const [limiteGerada, setLimiteGerada] = useState(5);
  const [brandOpen, setBrandOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  useEffect(() => { const h = (e: Event) => setCmd(String((e as CustomEvent).detail ?? "").slice(0, 1000)); window.addEventListener("cc-card-pedido", h); return () => window.removeEventListener("cc-card-pedido", h); }, []);
  const [reply, setReply] = useState<ReturnType<typeof agenteCards> | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [reelId, setReelId] = useState("");
  const [fonte, setFonte] = useState<FonteCtx | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [edit, setEdit] = useState<Row | null>(null);
  const [quota, setQuota] = useState<{ disponivel: boolean; limite: number; restantes: number; custo_estimado: number } | null>(null);
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [fReel, setFReel] = useState(""); const [fTipo, setFTipo] = useState(""); const [fFormato, setFFormato] = useState("");
  const [stage, setStage] = useState<Row[]>([]);
  const [assunto, setAssunto] = useState("");
  const [proibidas, setProibidas] = useState<string[]>([]);
  const [fTema, setFTema] = useState(""); const [fSub, setFSub] = useState(""); const [fPac, setFPac] = useState(""); const [fVar, setFVar] = useState(""); const [fVer, setFVer] = useState("");
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  async function signed(path: string) { const { data } = await supabase.storage.from("cuts").createSignedUrl(path, 3600); return data?.signedUrl ?? null; }

  async function load() {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) return; setUid(u.user.id);
    const [bk, rs, cs] = await Promise.all([
      supabase.from("brand_kit").select("*").eq("user_id", u.user.id).maybeSingle(),
      supabase.from("retention_scripts").select("id,tema,titulo,roteiro,fonte_status,tipo_afirmacao").order("created_at", { ascending: false }).limit(40),
      supabase.from("studio_cards").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    // @ prefilled from the connected profile when the brand kit has none.
    let ig: string | null = null;
    try { const st = await supabase.functions.invoke("instagram-publish", { body: { action: "status" } }); ig = (st.data as any)?.result?.account?.username ?? null; } catch { /* sem perfil */ }
    if (!bk.data?.handle && ig) setBrand(b => ({ ...b, handle: `@${String(ig).replace(/^@/, "")}` }));
    if (bk.data) { const logo = bk.data.logo_url ? await signed(bk.data.logo_url) : null;
      setBrand({ ...bk.data, logo, handle: bk.data.handle || (ig ? `@${String(ig).replace(/^@/, "")}` : null) } as any); setLimiteGerada(bk.data.limite_diario_gerada); }
    setReels((rs.data ?? []) as Reel[]);
    const pr = await supabase.from("engine_prompts").select("conteudo").eq("user_id", u.user.id).eq("chave", "proibidas").maybeSingle();
    setProibidas(String((pr.data as any)?.conteudo ?? "").split("\n").map(x => x.trim()).filter(Boolean));
    const list = (cs.data ?? []) as unknown as Row[]; setRows(list);
    const m: Record<string, string> = {}; for (const r of list) if (r.imagem_path) { const s = await signed(r.imagem_path); if (s) m[r.id] = s; } setUrls(m);
    const q = await supabase.functions.invoke("gerar_card_ilustracao", { body: { action: "quota" } }); setQuota(q.data ?? { disponivel: false, limite: 5, restantes: 0, custo_estimado: 0 });
  }
  useEffect(() => { load(); }, []);

  const reel = reels.find(r => r.id === reelId) ?? null;
  useEffect(() => { (async () => {
    if (!reel) { setFonte(null); return; }
    const { data } = await supabase.from("script_sources").select("referencia").eq("script_id", reel.id).order("ordem").limit(1);
    setFonte({ fonte_status: reel.fonte_status, tipo_afirmacao: reel.tipo_afirmacao, referencia: data?.[0]?.referencia ?? null });
  })(); }, [reelId]);

  async function saveBrand(next: Brand, limite = limiteGerada) {
    if (!uid) return; const { logo, ...rest } = next as any;
    const { error } = await supabase.from("brand_kit").upsert({ user_id: uid, cor_primaria: rest.cor_primaria, cor_secundaria: rest.cor_secundaria, cor_fundo: rest.cor_fundo, fonte_titulo: rest.fonte_titulo, handle: rest.handle || null, margem_topo: rest.margem_topo, margem_base: rest.margem_base, limite_diario_gerada: limite, updated_at: new Date().toISOString() });
    setMsg(error ? "Não salvou o brand kit." : "Brand kit salvo.");
  }
  async function uploadLogo(file: File) {
    if (!uid) return; if (!file.type.startsWith("image/") || file.size > 2_000_000) { setMsg("Envie uma imagem sua de até 2 MB."); return; }
    const path = `${uid}/logo/logo_${Date.now()}.${file.name.split(".").pop() || "png"}`;
    const up = await supabase.storage.from("cuts").upload(path, file, { upsert: true, contentType: file.type });
    if (up.error) { setMsg("Falha ao enviar o logo."); return; }
    await supabase.from("brand_kit").upsert({ user_id: uid, logo_url: path });
    setBrand(b => ({ ...b, logo: null })); load();
  }

  function runAgent(x = cmd) {
    setMsg(null); const b = bloqueio(x);
    if (b) { setReply(agenteCards(x, fonte)); setAssunto(""); return; }
    setReply(null); setAssunto(x.replace(/^(cards?|kit)\s+(sobre|de)\s+/i, "").trim());
  }

  async function insertCard(p: Proposal & { bloco_ref?: number | null; nome?: string; tipo?: CardTipo }, formato: Formato = "9:16") {
    if (!uid) throw new Error("Faça login.");
    const { data, error } = await supabase.from("studio_cards").insert({ user_id: uid, script_id: reelId || null, bloco_ref: p.bloco_ref ?? null, tipo: p.tipo ?? tipoDoTemplate(p.template), template: p.template, formato, conteudo: p.conteudo as any, ilustracao_origem: p.conteudo.cena ? "codigo" : null, nome: p.nome ?? limitarPalavras(p.conteudo.titulo, 5) }).select("*").single();
    if (error) throw error; return data as unknown as Row;
  }
  async function choose(p: Proposal) { try { const r = await insertCard(p); setEdit(r); setReply(null); load(); } catch (e: any) { setMsg(e.message); } }

  async function saveEdit(r: Row) {
    const t = r.conteudo.titulo; const b = bloqueio(`${t} ${r.conteudo.apoio ?? ""} ${(r.conteudo.itens ?? []).join(" ")}`);
    if (b) { setMsg(recusaBloqueio(b)); return; }
    if (r.template === "numero" && !r.conteudo.fonte) { setMsg("Sem fonte verificada, não gero card de dado. Posso fazer um card conceitual."); return; }
    const tipo = r.ilustracao_origem === "gerada" ? "C" : tipoDoTemplate(r.template);
    const { error } = await supabase.from("studio_cards").update({ template: r.template, formato: r.formato, conteudo: { ...r.conteudo, editado: true } as any, tipo, nome: r.nome, ilustracao_origem: r.ilustracao_origem }).eq("id", r.id);
    setMsg(error ? "Não salvou." : "Card salvo."); load();
  }
  async function duplicate(r: Row) { if (!uid) return; await supabase.from("studio_cards").insert({ user_id: uid, script_id: r.script_id, bloco_ref: r.bloco_ref, tipo: r.ilustracao_origem === "gerada" ? tipoDoTemplate(r.template) : r.tipo, template: r.template, formato: r.formato, conteudo: r.conteudo as any, ilustracao_origem: r.conteudo.cena ? "codigo" : null, nome: `${r.nome ?? "card"} (cópia)` }); load(); }
  async function remove(r: Row) { await supabase.from("studio_cards").delete().eq("id", r.id); if (edit?.id === r.id) setEdit(null); load(); }

  async function genIllustration(r: Row) {
    if (!quota?.disponivel) return;
    const b = bloqueio(desc); if (b) { setMsg(recusaBloqueio(b)); return; }
    if (!confirm(`Estimativa: cerca de US$ ${quota.custo_estimado.toFixed(2)} por ilustração. Restam ${quota.restantes} de ${quota.limite} hoje. Gerar?`)) return;
    setBusy("ilus"); setMsg(null);
    const { data, error } = await supabase.functions.invoke("gerar_card_ilustracao", { body: { card_id: r.id, descricao: desc } });
    const e = (data as any)?.error ?? (error ? await (error as any).context?.json?.().then((j: any) => j?.error).catch(() => null) ?? "Falha ao gerar." : null);
    if (e) setMsg(e); else { await load(); const { data: fresh } = await supabase.from("studio_cards").select("*").eq("id", r.id).single(); if (fresh) setEdit(fresh as unknown as Row); }
    setBusy(null);
  }

  // exportação: renderiza fora da tela em tamanho real e captura
  async function capture(list: Row[]) {
    setStage(list); await new Promise(r => setTimeout(r, 120)); await document.fonts.ready;
    const out: { r: Row; blob: Blob }[] = [];
    for (const r of list) {
      const el = stageRefs.current[r.id]; if (!el) continue;
      const cv = await html2canvas(el, { useCORS: true, backgroundColor: null, scale: 1, width: FORMATOS[r.formato].w, height: FORMATOS[r.formato].h });
      out.push({ r, blob: await new Promise<Blob>(res => cv.toBlob(b => res(b!), "image/png")) });
    }
    setStage([]); return out;
  }
  const fileName = (r: Row, i: number) => `${String(i + 1).padStart(2, "0")}_${(r.nome ?? r.template).replace(/[^\w-]+/g, "_").slice(0, 30)}_${r.formato.replace(":", "x")}.png`;
  async function downloadPng(r: Row) { setBusy("png"); const [o] = await capture([r]); if (o) { const a = document.createElement("a"); a.href = URL.createObjectURL(o.blob); a.download = fileName(r, 0); a.click(); } setBusy(null); }
  async function downloadZip(list: Row[]) {
    if (!list.length) return; setBusy("zip"); const zip = new JSZip();
    (await capture(list)).forEach(({ r, blob }, i) => zip.file(fileName(r, i), blob));
    const a = document.createElement("a"); a.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" })); a.download = "cards.zip"; a.click(); setBusy(null);
  }

  const filtered = useMemo(() => rows.filter(r => (!fReel || r.script_id === fReel) && (!fTipo || r.tipo === fTipo) && (!fFormato || r.formato === fFormato) && (!fTema || r.topic_slug === fTema) && (!fSub || r.subtema_slug === fSub) && (!fPac || r.pacote === fPac) && (!fVar || r.variante_imagem === fVar) && (!fVer || r.verif_status === fVer)), [rows, fReel, fTipo, fFormato, fTema, fSub, fPac, fVar, fVer]);
  const uniq = (k: keyof Row) => [...new Set(rows.map(r => r[k]).filter(Boolean) as string[])];
  const upd = (patch: Partial<CardContent>) => edit && setEdit({ ...edit, conteudo: { ...edit.conteudo, ...patch } });
  const nPal = edit ? palavras(edit.conteudo.titulo) : 0;

  return <div style={{ color: T.text }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div><div style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan, letterSpacing: 2 }}>ESTÚDIO DE CARDS</div>
        <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 20 }}>Agente de Cards</div></div>
      <button style={btn(T.gold)} onClick={() => setBrandOpen(o => !o)}>{brandOpen ? "FECHAR BRAND KIT" : "BRAND KIT"}</button>
    </div>

    {!brand.handle && <div style={{ fontFamily: T.fm, fontSize: 10, color: T.gold, marginTop: 8 }}>Preencha o @ para ele aparecer nos cards.</div>}
    {brandOpen && <div style={{ background: T.s2, padding: 12, marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {(["cor_primaria", "cor_secundaria", "cor_fundo"] as const).map(k => <label key={k}><span style={label}>{k.replace("cor_", "COR ").toUpperCase()}</span>
          <input type="color" value={brand[k]} onChange={e => setBrand({ ...brand, [k]: e.target.value })} style={{ width: "100%", height: 34, background: "none", border: "none" }} /></label>)}
      </div>
      <span style={label}>FONTE DO TÍTULO</span>
      <select value={brand.fonte_titulo} onChange={e => setBrand({ ...brand, fonte_titulo: e.target.value })} style={input}>{["Rajdhani", "Space Grotesk", "Bebas Neue", "Archivo Black"].map(f => <option key={f}>{f}</option>)}</select>
      <span style={label}>@ DO PERFIL</span><input style={input} value={brand.handle ?? ""} placeholder="@seu.perfil" onChange={e => setBrand({ ...brand, handle: e.target.value })} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <label><span style={label}>MARGEM TOPO (9:16)</span><input type="number" style={input} value={brand.margem_topo} onChange={e => setBrand({ ...brand, margem_topo: Math.max(0, Math.min(600, +e.target.value)) })} /></label>
        <label><span style={label}>MARGEM BASE (9:16)</span><input type="number" style={input} value={brand.margem_base} onChange={e => setBrand({ ...brand, margem_base: Math.max(0, Math.min(700, +e.target.value)) })} /></label>
        <label><span style={label}>ILUSTRAÇÕES/DIA</span><input type="number" style={input} value={limiteGerada} onChange={e => setLimiteGerada(Math.max(0, Math.min(50, +e.target.value)))} /></label>
      </div>
      <span style={label}>LOGO (SÓ IMAGEM SUA)</span><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} style={{ fontSize: 11 }} />
      <button style={{ ...btn(T.cyan, true), marginTop: 10, width: "100%" }} onClick={() => saveBrand(brand)}>SALVAR BRAND KIT</button>
    </div>}

    <span style={label}>COMANDO</span>
    <div style={{ display: "flex", gap: 6 }}>
      <input style={input} value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={e => e.key === "Enter" && runAgent()} placeholder='Ex.: "creatina"' />
      <button style={btn(T.cyan, true)} onClick={() => runAgent()}>GERAR</button>
    </div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
      {["creatina", "intenção versus ação", "sono"].map(x => <button key={x} style={btn(T.muted)} onClick={() => { setCmd(x); runAgent(x); }}>{x}</button>)}
    </div>
    <span style={label}>REEL (OPCIONAL)</span>
    <select style={input} value={reelId} onChange={e => setReelId(e.target.value)}><option value="">Nenhum</option>{reels.map(r => <option key={r.id} value={r.id}>{r.titulo || r.tema}</option>)}</select>
    <ReelCards uid={uid} reel={reel} brand={brand} rows={rows as any} onSaved={async (id, m) => { setFReel(id); await load(); setMsg(m); }} />

    {reply?.tipo === "recusa" && <div style={{ border: `1px solid ${T.gold}`, padding: 10, marginTop: 10, fontSize: 13 }}>
      <div style={{ color: T.gold }}>{reply.mensagem}</div>
      {reply.alternativa && <div style={{ display: "flex", gap: 8, marginTop: 8 }}>{reply.alternativa.map((p, i) => <div key={i} onClick={() => choose(p)} style={{ cursor: "pointer" }}><Thumb p={p} formato="9:16" brand={brand} width={110} /><div style={{ fontFamily: T.fm, fontSize: 9, color: T.cyan }}>USAR CARD DE TEXTO</div></div>)}</div>}
    </div>}
    {assunto && <KitAgente uid={uid} assunto={assunto} brand={brand} proibidas={proibidas} geradorDisponivel={!!quota?.disponivel} onSaved={load} />}
    {msg && <p style={{ fontSize: 12, color: T.gold, margin: "8px 0 0" }}>{msg}</p>}

    {edit && <div style={{ background: T.s2, padding: 12, marginTop: 12, display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 }}>
      <div style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan }}>EDITOR · {edit.nome}</div>
      <div style={{ display: "flex", justifyContent: "center" }}><Thumb p={{ template: edit.template, conteudo: edit.conteudo }} formato={edit.formato} brand={brand} width={230} fundo={edit.ilustracao_origem === "gerada" ? urls[edit.id] : null} gerada={edit.ilustracao_origem === "gerada"} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label><span style={label}>TEMPLATE</span><select style={input} value={edit.template} onChange={e => setEdit({ ...edit, template: e.target.value as TemplateId })}>{TEMPLATES.map(t => <option key={t.id} value={t.id} disabled={t.id === "numero" && !edit.conteudo.fonte}>{t.nome}{t.id === "numero" && !edit.conteudo.fonte ? " (precisa de fonte)" : ""}</option>)}</select></label>
        <label><span style={label}>FORMATO</span><select style={input} value={edit.formato} onChange={e => setEdit({ ...edit, formato: e.target.value as Formato })}>{(["9:16", "4:5", "1:1"] as Formato[]).map(f => <option key={f}>{f}</option>)}</select></label>
      </div>
      <label><span style={label}>TEXTO PRINCIPAL · {nPal}/{MAX_PALAVRAS} PALAVRAS</span>
        <input style={input} value={edit.conteudo.titulo} onChange={e => { const v = e.target.value; upd({ titulo: palavras(v) > MAX_PALAVRAS ? limitarPalavras(v) : v }); }} /></label>
      {(edit.template === "mito_verdade" || edit.template === "comparacao") && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label><span style={label}>{edit.template === "mito_verdade" ? "MITO" : "ESQUERDA"}</span><input style={input} value={edit.conteudo.esquerda ?? ""} onChange={e => upd({ esquerda: e.target.value })} /></label>
        <label><span style={label}>{edit.template === "mito_verdade" ? "VERDADE" : "DIREITA"}</span><input style={input} value={edit.conteudo.direita ?? ""} onChange={e => upd({ direita: e.target.value })} /></label></div>}
      {["passos", "lista3", "timeline"].includes(edit.template) && <label><span style={label}>ITENS (UM POR LINHA, 3 A 5)</span>
        <textarea style={{ ...input, minHeight: 80 }} value={(edit.conteudo.itens ?? []).join("\n")} onChange={e => upd({ itens: e.target.value.split("\n").slice(0, 5) })} /></label>}
      {edit.template === "pergunta" && <label><span style={label}>LINHA DE RESPOSTA</span><input style={input} value={edit.conteudo.apoio ?? ""} onChange={e => upd({ apoio: e.target.value })} /></label>}
      {edit.template === "capa_serie" && <label><span style={label}>PARTE</span><input type="number" min={1} style={input} value={edit.conteudo.parte ?? 1} onChange={e => upd({ parte: Math.max(1, +e.target.value) })} /></label>}
      {edit.template === "numero" && <div style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>Fonte: {edit.conteudo.fonte}</div>}

      <span style={label}>ILUSTRAÇÃO EM CÓDIGO (SEM CUSTO)</span>
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
        <button style={{ ...btn(edit.conteudo.cena ? T.muted : T.cyan), minWidth: 54 }} onClick={() => { upd({ cena: null }); }}>NENHUMA</button>
        {ALL_SCENES.map(s => <button key={s} title={SCENE_NAMES[s]} onClick={() => { setEdit({ ...edit, ilustracao_origem: "codigo", conteudo: { ...edit.conteudo, cena: s as SceneId } }); }}
          style={{ minWidth: 54, height: 54, padding: 4, background: T.bg, border: `1px solid ${edit.conteudo.cena === s && edit.ilustracao_origem !== "gerada" ? T.cyan : "#ffffff15"}`, cursor: "pointer" }}><Scene id={s} cor={brand.cor_primaria} acento={brand.cor_secundaria} /></button>)}
      </div>
      <label><span style={label}>INTENSIDADE</span><input type="range" min={.3} max={1} step={.05} value={edit.conteudo.intensidade ?? .85} onChange={e => upd({ intensidade: +e.target.value })} style={{ width: "100%" }} /></label>

      <span style={label}>ILUSTRAÇÃO GERADA (OPCIONAL)</span>
      {!quota?.disponivel ? <div style={{ fontSize: 12, color: T.muted }}>Indisponível neste projeto.</div> : <div>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Custo estimado: cerca de US$ {quota.custo_estimado.toFixed(2)} por ilustração · hoje: {quota.limite - quota.restantes}/{quota.limite}</div>
        <div style={{ display: "flex", gap: 6 }}><input style={input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex.: duas ilhas ligadas por uma ponte de luz" />
          <button style={btn(T.gold)} disabled={!!busy || quota.restantes <= 0} onClick={() => genIllustration(edit)}>{busy === "ilus" ? "..." : "GERAR"}</button></div>
        {edit.ilustracao_origem === "gerada" && <button style={{ ...btn(T.muted), marginTop: 6 }} onClick={() => setEdit({ ...edit, ilustracao_origem: "codigo" })}>VOLTAR PARA CENA EM CÓDIGO</button>}
        <p style={{ fontSize: 11, color: T.gold, border: `1px solid ${T.gold}55`, padding: 8, margin: "6px 0 0" }}>{AVISO_GERADA}</p>
      </div>}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button style={btn(T.cyan, true)} onClick={() => saveEdit(edit)}>SALVAR</button>
        <button style={btn(T.gold)} disabled={!!busy} onClick={async () => { await saveEdit(edit); downloadPng(edit); }}>{busy === "png" ? "..." : "BAIXAR PNG"}</button>
        <button style={btn(T.text)} onClick={() => duplicate(edit)}>DUPLICAR</button>
        <button style={btn(T.muted)} onClick={() => setEdit(null)}>FECHAR</button>
      </div>
    </div>}

    <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
      <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 16 }}>Meus cards <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{filtered.length}</span></div>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={btn(T.red)} disabled={!!busy} onClick={() => { const d = acharDuplicados(rows as any); setDups(d); if (!d.length) setMsg("Nenhum card duplicado."); }}>REMOVER DUPLICADOS</button>
        <button style={btn(T.gold, true)} disabled={!filtered.length || !!busy} onClick={() => downloadZip(filtered)}>{busy === "zip" ? "MONTANDO..." : "BAIXAR TODOS (ZIP)"}</button>
      </div>
    </div>
    {dups && dups.length > 0 && <div role="dialog" aria-label="Remover duplicados" style={{ border: `1px solid ${T.red}`, padding: 10, marginTop: 8 }}>
      <div style={{ fontSize: 13 }}>{dups.reduce((n, g) => n + g.apagar.length, 0)} cards duplicados em {dups.length} grupos. Fica um de cada.</div>
      <div style={{ maxHeight: 180, overflowY: "auto", marginTop: 6 }}>{dups.map((g, i) => <div key={i} style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{g.apagar.length + 1}× {(g.manter as any).conteudo?.rotulo ?? g.manter.nome ?? g.manter.template} — {String((g.manter as any).conteudo?.titulo ?? (g.manter as any).conteudo?.card?.principal ?? "").slice(0, 60)}</div>)}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button style={btn(T.red, true)} onClick={async () => { const ids = dups.flatMap(g => g.apagar.map(r => r.id)); const { error } = await supabase.from("studio_cards").delete().in("id", ids); setDups(null); setMsg(error ? "Não apagou." : `${ids.length} duplicados removidos.`); load(); }}>APAGAR DUPLICADOS</button>
        <button style={btn(T.muted)} onClick={() => setDups(null)}>CANCELAR</button></div>
    </div>}
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 6, marginTop: 6 }}>
      <select style={input} value={fReel} onChange={e => setFReel(e.target.value)}><option value="">Todos os reels</option>{reels.map(r => <option key={r.id} value={r.id}>{r.titulo || r.tema}</option>)}</select>
      <select style={input} value={fTipo} onChange={e => setFTipo(e.target.value)}><option value="">Tipo</option><option value="A">A · dado</option><option value="B">B · texto</option><option value="D">D · diagrama</option><option value="C">C · ilustração</option></select>
      <select style={input} value={fFormato} onChange={e => setFFormato(e.target.value)}><option value="">Formato</option><option>9:16</option><option>4:5</option><option>1:1</option></select>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginTop: 6 }}>
      <select style={input} value={fTema} onChange={e => setFTema(e.target.value)} aria-label="Tema"><option value="">Tema</option>{uniq("topic_slug").map(x => <option key={x}>{x}</option>)}</select>
      <select style={input} value={fSub} onChange={e => setFSub(e.target.value)} aria-label="Subtema"><option value="">Subtema</option>{uniq("subtema_slug").map(x => <option key={x}>{x}</option>)}</select>
      <select style={input} value={fPac} onChange={e => setFPac(e.target.value)} aria-label="Pacote"><option value="">Pacote</option><option value="reel">Reel</option><option value="carrossel">Carrossel</option></select>
      <select style={input} value={fVar} onChange={e => setFVar(e.target.value)} aria-label="Imagem"><option value="">Imagem</option><option value="sem">Sem imagem</option><option value="ilustracao">Ilustração</option><option value="foto">Foto minha</option><option value="gerada">Gerada</option></select>
      <select style={input} value={fVer} onChange={e => setFVer(e.target.value)} aria-label="Verificador"><option value="">Verificador</option><option value="ok">OK</option><option value="aviso">Aviso</option><option value="bloqueio">Bloqueio</option></select>
    </div>
    {filtered.length === 0 ? <p style={{ fontSize: 12, color: T.muted }}>Nenhum card ainda. Digite um comando acima.</p> :
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8, marginTop: 8 }}>
        {filtered.map(r => <div key={r.id} style={{ background: T.s2, padding: 4, border: `1px solid ${edit?.id === r.id ? T.cyan : "#ffffff10"}` }}>
          {(r.conteudo as any)?.kit ? <KitMini c={(r.conteudo as any).card} formato={r.formato} brand={brand} variante={(r.conteudo as any).variante === "foto" ? "sem" : (r.conteudo as any).variante} width={102} /> : <div onClick={() => setEdit(r)} style={{ cursor: "pointer" }}><Thumb p={{ template: r.template, conteudo: r.conteudo }} formato={r.formato} brand={brand} width={102} fundo={r.ilustracao_origem === "gerada" ? urls[r.id] : null} gerada={r.ilustracao_origem === "gerada"} /></div>}
          <div style={{ fontFamily: T.fm, fontSize: 8, color: T.cyan, margin: "3px 0", display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            <span>{(r.conteudo as any)?.rotulo ?? (r.bloco_ref ? `Bloco ${r.bloco_ref} · ${r.tipo}` : r.tipo)}</span>
            <span style={{ border: `1px solid ${T.muted}`, color: T.muted, padding: "0 3px" }}>{r.formato}</span>
            {(r.conteudo as any)?.editado && <span style={{ color: T.gold }}>editado</span>}</div>
          <div style={{ display: "flex", gap: 3 }}><button style={{ ...btn(T.gold), padding: "3px 5px", fontSize: 8 }} onClick={() => downloadPng(r)}>PNG</button>
            <button style={{ ...btn(T.text), padding: "3px 5px", fontSize: 8 }} onClick={() => duplicate(r)}>DUP</button>
            <button style={{ ...btn(T.red), padding: "3px 5px", fontSize: 8 }} onClick={() => remove(r)}>×</button></div>
        </div>)}
      </div>}

    {stage.length > 0 && <div style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }} aria-hidden>
      {stage.map(r => (r.conteudo as any)?.kit ? <KitCardView key={r.id} ref={el => (stageRefs.current[r.id] = el)} c={(r.conteudo as any).card} formato={r.formato} brand={brand} variante={(r.conteudo as any).variante === "foto" ? "sem" : (r.conteudo as any).variante} /> : <CardTemplate key={r.id} ref={el => (stageRefs.current[r.id] = el)} template={r.template} conteudo={r.conteudo} formato={r.formato} brand={brand}
        fundoUrl={r.ilustracao_origem === "gerada" ? urls[r.id] : null} gerada={r.ilustracao_origem === "gerada"} />)}
    </div>}
  </div>;
}
