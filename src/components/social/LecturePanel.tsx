// Kit de Palestra — formulário estruturado (tema, domínios, público, nível,
// tom, duração, método MCE) que devolve um roteiro slide a slide, editável,
// com barra de tempo, modo ensaio e exportação PPTX/PDF.
import { useCallback, useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, Copy, Copy as CopyIcon, Download, FileText, Loader2, Mic2,
  Pencil, Play, Plus, RefreshCw, Sparkles, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT, ACCENT2, Section, copyText } from "./socialUi";
import LectureRehearsal from "./LectureRehearsal";
import {
  LectureKit, LectureSlide, SLIDE_TYPES, SlideType, TYPE_COLOR, TYPE_LABEL,
  exportPdf, exportPptx, fullText, normalizeKit, normalizeSlide, slidesText,
  speakerText, timeByType, totalMinutes,
} from "@/lib/lectureKit";

type Domain =
  | "treino" | "nutricao" | "farmacologia" | "comportamento" | "mentalidade"
  | "mce" | "suplementacao" | "recuperacao" | "fisiologia";

const DOMAIN_LABELS: Record<Domain, string> = {
  treino: "🏋️ Treino",
  nutricao: "🥩 Nutrição",
  farmacologia: "💊 Farmacologia",
  comportamento: "🔁 Comportamento",
  mentalidade: "🧠 Mentalidade",
  mce: "⚡ MCE",
  suplementacao: "🧪 Suplementação",
  recuperacao: "🛌 Recuperação",
  fisiologia: "🫀 Fisiologia",
};

/** Termo de busca + área do pubmed-live por domínio — o tema entra na frente. */
const DOMAIN_SEARCH: Record<Domain, { area: string; base: string }> = {
  treino: { area: "hipertrofia", base: "progressive overload training volume resistance training hypertrophy" },
  nutricao: { area: "nutricao", base: "protein intake muscle protein synthesis bodybuilding nutrition" },
  farmacologia: { area: "", base: "anabolic androgenic steroids muscle hypertrophy performance systematic review" },
  comportamento: { area: "", base: "habit formation behavior change adherence exercise nutrition" },
  mentalidade: { area: "", base: "self-efficacy growth mindset motivation adherence health behavior" },
  mce: { area: "", base: "behavior change mindset self-efficacy implementation intentions adherence" },
  suplementacao: { area: "", base: "creatine caffeine beta-alanine supplementation performance meta-analysis" },
  recuperacao: { area: "", base: "sleep recovery muscle damage recovery strategies athletes" },
  fisiologia: { area: "", base: "skeletal muscle physiology mechanotransduction energy metabolism exercise" },
};

const AUDIENCES = [
  "Graduandos Ed. Física", "Personal Trainers", "Nutricionistas",
  "Atletas", "Público geral", "Empresários fitness", "Outro",
];
const LEVELS = ["Leigo", "Intermediário", "Avançado"];
const TONES = ["Científico-prático", "Motivacional-técnico", "Acadêmico", "Direto e provocativo"];

const selectStyle = { borderColor: `${ACCENT}44`, background: "#0b0b12", color: "#F5F0E8" };

const LecturePanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [topic, setTopic] = useState("Bodybuilding — treino, nutrição e farmacologia baseados em evidência");
  const [domains, setDomains] = useState<Domain[]>(["treino", "nutricao", "farmacologia"]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [audienceOther, setAudienceOther] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [tone, setTone] = useState(TONES[0]);
  const [duration, setDuration] = useState(25);
  const [includeMce, setIncludeMce] = useState(true);

  const [stage, setStage] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [kit, setKit] = useState<LectureKit | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [regenId, setRegenId] = useState<string | null>(null);
  const [rehearse, setRehearse] = useState(false);

  const handle = String(ctx?.handle || "diogo.mell0");
  const toggleDomain = (d: Domain) =>
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const audienceFinal = audience === "Outro" ? (audienceOther.trim() || "Público geral") : audience;

  const buildScience = useCallback(async () => {
    const parts = await Promise.all(
      domains.map(async (d) => {
        const cfg = DOMAIN_SEARCH[d];
        const { data, error } = await supabase.functions.invoke("pubmed-live", {
          body: { searchTerm: `${topic} ${cfg.base}`, area: cfg.area || undefined, recency: "ano" },
        });
        if (error || (data as { error?: string })?.error) return "";
        const d2 = data as { rawStudies?: string; analysis?: string };
        return `--- ${DOMAIN_LABELS[d]} ---\n${d2.rawStudies || ""}\n${d2.analysis || ""}`;
      }),
    );
    return parts.filter(Boolean).map((p) => p.slice(0, 6000)).join("\n\n");
  }, [domains, topic]);

  const gerar = async () => {
    if (!topic.trim() || !domains.length) {
      toast.error("Preencha o tema e escolha pelo menos um domínio.");
      return;
    }
    setKit(null);
    setErro(null);
    try {
      setStage("Buscando evidência científica real por domínio…");
      const scienceContext = await buildScience();
      if (!scienceContext) {
        toast.warning("Sem achados científicos agora — o roteiro sai em cima de consenso estabelecido, sem citação específica.");
      }

      setStage("Gerando kit de palestra… Isso pode levar até 1 minuto.");
      const body = {
        topic, domains, durationMinutes: duration, scienceContext,
        audience: audienceFinal, level, tone, includeMce, ...ctx,
      };

      let data: unknown = null;
      let lastErr: string | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await supabase.functions.invoke("lecture-kit-generate", { body });
        const payloadErr = (res.data as { error?: string } | null)?.error;
        if (!res.error && !payloadErr) { data = res.data; lastErr = null; break; }
        lastErr = payloadErr || res.error?.message || "falha desconhecida";
        if (attempt === 0) {
          setStage("Tentando de novo…");
          await new Promise((r) => setTimeout(r, 2500));
          setStage("Gerando kit de palestra… Isso pode levar até 1 minuto.");
        }
      }
      if (lastErr || !data) throw new Error(lastErr || "sem resposta");

      setKit(normalizeKit((data as { result: unknown }).result, { handle }));
      toast.success("Kit de palestra pronto!");
    } catch (e) {
      console.error("[LecturePanel] gerar", e);
      const msg = "Não foi possível gerar o kit. Tente novamente em alguns segundos.";
      setErro(msg);
      toast.error(msg);
    } finally {
      setStage(null);
    }
  };

  // ---- Ações por slide -----------------------------------------------------
  const patch = (id: string, up: Partial<LectureSlide>) =>
    setKit((k) => (k ? { ...k, slides: k.slides.map((s) => (s.id === id ? { ...s, ...up } : s)) } : k));

  const move = (id: string, dir: -1 | 1) =>
    setKit((k) => {
      if (!k) return k;
      const idx = k.slides.findIndex((s) => s.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= k.slides.length) return k;
      const slides = [...k.slides];
      [slides[idx], slides[to]] = [slides[to], slides[idx]];
      return { ...k, slides };
    });

  const duplicate = (id: string) =>
    setKit((k) => {
      if (!k) return k;
      const idx = k.slides.findIndex((s) => s.id === id);
      if (idx < 0) return k;
      const copy = { ...k.slides[idx], id: Math.random().toString(36).slice(2, 10) };
      const slides = [...k.slides];
      slides.splice(idx + 1, 0, copy);
      return { ...k, slides };
    });

  const remove = (id: string) =>
    setKit((k) => (k ? { ...k, slides: k.slides.filter((s) => s.id !== id) } : k));

  const regenerate = async (slide: LectureSlide) => {
    if (!kit) return;
    setRegenId(slide.id);
    try {
      const outline = kit.slides.map((s, i) => `${i + 1}. [${s.tipo}] ${s.titulo}`).join("\n");
      const { data, error } = await supabase.functions.invoke("lecture-kit-generate", {
        body: {
          mode: "slide", topic, domains, durationMinutes: duration,
          audience: audienceFinal, level, tone, includeMce, outline,
          slide: {
            numero: kit.slides.findIndex((s) => s.id === slide.id) + 1,
            tipo: slide.tipo, bloco: slide.bloco, titulo_slide: slide.titulo,
            bullets: slide.bullets, fala_do_palestrante: slide.fala, tempo_min: slide.tempoMin,
          },
          ...ctx,
        },
      });
      const payloadErr = (data as { error?: string } | null)?.error;
      if (error || payloadErr) throw new Error(payloadErr || error?.message);
      const fresh = normalizeSlide((data as { result: unknown }).result, 0, 1);
      patch(slide.id, { ...fresh, id: slide.id, tipo: slide.tipo });
      toast.success("Slide regenerado.");
    } catch (e) {
      console.error("[LecturePanel] regenerate", e);
      toast.error("Não foi possível regenerar este slide. Tente novamente.");
    } finally {
      setRegenId(null);
    }
  };

  const addSlide = () =>
    setKit((k) =>
      k
        ? {
            ...k,
            slides: [...k.slides, {
              id: Math.random().toString(36).slice(2, 10), tipo: "CONTEUDO" as SlideType,
              bloco: "GERAL", titulo: "Novo slide", bullets: [], fala: "", tempoMin: 2, referencia: "",
            }],
          }
        : k,
    );

  // ---- Barra de tempo ------------------------------------------------------
  const total = kit ? totalMinutes(kit.slides) : 0;
  const diff = total - duration;
  const dist = useMemo(() => (kit ? timeByType(kit.slides) : []), [kit]);

  const exportar = async (kind: "pptx" | "pdf") => {
    if (!kit) return;
    try {
      setStage(kind === "pptx" ? "Montando PowerPoint…" : "Montando PDF…");
      if (kind === "pptx") await exportPptx(kit, handle);
      else await exportPdf(kit, handle);
      toast.success(kind === "pptx" ? "PowerPoint baixado." : "PDF baixado.");
    } catch (e) {
      console.error("[LecturePanel] export", e);
      toast.error("Não foi possível gerar o arquivo. Tente novamente.");
    } finally {
      setStage(null);
    }
  };

  return (
    <div className="space-y-4">
      <Section title="🎤 Kit de Palestra">
        <p className="text-sm text-muted-foreground">
          Roteiro completo pra apresentar ao vivo: slide a slide, com a fala do palestrante, tempo estimado
          e evidência científica real (busca ao vivo). Exporta em PowerPoint e PDF.
        </p>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          placeholder="Tema da palestra — ex: Bodybuilding natural x farmacológico, hipertrofia baseada em evidência…"
          className="w-full rounded-md p-2 text-sm bg-transparent border"
          style={{ borderColor: `${ACCENT}44` }}
        />

        <div className="flex flex-wrap gap-2">
          {(Object.keys(DOMAIN_LABELS) as Domain[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDomain(d)}
              className="px-3 py-1.5 rounded-full text-xs border transition-colors"
              style={{
                borderColor: domains.includes(d) ? ACCENT : "rgba(255,255,255,0.12)",
                background: domains.includes(d) ? `${ACCENT}22` : "transparent",
                color: domains.includes(d) ? ACCENT : undefined,
              }}
            >
              {DOMAIN_LABELS[d]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Público-alvo</span>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-md p-2 text-sm border" style={selectStyle}>
              {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Nível do público</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-md p-2 text-sm border" style={selectStyle}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          {audience === "Outro" && (
            <input
              value={audienceOther}
              onChange={(e) => setAudienceOther(e.target.value)}
              placeholder="Descreva o público"
              className="col-span-2 rounded-md p-2 text-sm bg-transparent border"
              style={{ borderColor: `${ACCENT}44` }}
            />
          )}
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Tom da palestra</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-md p-2 text-sm border" style={selectStyle}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Duração alvo (min)</span>
            <input
              type="number" min={5} max={120} value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 25)}
              className="w-full rounded-md p-2 text-sm bg-transparent border" style={{ borderColor: `${ACCENT}44` }}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIncludeMce((v) => !v)}
          className="w-full flex items-center justify-between rounded-lg px-3 py-2 border text-sm"
          style={{ borderColor: includeMce ? ACCENT : "rgba(255,255,255,0.12)", background: includeMce ? `${ACCENT}12` : "transparent" }}
        >
          <span>Incluir Método MCE (Mentalidade · Comportamento · Execução)</span>
          <span className="w-10 h-5 rounded-full relative transition-colors" style={{ background: includeMce ? ACCENT : "rgba(255,255,255,0.15)" }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: includeMce ? 22 : 2 }} />
          </span>
        </button>

        <button
          type="button"
          onClick={gerar}
          disabled={!!stage}
          className="w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: ACCENT, color: "#020205", opacity: stage ? 0.7 : 1 }}
        >
          {stage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {stage || "Gerar kit de palestra"}
        </button>
        {stage && <p className="text-xs text-muted-foreground text-center">Gerando kit de palestra… Isso pode levar até 1 minuto.</p>}
        {erro && !stage && (
          <div className="rounded-lg p-3 text-sm space-y-2 border" style={{ borderColor: "#EF444455", background: "#EF444412" }}>
            <p>{erro}</p>
            <button type="button" onClick={gerar} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ background: ACCENT, color: "#020205" }}>
              Tentar novamente
            </button>
          </div>
        )}
      </Section>

      {kit && (
        <>
          <Section title="⏱️ Tempo do roteiro">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{total} min estimados</span>
              <span className="text-muted-foreground text-xs">alvo {duration} min</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.08)" }}>
              {dist.map(([tipo, min]) => (
                <div key={tipo} title={`${TYPE_LABEL[tipo]} · ${min} min`} style={{ width: `${(min / Math.max(total, duration)) * 100}%`, background: TYPE_COLOR[tipo] }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              {dist.map(([tipo, min]) => (
                <span key={tipo} className="flex items-center gap-1 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[tipo] }} />
                  {TYPE_LABEL[tipo]} {min}min
                </span>
              ))}
            </div>
            {diff > 2 && (
              <p className="text-xs rounded-md p-2" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
                Roteiro está {diff} min acima do alvo — considere remover {Math.max(1, Math.round(diff / 3))} slide(s) de conteúdo.
              </p>
            )}
            {diff < -3 && (
              <p className="text-xs rounded-md p-2" style={{ background: `${ACCENT2}18`, color: ACCENT2 }}>
                Roteiro está {Math.abs(diff)} min abaixo do alvo — dá pra abrir mais um bloco de conteúdo ou interação.
              </p>
            )}
          </Section>

          <Section
            title="📋 Roteiro"
            right={
              <button type="button" onClick={() => setRehearse(true)} className="h-7 px-2 rounded-md text-[11px] flex items-center gap-1 font-semibold" style={{ background: ACCENT, color: "#020205" }}>
                <Play className="w-3 h-3" /> Ensaiar
              </button>
            }
          >
            <p className="text-lg font-bold">{kit.titulo}</p>
            {kit.subtitulo && <p className="text-sm text-muted-foreground">{kit.subtitulo}</p>}
            {kit.ganchoAbertura && (
              <div className="rounded-lg p-3 text-sm" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Mic2 className="w-3 h-3" /> Gancho de abertura
                </p>
                {kit.ganchoAbertura}
              </div>
            )}
            {!!kit.agenda.length && (
              <div className="text-sm space-y-1">{kit.agenda.map((a, i) => <p key={i}>• {a}</p>)}</div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button" onClick={() => exportar("pptx")} className="py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1" style={{ background: ACCENT, color: "#020205" }}>
                <Download className="w-3 h-3" /> PowerPoint (.pptx)
              </button>
              <button type="button" onClick={() => exportar("pdf")} className="py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 border" style={{ borderColor: `${ACCENT}55`, color: ACCENT }}>
                <FileText className="w-3 h-3" /> PDF do roteiro
              </button>
              <button type="button" onClick={() => copyText(speakerText(kit))} className="py-2 rounded-md text-xs flex items-center justify-center gap-1 border" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                <CopyIcon className="w-3 h-3" /> Copiar fala
              </button>
              <button type="button" onClick={() => copyText(slidesText(kit))} className="py-2 rounded-md text-xs flex items-center justify-center gap-1 border" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                <CopyIcon className="w-3 h-3" /> Copiar slides
              </button>
            </div>
            <button type="button" onClick={() => copyText(fullText(kit))} className="text-[11px] text-muted-foreground hover:text-foreground">
              Copiar roteiro completo
            </button>
          </Section>

          {kit.slides.map((s, i) => {
            const color = TYPE_COLOR[s.tipo];
            const isEditing = editing === s.id;
            return (
              <div key={s.id} className="rounded-xl border overflow-hidden" style={{ borderColor: `${color}44`, background: `${color}08`, borderLeft: `4px solid ${color}` }}>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black" style={{ color: `${color}66` }}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color, background: `${color}1A` }}>
                        {TYPE_LABEL[s.tipo]}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">{s.tempoMin} min</span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <input value={s.titulo} onChange={(e) => patch(s.id, { titulo: e.target.value })} className="w-full rounded-md p-2 text-sm bg-transparent border" style={{ borderColor: `${color}44` }} />
                      <textarea
                        value={s.bullets.join("\n")}
                        onChange={(e) => patch(s.id, { bullets: e.target.value.split("\n").filter(Boolean).slice(0, 4) })}
                        rows={4}
                        placeholder="Um bullet por linha (máx. 4)"
                        className="w-full rounded-md p-2 text-sm bg-transparent border"
                        style={{ borderColor: `${color}44` }}
                      />
                      <textarea value={s.fala} onChange={(e) => patch(s.id, { fala: e.target.value })} rows={5} placeholder="Fala do palestrante" className="w-full rounded-md p-2 text-sm bg-transparent border" style={{ borderColor: `${color}44` }} />
                      <div className="flex flex-wrap gap-2 items-center">
                        <select value={s.tipo} onChange={(e) => patch(s.id, { tipo: e.target.value as SlideType })} className="rounded-md p-1.5 text-xs border" style={selectStyle}>
                          {SLIDE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                        </select>
                        <input type="number" min={1} max={20} value={s.tempoMin} onChange={(e) => patch(s.id, { tempoMin: Math.max(1, Number(e.target.value) || 1) })} className="w-16 rounded-md p-1.5 text-xs bg-transparent border text-center" style={{ borderColor: `${color}44` }} />
                        <input value={s.referencia} onChange={(e) => patch(s.id, { referencia: e.target.value })} placeholder="Referência (autor, ano)" className="flex-1 min-w-[140px] rounded-md p-1.5 text-xs bg-transparent border" style={{ borderColor: `${color}44` }} />
                        <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ background: color, color: "#020205" }}>Concluir</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold">{s.titulo}</p>
                      {!!s.bullets.length && (
                        <ul className="text-sm space-y-0.5 list-disc pl-4">{s.bullets.map((b, bi) => <li key={bi}>{b}</li>)}</ul>
                      )}
                      {s.referencia && <p className="text-xs" style={{ color: ACCENT2 }}>🔬 {s.referencia}</p>}
                    </>
                  )}
                </div>

                {s.fala && !isEditing && (
                  <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", borderTop: `1px solid ${color}22` }}>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">🎙️ Fala do palestrante</p>
                    <p className="text-xs italic text-muted-foreground whitespace-pre-wrap">{s.fala}</p>
                  </div>
                )}

                <div className="flex items-center gap-1 px-3 py-2 flex-wrap" style={{ borderTop: `1px solid ${color}22` }}>
                  <IconBtn label="Editar" onClick={() => setEditing(isEditing ? null : s.id)}><Pencil className="w-3 h-3" /></IconBtn>
                  <IconBtn label="Subir" onClick={() => move(s.id, -1)}><ArrowUp className="w-3 h-3" /></IconBtn>
                  <IconBtn label="Descer" onClick={() => move(s.id, 1)}><ArrowDown className="w-3 h-3" /></IconBtn>
                  <IconBtn label="Duplicar" onClick={() => duplicate(s.id)}><Copy className="w-3 h-3" /></IconBtn>
                  <IconBtn label={regenId === s.id ? "Gerando…" : "Regenerar"} onClick={() => regenerate(s)} disabled={regenId === s.id}>
                    <RefreshCw className={`w-3 h-3 ${regenId === s.id ? "animate-spin" : ""}`} />
                  </IconBtn>
                  <IconBtn label="Excluir" onClick={() => remove(s.id)} danger><Trash2 className="w-3 h-3" /></IconBtn>
                </div>
              </div>
            );
          })}

          <button type="button" onClick={addSlide} className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1 border border-dashed text-muted-foreground hover:text-foreground" style={{ borderColor: `${ACCENT}44` }}>
            <Plus className="w-3 h-3" /> Adicionar slide
          </button>

          {!!kit.citacoes.length && (
            <Section title="🔬 Fontes citadas">
              {kit.citacoes.map((c, i) => <p key={i} className="text-xs text-muted-foreground">• {c}</p>)}
            </Section>
          )}
        </>
      )}

      {rehearse && kit && <LectureRehearsal kit={kit} target={duration} onClose={() => setRehearse(false)} />}
    </div>
  );
};

const IconBtn = ({ label, onClick, children, danger, disabled }: {
  label: string; onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className="h-7 px-2 rounded-md text-[11px] flex items-center gap-1 border transition-colors disabled:opacity-50"
    style={{ borderColor: "rgba(255,255,255,0.1)", color: danger ? "#EF4444" : "rgba(255,255,255,0.65)" }}
  >
    {children} {label}
  </button>
);

export default LecturePanel;
