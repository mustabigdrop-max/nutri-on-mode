// Agente de Cards 2.0 — Temas relevantes → Kit (Reel / Carrossel) → Editor. Sem modelo; provas só do cadastro.
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { FORMATOS, type Formato } from "@/lib/cardStudio";
import {
  acharTema, ordenarSubtemas, montarKit, verificarKit, temaSemFonte, contagemFontes, temCardDado, VEREDITO, MELHOR_LABEL, ICONES,
  alternativasIcone, checklist, dicasDoSubtema, ordenarProvas, precisaAvisoSecundaria, AVISO_SECUNDARIA, SEM_FONTE_AVISO, AVISO_FOTO,
  ROTULOS_FOTO, fotoPermitida, RECUSA_FOTO, type Topic, type Subtema, type KitCard, type Pacote, type Prova, type Icone,
} from "@/lib/cardKits";
import seed from "@/data/cardTopics.json";
import type { Brand } from "./CardTemplate";
import { KitCardView, type Variante } from "./KitCardView";
import { KitIcon, ICONE_NOME } from "./KitIcons";

const T = { bg: "#020205", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", green: "#5DCAA5", amber: "#EF9F27", red: "#EF4444", muted: "#888", text: "#E8E8F0", ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const btn = (c: string, solid = false, dis = false): React.CSSProperties => ({ background: solid ? c : "none", border: `1px solid ${c}`, color: solid ? T.bg : c, borderRadius: 0, fontFamily: T.fm, fontSize: 10, padding: "6px 10px", cursor: dis ? "not-allowed" : "pointer", opacity: dis ? 0.45 : 1, letterSpacing: .5 });
const input: React.CSSProperties = { width: "100%", background: T.s2, border: "1px solid #ffffff20", color: T.text, borderRadius: 0, padding: 8, fontSize: 13, boxSizing: "border-box" };
const lbl: React.CSSProperties = { fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: 1, margin: "8px 0 3px", display: "block" };
const NIV_COR = { ok: T.green, aviso: T.amber, bloqueio: T.red } as const;
type Foto = { id: string; url: string; rotulo: string; signed?: string };

function Mini({ c, formato, brand, variante, foto, width = 220, onClick }: { c: KitCard; formato: Formato; brand: Brand; variante: Variante; foto?: string | null; width?: number; onClick?: () => void }) {
  const { w, h } = FORMATOS[formato]; const k = width / w;
  return <div onClick={onClick} style={{ width, height: h * k, overflow: "hidden", position: "relative", border: "1px solid #ffffff20", cursor: onClick ? "zoom-in" : "default", flex: "0 0 auto" }}>
    <div style={{ transform: `scale(${k})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0 }}><KitCardView c={c} formato={formato} brand={brand} variante={variante} fotoUrl={foto} /></div>
  </div>;
}

export function KitAgente({ uid, assunto, brand, proibidas, geradorDisponivel, onSaved }: { uid: string | null; assunto: string; brand: Brand; proibidas: string[]; geradorDisponivel: boolean; onSaved: () => void }) {
  const [temas, setTemas] = useState<Topic[]>(seed as unknown as Topic[]);
  const [sub, setSub] = useState<Subtema | null>(null);
  const [pacote, setPacote] = useState<Pacote>("reel");
  const [cards, setCards] = useState<KitCard[]>([]);
  const [variantes, setVariantes] = useState<Record<number, Variante>>({});
  const [fotoDe, setFotoDe] = useState<Record<number, string>>({});
  const [formato, setFormato] = useState<Formato>("9:16");
  const [sel, setSel] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [gaveta, setGaveta] = useState<Prova[] | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [fotosOpen, setFotosOpen] = useState(false);
  const [rotulo, setRotulo] = useState("ambiente");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const stage = useRef<Record<number, HTMLDivElement | null>>({});
  const [render, setRender] = useState(false);
  const touch = useRef<number | null>(null);

  // Seed idempotente por usuário (upsert por slug) e leitura dos temas.
  useEffect(() => { (async () => {
    if (!uid) return;
    const { data } = await supabase.from("card_topics").select("slug").eq("user_id", uid);
    const tem = new Set((data ?? []).map((r: any) => r.slug));
    const faltam = (seed as any[]).filter(s => !tem.has(s.slug));
    if (faltam.length) await supabase.from("card_topics").upsert(faltam.map(s => ({ user_id: uid, slug: s.slug, titulo: s.titulo, aliases: s.aliases, aviso_tema: s.aviso_tema, subtemas: s.subtemas })) as any, { onConflict: "user_id,slug", ignoreDuplicates: true });
    const { data: all } = await supabase.from("card_topics").select("*").eq("user_id", uid);
    if (all?.length) setTemas(all as unknown as Topic[]);
    const { data: ph } = await supabase.from("user_photos").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    const list: Foto[] = [];
    for (const f of (ph ?? []) as Foto[]) { const { data: s } = await supabase.storage.from("cuts").createSignedUrl(f.url, 3600); list.push({ ...f, signed: s?.signedUrl }); }
    setFotos(list);
  })(); }, [uid]);

  const tema = useMemo(() => acharTema(assunto, temas) ?? temaSemFonte(assunto), [assunto, temas]);
  const semFonte = !acharTema(assunto, temas);
  useEffect(() => { setSub(null); }, [assunto]);
  const abrir = (s: Subtema, p: Pacote = pacote) => {
    setSub(s); setPacote(p); const k = montarKit(tema, s, p); setCards(k); setSel(0); setMsg(null);
    setVariantes(Object.fromEntries(k.map(c => [c.idx, "ilustracao" as Variante]))); setFotoDe({});
    setFormato(p === "reel" ? "9:16" : "4:5");
  };
  const ver = sub ? verificarKit(cards, sub, proibidas) : null;
  const c = cards[sel];
  const upd = (patch: Partial<KitCard>) => setCards(cs => cs.map((x, i) => i === sel ? { ...x, ...patch } : x));
  const fotoUrl = (idx: number) => fotos.find(f => f.id === fotoDe[idx])?.signed ?? null;
  const varDe = (idx: number): Variante => variantes[idx] === "foto" && !fotoUrl(idx) ? "sem" : (variantes[idx] ?? "ilustracao");

  async function enviarFoto(file: File) {
    if (!uid) return;
    if (!fotoPermitida(rotulo)) { setMsg(RECUSA_FOTO); return; }
    if (!file.type.startsWith("image/") || file.size > 5_000_000) { setMsg("Envie uma imagem sua de até 5 MB."); return; }
    const path = `${uid}/photos/${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
    const up = await supabase.storage.from("cuts").upload(path, file, { contentType: file.type });
    if (up.error) { setMsg("Falha ao enviar a foto."); return; }
    const { data } = await supabase.from("user_photos").insert({ user_id: uid, url: path, rotulo } as any).select().single();
    const { data: s } = await supabase.storage.from("cuts").createSignedUrl(path, 3600);
    if (data) setFotos(f => [{ ...(data as any), signed: s?.signedUrl }, ...f]);
  }
  const usarFoto = (f: Foto) => { if (!fotoPermitida(f.rotulo)) { setMsg(RECUSA_FOTO); return; } setFotoDe(m => ({ ...m, [sel]: f.id })); setVariantes(v => ({ ...v, [sel]: "foto" })); };

  async function capturar(idxs: number[]) {
    setRender(true); await new Promise(r => setTimeout(r, 150)); await document.fonts.ready;
    const out: Blob[] = [];
    for (const i of idxs) { const el = stage.current[i]; if (!el) continue; const cv = await html2canvas(el, { useCORS: true, backgroundColor: null, scale: 1, width: FORMATOS[formato].w, height: FORMATOS[formato].h }); out.push(await new Promise<Blob>(res => cv.toBlob(b => res(b!), "image/png"))); }
    setRender(false); return out;
  }
  const podeExportar = () => {
    if (!ver?.exporta) { setMsg(ver?.kit[0]?.motivo ?? "O verificador encontrou bloqueios. Corrija antes de exportar."); return false; }
    if (precisaAvisoSecundaria(cards) && !confirm(AVISO_SECUNDARIA)) return false;
    return true;
  };
  const nome = (i: number) => `${String(i + 1).padStart(2, "0")}_${tema.slug}_${sub?.slug}_${cards[i].papel}_${formato.replace(":", "x")}.png`;
  async function baixarCard() {
    if (!ver || ver.nivelCard[sel] === "bloqueio") { setMsg("Este card tem bloqueio do verificador."); return; }
    if (cards[sel].prova?.nivel === "secundaria" && !confirm(AVISO_SECUNDARIA)) return;
    setBusy("png"); const [b] = await capturar([sel]); if (b) { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = nome(sel); a.click(); } setBusy(null);
  }
  async function baixarKit() {
    if (!podeExportar()) return; setBusy("zip");
    const blobs = await capturar(cards.map((_, i) => i)); const zip = new JSZip(); blobs.forEach((b, i) => zip.file(nome(i), b));
    const a = document.createElement("a"); a.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" })); a.download = `kit_${tema.slug}_${sub?.slug}_${pacote}.zip`; a.click(); setBusy(null);
  }
  async function salvar() {
    if (!uid || !sub || !ver) return; setBusy("salvar");
    const verif = { geral: ver.geral, kit: ver.kit, porCard: ver.porCard };
    const varKit = [...new Set(cards.map(x => varDe(x.idx)))]; const vk = varKit.length === 1 ? varKit[0] : "ilustracao";
    const { data: kit, error } = await supabase.from("card_kits").insert({ user_id: uid, topic_slug: tema.slug, subtema_slug: sub.slug, pacote, variante_imagem: vk, cards: cards as any, verificacao: verif as any }).select("id").single();
    if (error || !kit) { setMsg("Não salvou o kit."); setBusy(null); return; }
    const tpl: Record<string, string> = { capa: "capa_serie", gancho: "pergunta", mito_verdade: "mito_verdade", dizem_estudos: "comparacao", prova: "numero", dizer: "comparacao", limites: "lista3", fontes: "lista3" };
    await supabase.from("studio_cards").insert(cards.map((x, i) => ({
      user_id: uid, tipo: x.papel === "prova" ? "A" : "B", template: tpl[x.papel] ?? "pergunta", formato, nome: `${String(i + 1).padStart(2, "0")} ${sub.titulo} · ${x.papel}`,
      conteudo: { kit: true, card: x, variante: varDe(x.idx), titulo: x.principal } as any, ilustracao_origem: varDe(x.idx) === "ilustracao" ? "codigo" : null,
      kit_id: (kit as any).id, topic_slug: tema.slug, subtema_slug: sub.slug, pacote, selo: x.selo ?? null, prova_ref: (x.prova ?? null) as any, dica: x.dica, alt_texto: x.alt, variante_imagem: varDe(x.idx), verif_status: ver.nivelCard[i],
    })) as any);
    setBusy(null); setMsg("Kit salvo em Meus cards."); onSaved();
  }

  // Navegação por seta no zoom
  useEffect(() => {
    if (zoom == null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") setZoom(z => Math.min(cards.length - 1, (z ?? 0) + 1)); if (e.key === "ArrowLeft") setZoom(z => Math.max(0, (z ?? 0) - 1)); if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [zoom, cards.length]);

  /* ── Tela "Temas relevantes" ── */
  if (!sub) return <div style={{ marginTop: 12 }}>
    {semFonte && <div style={{ border: `1px solid ${T.amber}`, padding: 10, marginBottom: 10, fontSize: 13 }}>
      <div style={{ color: T.amber }}>{SEM_FONTE_AVISO}</div>
      <button style={{ ...btn(T.muted, false, true), marginTop: 8 }} disabled title="Disponível com a Sala de Pesquisa">PESQUISAR ESTE TEMA</button>
      <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, marginLeft: 8 }}>Disponível com a Sala de Pesquisa</span>
    </div>}
    <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Temas relevantes · {tema.titulo}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 10 }}>
      {ordenarSubtemas(tema.subtemas).map(s => { const v = VEREDITO[s.veredito]; const capa = montarKit(tema, s, "reel")[0];
        return <div key={s.slug} style={{ background: T.s2, border: `1px solid ${v.cor}55`, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.fm, fontSize: 9, color: T.bg, background: v.cor, padding: "2px 6px" }}>{s.sem_pesquisa ? "SEM PESQUISA" : v.label.toUpperCase()}</span>
            {!s.sem_pesquisa && <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted }}>{contagemFontes(s)}</span>}
          </div>
          <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 17 }}>{s.titulo}</div>
          <div style={{ fontFamily: T.fm, fontSize: 9, color: T.cyan }}>MELHOR PARA: {MELHOR_LABEL[s.melhor_para].toUpperCase()}</div>
          {s.fala_segura && <div style={{ fontSize: 12 }}><span style={{ color: T.muted }}>O que dá para dizer: </span>{s.fala_segura}</div>}
          {!temCardDado(s) && s.bloqueio_prova && <div style={{ fontSize: 11, color: s.veredito === "bloqueado" ? T.red : T.muted }}>Sem card de dado: {s.bloqueio_prova}</div>}
          <Mini c={capa} formato="9:16" brand={brand} variante="ilustracao" width={120} />
          <div style={{ display: "flex", gap: 6 }}>
            <button style={btn(T.cyan, true)} onClick={() => abrir(s)}>ABRIR KIT</button>
            {s.veredito === "bloqueado" && <button style={btn(T.muted, false, true)} disabled title="Disponível com a Sala de Pesquisa">PESQUISAR</button>}
          </div>
        </div>; })}
    </div>
  </div>;

  /* ── Kit + editor ── */
  const d = dicasDoSubtema(sub, cards);
  const ck = c ? checklist(c, cards, sub, brand, formato) : [];
  return <div style={{ marginTop: 12 }}>
    <button style={btn(T.muted)} onClick={() => setSub(null)}>← TEMAS RELEVANTES</button>
    <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 20, margin: "6px 0" }}>{tema.titulo} · {sub.titulo}</div>
    {tema.aviso_tema && <div style={{ border: `1px solid ${T.amber}`, color: T.amber, padding: 8, fontSize: 12, marginBottom: 8 }}>{tema.aviso_tema}</div>}
    <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
      <button style={btn(T.cyan, pacote === "reel")} onClick={() => abrir(sub, "reel")}>REEL (CARDS DE APOIO)</button>
      <button style={btn(T.cyan, pacote === "carrossel")} onClick={() => abrir(sub, "carrossel")}>CARROSSEL</button>
      {sub.provas.length > 0 && <button style={btn(T.gold)} onClick={() => setGaveta(sub.provas)}>VER PROVAS ({sub.provas.length})</button>}
    </div>
    {ver && ver.kit.map((a, i) => <div key={i} style={{ color: T.red, fontSize: 12, marginBottom: 6 }}>● {a.motivo}</div>)}

    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}
      onTouchStart={e => (touch.current = e.touches[0].clientX)} onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 60) setSel(s => Math.max(0, Math.min(cards.length - 1, s + (dx < 0 ? 1 : -1)))); touch.current = null; }}>
      {cards.map((x, i) => <div key={i} style={{ border: `2px solid ${i === sel ? T.cyan : "transparent"}`, padding: 2 }}>
        <div onClick={() => setSel(i)}><Mini c={x} formato={formato} brand={brand} variante={varDe(i)} foto={fotoUrl(i)} width={220} onClick={() => { setSel(i); setZoom(i); }} /></div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4, fontFamily: T.fm, fontSize: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: NIV_COR[ver?.nivelCard[i] ?? "ok"] }} />{String(i + 1).padStart(2, "0")} · {x.papel.replace("_", " ")}
        </div>
        <div style={{ fontFamily: T.fm, fontSize: 9, color: T.gold, maxWidth: 220 }} title={x.dica}>DICA · {x.dica}</div>
        {(ver?.porCard[i] ?? []).map((a, j) => <div key={j} style={{ fontSize: 10, color: NIV_COR[a.nivel], maxWidth: 220 }}>{a.motivo}</div>)}
      </div>)}
    </div>
    {msg && <p style={{ fontSize: 12, color: T.gold, margin: "4px 0" }}>{msg}</p>}

    {c && <div style={{ background: T.s2, padding: 12, marginTop: 6 }}>
      <div style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan }}>EDITOR · CARD {String(sel + 1).padStart(2, "0")}</div>
      <span style={lbl}>VARIANTES DE IMAGEM (LADO A LADO)</span>
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {(["sem", "ilustracao", "foto", "gerada"] as Variante[]).map(v => {
          const dis = v === "foto" ? !fotoUrl(sel) : v === "gerada";
          return <div key={v} style={{ textAlign: "center" }}>
            {v === "gerada" ? <div style={{ width: 110, height: formato === "9:16" ? 196 : 138, border: "1px dashed #ffffff30", display: "grid", placeItems: "center", fontFamily: T.fm, fontSize: 9, color: T.muted, padding: 6 }}>{geradorDisponivel ? "Salve em Meus cards e gere no editor" : "Indisponível"}</div>
              : v === "foto" && !fotoUrl(sel) ? <div style={{ width: 110, height: formato === "9:16" ? 196 : 138, border: "1px dashed #ffffff30", display: "grid", placeItems: "center", fontFamily: T.fm, fontSize: 9, color: T.muted }}>Escolha em Minhas fotos</div>
                : <Mini c={c} formato={formato} brand={brand} variante={v} foto={fotoUrl(sel)} width={110} />}
            <button style={{ ...btn(T.cyan, varDe(sel) === v, dis), marginTop: 4 }} disabled={dis} onClick={() => setVariantes(m => ({ ...m, [sel]: v }))}>{v === "sem" ? "SEM IMAGEM" : v === "ilustracao" ? "ILUSTRAÇÃO" : v === "foto" ? "FOTO MINHA" : "GERADA"}</button>
          </div>; })}
      </div>
      <button style={{ ...btn(T.gold), marginTop: 8 }} onClick={() => setFotosOpen(o => !o)}>MINHAS FOTOS</button>
      {fotosOpen && <div style={{ border: "1px solid #ffffff20", padding: 8, marginTop: 6 }}>
        <div style={{ fontSize: 11, color: T.amber, marginBottom: 6 }}>{AVISO_FOTO}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <select style={{ ...input, width: 160 }} value={rotulo} onChange={e => setRotulo(e.target.value)} aria-label="O que aparece na foto">{ROTULOS_FOTO.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && enviarFoto(e.target.files[0])} style={{ fontSize: 11 }} />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>{fotos.map(f => <button key={f.id} onClick={() => usarFoto(f)} style={{ padding: 0, border: `1px solid ${fotoDe[sel] === f.id ? T.cyan : "#ffffff20"}`, background: "none", cursor: "pointer" }}>
          {f.signed ? <img src={f.signed} alt={`Foto: ${f.rotulo}`} style={{ width: 64, height: 64, objectFit: "cover", display: "block" }} /> : <span style={{ fontSize: 9 }}>{f.rotulo}</span>}</button>)}</div>
      </div>}

      <span style={lbl}>ÍCONE ({ICONE_NOME[c.icone]}) · ALTERNATIVAS</span>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[c.icone, ...alternativasIcone(c.icone, `${sub.titulo} ${sub.mito ?? ""}`)].map(i => <button key={i} title={ICONE_NOME[i]} onClick={() => upd({ icone: i })} style={{ width: 54, height: 54, padding: 4, background: T.bg, border: `1px solid ${c.icone === i ? T.cyan : "#ffffff15"}`, cursor: "pointer" }}><KitIcon id={i} cor={brand.cor_primaria} acento={brand.cor_secundaria} size={44} /></button>)}
        <select style={{ ...input, width: 140 }} value="" onChange={e => e.target.value && upd({ icone: e.target.value as Icone })} aria-label="Todos os ícones"><option value="">Todos…</option>{ICONES.map(i => <option key={i} value={i}>{ICONE_NOME[i]}</option>)}</select>
      </div>

      <label><span style={lbl}>TEXTO PRINCIPAL (ATÉ 12 PALAVRAS)</span><input style={input} value={c.principal} onChange={e => upd({ principal: e.target.value })} /></label>
      {c.secundario != null && <label><span style={lbl}>TEXTO SECUNDÁRIO (ATÉ 25)</span><input style={input} value={c.secundario ?? ""} onChange={e => upd({ secundario: e.target.value })} /></label>}
      {c.esquerda != null && <label><span style={lbl}>{c.papel === "dizer" ? "O QUE DIZER" : "MITO / O QUE DIZEM"}</span><input style={input} value={c.esquerda ?? ""} onChange={e => upd({ esquerda: e.target.value })} /></label>}
      {c.direita != null && <label><span style={lbl}>VERDADE / ESTUDOS</span><input style={input} value={c.direita ?? ""} onChange={e => upd({ direita: e.target.value })} /></label>}
      {(c.papel === "prova" || /\d/.test(c.principal)) && <label><span style={lbl}>PROVA DE APOIO (OBRIGATÓRIA PARA NÚMERO)</span>
        <select style={input} value={c.prova ? sub.provas.indexOf(sub.provas.find(p => p.referencia === c.prova!.referencia)!) : -1} onChange={e => { const p = sub.provas[+e.target.value] ?? null; upd({ prova: p, selo: p?.selo ?? null, fonte: p ? `Fonte: ${p.referencia}` : null }); }}>
          <option value={-1}>Nenhuma</option>{sub.provas.map((p, i) => <option key={i} value={i}>{p.selo}</option>)}</select></label>}
      {c.prova && <button style={{ ...btn(T.gold), marginTop: 6 }} onClick={() => setGaveta([c.prova!])}>VER PROVA</button>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <label><span style={lbl}>FORMATO</span><select style={input} value={formato} onChange={e => setFormato(e.target.value as Formato)}><option>9:16</option><option>4:5</option><option>1:1</option></select></label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 18, fontSize: 11 }}><input type="checkbox" checked={c.mostrarSelo !== false} onChange={e => upd({ mostrarSelo: e.target.checked })} />Selo</label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 18, fontSize: 11 }}><input type="checkbox" checked={c.mostrarHandle !== false} onChange={e => upd({ mostrarHandle: e.target.checked })} />@</label>
      </div>
      <label><span style={lbl}>TEXTO ALTERNATIVO</span><input style={input} value={c.alt} onChange={e => upd({ alt: e.target.value })} /></label>
      {(c.papel === "ressalva" || !!sub.ressalva_obrigatoria) && <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Cores: brand kit ({brand.cor_primaria} / {brand.cor_secundaria}).</div>}

      <span style={lbl}>CHECKLIST ANTES DE EXPORTAR</span>
      {ck.map(x => <div key={x.item} style={{ fontSize: 11, color: x.ok ? T.green : T.amber }}>{x.ok ? "✓" : "!"} {x.item}</div>)}
      {sub.ressalva_obrigatoria && !cards.some(x => x.papel === "ressalva") && <button style={{ ...btn(T.amber), marginTop: 6 }} onClick={() => { const k = montarKit(tema, sub, pacote); const r = k.find(x => x.papel === "ressalva"); if (r) setCards(cs => [...cs, { ...r, idx: cs.length }]); }}>REPOR CARD DE RESSALVA</button>}
      {c.papel === "ressalva" && <button style={{ ...btn(T.red), marginTop: 6, marginLeft: 6 }} onClick={() => { setCards(cs => cs.filter((_, i) => i !== sel).map((x, i) => ({ ...x, idx: i }))); setSel(0); }}>REMOVER CARD</button>}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <button style={btn(T.gold)} disabled={!!busy} onClick={baixarCard}>{busy === "png" ? "..." : "BAIXAR CARD (PNG)"}</button>
        <button style={btn(T.gold, true, !ver?.exporta)} disabled={!!busy} onClick={baixarKit}>{busy === "zip" ? "MONTANDO..." : "BAIXAR KIT (ZIP)"}</button>
        <button style={btn(T.cyan, true)} disabled={!!busy || !uid} onClick={salvar}>{busy === "salvar" ? "..." : "SALVAR EM MEUS CARDS"}</button>
      </div>
    </div>}

    <div style={{ background: T.s2, padding: 12, marginTop: 10, fontSize: 12 }}>
      <div style={{ fontFamily: T.fm, fontSize: 10, color: T.gold, marginBottom: 6 }}>DICAS</div>
      {d.proprias.map((x, i) => <div key={i}>• {x}</div>)}
      <div style={{ marginTop: 6 }}>• {d.quando}</div>
      {d.blocos.map((x, i) => <div key={i} style={{ color: T.cyan }}>• {x}</div>)}
      {d.falar && <div style={{ marginTop: 6 }}><span style={{ color: T.green }}>Fale: </span>{d.falar}</div>}
      {d.naoDizer.length > 0 && <div><span style={{ color: T.red }}>Não diga: </span>{d.naoDizer.join(" · ")}</div>}
    </div>

    {gaveta && <div role="dialog" aria-label="Provas" onClick={() => setGaveta(null)} style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 10002, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(440px,100%)", background: T.bg, borderLeft: `1px solid ${T.gold}`, padding: 16, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 18 }}>Provas</div><button style={btn(T.muted)} onClick={() => setGaveta(null)}>FECHAR</button></div>
        {ordenarProvas(gaveta).map((p, i) => <div key={i} style={{ borderTop: "1px solid #ffffff15", padding: "10px 0", fontSize: 12 }}>
          <div style={{ fontFamily: T.fm, fontSize: 10, color: p.nivel === "primaria" ? T.green : T.amber }}>{p.selo} · {p.nivel === "primaria" ? "PRIMÁRIA" : "SECUNDÁRIA · CONFERIR NO ORIGINAL"}</div>
          <div style={{ margin: "4px 0" }}>{p.referencia}</div>
          <div style={{ color: T.muted }}>Tipo: {p.tipo_fonte.replace(/_/g, " ")}</div>
          {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ color: T.cyan }}>Abrir fonte ↗</a>}
          {p.limites && <div style={{ marginTop: 6, border: `1px solid ${T.amber}`, padding: 6, color: T.amber }}>LIMITES: {p.limites}</div>}
        </div>)}
      </div>
    </div>}

    {zoom != null && cards[zoom] && <div role="dialog" aria-label="Card em tela cheia" onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "#000e", zIndex: 10002, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
      onTouchStart={e => (touch.current = e.touches[0].clientX)} onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 60) { e.stopPropagation(); setZoom(z => Math.max(0, Math.min(cards.length - 1, (z ?? 0) + (dx < 0 ? 1 : -1)))); } touch.current = null; }}>
      <button style={btn(T.cyan)} onClick={e => { e.stopPropagation(); setZoom(z => Math.max(0, (z ?? 0) - 1)); }} aria-label="Anterior">←</button>
      <div onClick={e => e.stopPropagation()}><Mini c={cards[zoom]} formato={formato} brand={brand} variante={varDe(zoom)} foto={fotoUrl(zoom)} width={Math.min(window.innerWidth - 120, (window.innerHeight - 40) * FORMATOS[formato].w / FORMATOS[formato].h)} /></div>
      <button style={btn(T.cyan)} onClick={e => { e.stopPropagation(); setZoom(z => Math.min(cards.length - 1, (z ?? 0) + 1)); }} aria-label="Próximo">→</button>
    </div>}

    {render && <div style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }} aria-hidden>
      {cards.map((x, i) => <KitCardView key={i} ref={el => (stage.current[i] = el)} c={x} formato={formato} brand={brand} variante={varDe(i)} fotoUrl={fotoUrl(i)} />)}
    </div>}
  </div>;
}

export { KitCardView, Mini as KitMini };
